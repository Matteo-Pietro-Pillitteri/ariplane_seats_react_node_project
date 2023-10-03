'use strict';

const express = require('express');
const morgan = require('morgan');
const { check, validationResult } = require('express-validator');
const dao = require('./dao');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const userDao = require('./user_dao');
const cors = require('cors');


// with localStrategy, passport knows the strategy of the authentication
passport.use(new LocalStrategy(
  function (username, password, done) { // verify that username and password are valid
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });

      return done(null, user); // user is an object cotaining information about the currently validated user
    })
  }
));


passport.serializeUser((user, done) => {
  done(null, user.id); // user.id is the  information associated with the unique session identifier 
});


passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user);
    }).catch(err => {
      done(err, null);
    });
});


// init express
const app = express();
const port = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {  // it's mandatory in order to allow browser to send cookies
  origin: 'http://localhost:5173',
  credentials: true,
};

//Enable cors requests
app.use(cors(corsOptions));

const delay = 150;


//function that checks if the user is authenticated
const isLoggedIn = (req, res, next) => {

  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'Not authenticated' });
}

// set up the session
app.use(session({
  secret: 'msdlp2901ms8aomeor',
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());


/*** APIs. Note:  APIs with isLoggedIn are those that require a valid session identifier  ***/

// the new reservation will have the user id of the authenticated user
app.post('/api/reservations', isLoggedIn, [
  check('seats').isArray({ min: 1 }).withMessage("the reservation must include at least one seat."),
  check('seats.*.row').isInt({ min: 1 }).withMessage("invalid row."),
  check('seats.*.seat').isInt({ min: 1 }).withMessage("invalid seat."),
  check('planeId').isInt({ min: 1 }).withMessage("invalid plane")], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const resultPlane = await dao.getPlane(req.body.planeId);
      if (resultPlane.error) return res.status(404).json(resultPlane); //planeId does not exist

      // if resultPlane doesn't return then  listReservationsByPlane is called. So the plane  with planeId === req.body.id exits
      const result = await dao.listReservationsByPlane(resultPlane.id);

      //check if the user already has a reservation for that plane
      if (result.some(reservation => reservation.userId === req.user.id)) return res.status(400).json({ error: "...it looks like you already have a reservation in this plane" }); 

      // check that the number of places requested does not exceed the number of available seats in the plane
      const planeCapacity = resultPlane.f * resultPlane.p;
      if (req.body.seats.length > (planeCapacity - resultPlane.booked)) return res.status(406).json({ error: "...Seats not available." });

      //row number and seat number must exist in the aircraft: if any of the requested seats is not compliant with the aircraft, the reservation fails
      if (req.body.seats.some(newReservation => newReservation.row > resultPlane.f || newReservation.seat > resultPlane.p)) return res.status(422).json({ error: "...one or more seats are not compliant with the aircraft." });

      // check  that the requested seats are actually free
      if (req.body.seats.some(newReservation => result.some(currentRes => newReservation.row === currentRes.row && newReservation.seat === currentRes.seat))) {
        const conflictSeats = req.body.seats.filter((rs) => result.some(currentRes => rs.row === currentRes.row && rs.seat === currentRes.seat));
        return res.status(400).json({ error: "...one or more of the requested seats are not available.", conflictSeats: conflictSeats });
      }

      const done = [];
      for (const rs of req.body.seats) {

        const newReservation = {
          row: rs.row,
          seat: rs.seat,
          userId: req.user.id,  // for de userIs the only option is to take it from req.user.id
          planeId: req.body.planeId,
        };

        const reservationId = await dao.createReservation(newReservation);
        done.push(reservationId);
      }
      setTimeout(() => res.status(201).json(done), delay);

    } catch {
      res.status(503).json({ error: `Error during the creation of reservation of userId: ${req.user.id} for planeId: ${req.body.planeId}.` });
    }
  });


app.delete('/api/reservations/:planeId', isLoggedIn, [
  check('planeId').isInt({ min: 1 })], async (req, res) => {
    try {

      const userReservation = await dao.getUserReservationByPlane(req.params.planeId, req.user.id);
      if (userReservation.error) return res.status(404).json(userReservation); //planeId does not exist or user does not have a reservation in that plane

      const numRowChanges = await dao.deleteBookedSeats(req.params.planeId, req.user.id); //  req.user.id is the only option for identify the user!
      //number of changed rows is sent to client as an indicotor of success 
      setTimeout(() => res.json(numRowChanges), delay);
    } catch (err) {
      res.status(503).json({ error: `Database error during the deletion of reservation of ${req.used.id}.` })
    }
  })


//GET /api/planes/<id>
app.get('/api/planes/:id', async (req, res) => {

  try {
    const resultPlane = await dao.getPlane(req.params.id);
    if (resultPlane.error)
      res.status(404).json(resultPlane);
    else {

      // if resultPlane doesn't return then  listReservationsByPlane is called. So the plane  with planeId === req.params.id exits
      const result = await dao.listReservationsByPlane(req.params.id);

      const returnReservation = {
        reservations: result
      };
      
      Object.assign(resultPlane, returnReservation)
      setTimeout(() => res.json(resultPlane), delay);

    }
  } catch (err) {
    res.status(500).end();
  }
});


//GET /api/planes
app.get('/api/planes', (req, res) => {
  dao.listPlanesWithInfo()
    .then(planes => setTimeout(() => res.json(planes), delay))
    .catch(() => res.status(500).end());
})


/*** Users APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {

      return res.status(401).json(info);
    }

    req.login(user, (err) => {
      if (err)
        return next(err);

      return res.json(req.user);
    });
  })(req, res, next);
});


// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => { res.end(); });
});


// GET /sessions/current
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) res.status(200).json(req.user);
  else res.status(401).json({ error: 'Unauthenticated user!' });
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

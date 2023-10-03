'use strict';
/* Data Access Object (DAO) module  */

const sqlite = require('sqlite3');

const db = new sqlite.Database('my_db.sqlite', (err) => {
  if (err) throw err;
});



//get all planes with info added by reservation table
exports.listPlanesWithInfo = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT planes.*, COUNT(reservation.id) AS booked_seats FROM planes LEFT JOIN reservation ON planes.id = reservation.planeId GROUP BY planes.id';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const planes = rows.map((p) => ({ id: p.id, name: p.name, type: p.type, f: p.F, p: p.P, booked: p.booked_seats }));
      resolve(planes);
    });
  });
};



//get plane by id with the information related to the booked seats for that plane
exports.getPlane = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT planes.*, COUNT(reservation.id) AS booked_seats FROM planes left join reservation on planes.id = reservation.planeId WHERE planes.id= ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row.id === null) {  // check if it is null because if a plane doesn't exist the query return a record with planes' columns with null values and booked_seats = 0 , this is due to left join
        resolve({ error: 'Plane not found.' });
      } else {
        const plane = { id: row.id, name: row.name, type: row.type, f: row.F, p: row.P, booked: row.booked_seats };
        resolve(plane);
      }
    });
  });
};

exports.getUserReservationByPlane = (planeId, userId) =>{
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM reservation WHERE planeId= ? AND userId = ?';
    db.get(sql, [planeId, userId], (err, row) => {
      if(err){
        reject(err);
        return;
      }
      if(row == undefined){
        resolve({error: 'Reservation not found.'});
      }
      else{
        const res = {id: row.id, row: row.id, seat: row.seat, userId: row.userId, planeId: row.planeId};
        resolve(res);
      }
    });
  });
};


exports.listReservationsByPlane = (planeId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT row, seat, userId FROM reservation  WHERE planeId = ?';

    db.all(sql, [planeId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      const reservations = rows.map((r) => ({ row: r.row, seat: r.seat, userId: r.userId }));

      resolve(reservations);
    });
  });
};


// create reservation
exports.createReservation = (reservation) =>{
  return new Promise ((resolve, reject) => {
    const sql = 'INSERT INTO reservation(row, seat, userId, planeId) VALUES(?, ?, ?, ?)';
    db.run(sql, [reservation.row, reservation.seat, reservation.userId, reservation.planeId],function(err) {
      if(err){
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};


//delete an existing reservation
  exports.deleteBookedSeats = (planeId, userId) =>{
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM reservation WHERE planeId = ? AND userId = ?';
      db.run(sql, [planeId, userId], function(err) {
        if(err){
          reject(err);
          return;
        }
        resolve(this.changes); // return the number of affected rows
      });
    });
  };

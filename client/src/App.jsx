import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react'
import { BrowserRouter, Link, Route, Routes, Navigate } from 'react-router-dom'
import { Button, Alert, Col, Modal } from 'react-bootstrap'
import { ReservationRoute, LoadingContent } from './components/ReservationRoutes';
import { MyNavbar } from './components/NavigationComponents';
import LoginForm from './components/LoginForm';
import HomePage from './components/HomePage';
import API from './API';
//import './App.css'

function NoMatch() {

  return (
    <Col className='d-flex justify-content-center '>
      <Alert variant="success" className='w-50'>
        <Alert.Heading>Hey, nice to see you!</Alert.Heading>
        <p>I'm sorry but the requested page cannot be found</p>
        <hr />
        <Link to='/'><Button type="button" variant="primary" size='sm' className='mt-2'>Back home!</Button></Link>
      </Alert>
    </Col>
  );
}


function NotifyError(props) {
  const [show, setShow] = useState(true);

  function handleClose() {
    setShow(false);
    props.setMsg('');
  }

  return (

    <Modal show={show} onHide={handleClose} animation={false} size='sm' >
      <Modal.Header closeButton>
        <Modal.Title>Something went wrong..</Modal.Title>
      </Modal.Header>
      <Modal.Body> {props.message} </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}> Understood </Button>

      </Modal.Footer>
    </Modal>


  );
}


function App() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [dirty, setDirty] = useState(true);
  const [msg, setMsg] = useState('');
  const [planeList, setPlaneList] = useState([]);
  const [plane, setPlane] = useState({});
  const [lastReservation, setLastReservation] = useState([]);
  const [user, setUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(false);
  const [upload, setUpload] = useState(false);
  const [conflict, setConflict] = useState([]);

  function handleError(err) {

    let msg = '';

    if (err.error) msg = err.error;
    else if (err.errors[0]) {
      if (err.errors[0].msg) msg = err.errors[0].msg;
    }
    else if (String(err) === "string") msg = String(err);
    else msg = "Sorry, we are temporarily unavailable";
    setMsg(msg);

    if (err.hasOwnProperty('conflictSeats')) {
      setConflict(err.conflictSeats);
      setTimeout(() => {
        setDirty(true);
        setConflict([]);
      }, 5000)
    } else {
      setTimeout(() => {
        setDirty(true);
      }, 1000);  // Fetch correct version from server, after a while  
    }
  }

  useEffect(() => {

    const checkAuth = async () => {
      try {
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch (err) {
        // user is not yet authenticated
        //handleError(err);
      }
    };
    checkAuth();
  }, []);


  useEffect(() => {
    if (dirty) { // dirty starts "true"   
      API.getPlanesWithMoreInfo()
        .then((planeList) => {
          setPlaneList(planeList);
          setDirty(false);
          setLastReservation([]);
          setUpload(false);
          setInitialLoading(false);

        })
        .catch((err) => handleError(err));

    }
  }, [dirty]);


  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setLastReservation([]);
    setUser(undefined);
  }

  // loginForm props:
  const loginSuccessful = (user) => {
    setUser(user);
    setLoggedIn(true);
    setDirty(true);
  }

  const addReservation = (seats) => {

    setUpload(true);


    API.addReservation(seats, plane.id)
      .then(() => setDirty(true))
      .catch((err) => handleError(err));
  }

  const deleteReservation = (planeId) => { // an user only have one reservation per plane 

    setUpload(true);

    API.deleteReservation(planeId)
      .then(() => setDirty(true))
      .catch((err) => handleError(err));
  }

  return (
    <BrowserRouter>

      <MyNavbar user={user} doLogOut={doLogOut} />
      {msg ? <NotifyError message={msg} setMsg={setMsg} /> : null}
    
      <Routes>
        <Route path='/' element={initialLoading ? <LoadingContent /> : <HomePage planeList={planeList} setInitialLoading={setInitialLoading} />} />

        <Route path='/plane/:planeId' element={<ReservationRoute initialLoading={initialLoading} setInitialLoading={setInitialLoading}
          user={user} loggedIn={loggedIn} addReservation={addReservation} plane={plane} setPlane={setPlane} planeList={planeList}
          lastReservation={lastReservation} setLastReservation={setLastReservation} deleteReservation={deleteReservation} upload={upload}
          conflict={conflict} dirty={dirty} />} />

        <Route path='/login' element={loggedIn ? <Navigate replace to='/' /> : <LoginForm loginSuccessful={loginSuccessful} />} />

        <Route path='*' element={<NoMatch />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

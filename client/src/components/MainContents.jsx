import '../MyStyle.css'
import MyProgressBar from "./MyProgressBar";
import PlaneSeatsForm from "./PlaneSeatsForm";
import { useState } from 'react';
import { Button, Badge, Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import { MdAirlineSeatReclineExtra } from 'react-icons/md';
import { ImWarning } from 'react-icons/im';

function Seat(props) {

  const mapping = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D',
    4: 'E',
    5: 'F'
  };


  return (
    <>
      <Button variant={props.tmp ? "warning" : "light"} disabled={props.booked || !props.loggedIn || props.random}
        onClick={() => props.tmp ? props.setLastReservation((oldList) => oldList.filter(e => !(e.row === props.row && e.seat === props.index + 1)))
          : props.setLastReservation((oldList) => [...oldList, { row: props.row, seat: props.index + 1 }])}>

        <Badge bg={props.booked ? "danger" : "success"} >
          {props.conf ? <ImWarning /> : props.seat}
        </Badge>
      </Button>
      <Badge pill bg={props.booked ? "danger" : "primary"} className='mt-1 w-100'>{mapping[props.index] + props.row}</Badge>
    </>
  );
}


function PlaneMap(props) {
  const rows = [];
  const seats_per_rows = [];
  const [random, setRandom] = useState(false);
  const [operation, setOperation] = useState('');


  function handleRandom() {
    setRandom(true);
    props.setLastReservation([]);
  }

  function handleAddSelected(){
   props.addReservation(props.lastReservation)
   setOperation('book')
  }
  
  function handleRemove(planeId){
    props.deleteReservation(planeId);
    setOperation('delete');
  }


  for (let i = 0; i < props.plane.p; i++) {
    seats_per_rows.push(
      <MdAirlineSeatReclineExtra key={i} />
    )
  }


  for (let i = 1; i < props.plane.f + 1; i++) {
    rows.push(
      <Row key={i} className='d-flex justify-content-center me-5 ms-5 mt-5 mb-5'>
        {seats_per_rows.map((seat, index) =>
          <Col key={seat.key} xs={2} className='d-flex justify-content-center'> 
            <Row className='w-100'>

              <Seat seat={seat} index={index} row={i}
                booked={props.plane.reservations.some(reservation => reservation.row === i && reservation.seat === index + 1)}
                tmp={props.lastReservation.some(reservation => reservation.row === i && reservation.seat === index + 1)}
                conf={props.conflict.some(conf => conf.row === i && conf.seat === index +1 )}
                setLastReservation={props.setLastReservation}
                loggedIn={props.loggedIn}
                random={random} />
            </Row>
          </Col>

        )}
      </Row>
    )
  }


  return (
    <Row>
      <Col md={1}> </Col>

      <Col xs={7} className='mt-4 mb-4 planeMap'>
        {rows}
      </Col>

      {props.loggedIn ?

        <Col xs={4}>
          <Card className='m-4'>
            <Card.Header>Hey {props.user.name}, some usefull information for you..</Card.Header>
            <Card.Body>
              <Card.Title> There are two booking methods: </Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item> - select the seats you want from those available </ListGroup.Item>
                <ListGroup.Item> - <Button variant="outline-primary" onClick={handleRandom} size='sm'> Click here</Button> tell us how many seats you want and we will assign them for you </ListGroup.Item>
              </ListGroup>

              <Card.Title> You can cancel your reservation with a click </Card.Title>
              {props.upload  && operation === "delete"? <MyProgressBar operation={operation} /> : <Button variant='outline-danger' disabled={random || props.lastReservation.length} onClick={() => handleRemove(props.plane.id)}> Remove reservation in this plane </Button>}
            </Card.Body>
          </Card>

          <Row className='m-4'>
            {random ? <PlaneSeatsForm addReservation={props.addReservation} plane={props.plane} lastReservation={props.lastReservation} setLastReservation={props.setLastReservation} setRandom={setRandom} setOperation={setOperation}/> : null}

            {props.lastReservation.length && !random ?

              <Card>
                <Card.Header>Your reservation</Card.Header>
                {props.upload?
                  <MyProgressBar operation={operation} /> :
                  <Card.Body>
                    <Card.Title>Requested seats: {props.lastReservation.length} </Card.Title>
                    <Button className='me-2' type='button'  size="sm" variant='success' onClick={handleAddSelected}> Confirm Reservation </Button>
                    <Button type='button' size="sm" variant='danger' onClick={() => props.setLastReservation([])}> Cancell </Button>
                  </Card.Body>}
              </Card> : null}
          </Row>

        </Col> : null
      }
    </Row >
  );
}

function MainContent(props) {

  return (
    <main className={"col-9"}>

      <Badge bg="success">{"Selected plane: " + props.plane.name} </Badge>

      <Container fluid>
        <PlaneMap plane={props.plane} loggedIn={props.loggedIn} addReservation={props.addReservation}
          lastReservation={props.lastReservation} setLastReservation={props.setLastReservation} user={props.user}
          deleteReservation={props.deleteReservation} upload={props.upload} conflict={props.conflict} />

      </Container>

    </main>
  );
}


export default MainContent;
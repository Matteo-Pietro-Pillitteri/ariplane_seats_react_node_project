
import { useState } from "react";
import { Card, Container, ListGroup, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import { BsAirplaneEngines, BsAirplane } from 'react-icons/bs';
import { BiSolidPlaneTakeOff } from 'react-icons/bi';
import { GiCommercialAirplane } from 'react-icons/gi';

function PlaneCard(props) {
  const [more, setMore] = useState(false);
  let result;

  switch (props.plane.type) {
    case "local":
      result = <BsAirplane className='display-1 ms-4 mt-3 mb-1 hover-zoom' />
      break;

    case "regional":
      result = <BsAirplaneEngines className='display-1 ms-4 mt-3 mb-1' />
      break;

    case "international":
      result = <GiCommercialAirplane className='display-1 ms-4 mt-3 mb-1' />
      break;
  }

  // props.plane.booked represents the number of booked seats in that plane
  return (

    <Card className='mb-2' >

      {result}

      <Card.Body >

        <Card.Title>Plane name: {props.plane.name} </Card.Title>
        <Card.Subtitle className="mb-2">Type of plane: {props.plane.type} </Card.Subtitle>
        <Card.Subtitle> Availability: </Card.Subtitle>
        <ListGroup variant="flush" className='mb-2'>
          <ListGroup.Item> Total seats in the plane: {props.plane.p * props.plane.f} </ListGroup.Item>
          <ListGroup.Item> Available seats: {(props.plane.p * props.plane.f) - props.plane.booked} </ListGroup.Item>
          <ListGroup.Item> Booked seats: {props.plane.booked} </ListGroup.Item>
        </ListGroup>

        <Button className="me-3" variant="outline-success" onClick={() => setMore((oldMore) => (!oldMore))}> {more ? "Show less information" : "Show more plane features"} </Button>

        {more ?
          <>
            <Card.Subtitle className="mt-2 mb-1"> Structure of this aircraft: </Card.Subtitle>
            <ListGroup variant="flush">
              <ListGroup.Item> Row: {props.plane.f} </ListGroup.Item>
              <ListGroup.Item> Seats per row: {props.plane.p} </ListGroup.Item>
            </ListGroup>
          </> : null}

        <Link to={`/plane/${props.plane.id}`} >
          <Button className='w-25' variant="success" type="button" onClick={() => props.setInitialLoading(true)}>Book a seat! <BiSolidPlaneTakeOff /></Button>
        </Link>

      </Card.Body>
    </Card>

  );
}

function HomePage(props) {

  return (

    <Container fluid>
      {props.planeList.map((p) => <PlaneCard plane={p} key={p.id} setInitialLoading={props.setInitialLoading} />)}
    </Container>

  );
}

export default HomePage;
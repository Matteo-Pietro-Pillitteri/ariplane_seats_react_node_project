import '../MyStyle.css'
import { Navbar, Col, Row, ListGroup, Container, Badge, Button, Card, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { SiFloatplane } from "react-icons/si"
import { PiUserCircleFill } from 'react-icons/pi'

function MyNavbar(props) {
    const navigate = useNavigate();

    return (
        <Navbar className='lightgreenstyle mb-4 sticky-top' expand='lg'>
            <Container fluid>
                <Row className='w-100 className=d-flex justify-content-end align-items-center'>
                    <Col xs={6}>
                        <Navbar.Brand >
                            <SiFloatplane className='me-2' size={22} />
                            ReserveASeat
                        </Navbar.Brand>
                        <Button size='sm' variant='outline-success' className='me-2' onClick={() => navigate('/')}> Home </Button>
                        {props.user ? <Button size='sm' variant='outline-danger' onClick={props.doLogOut} > Log out </Button> : <Button onClick={() => navigate('/login')} size='sm' variant='outline-primary'> Login </Button>}
                    </Col>

                    <Col xs={6} className='d-flex justify-content-end align-items-center'>

                        <Navbar.Text className='me-2 text-dark'>
                            {props.user ? <> <PiUserCircleFill size={22} className='me-1' />{"Logged in as: " + props.user.name}</> : "Login for more..."}
                        </Navbar.Text>
                    </Col>
                </Row>
            </Container>

        </Navbar>
    );
}

function MySideBar(props) {
    const navigate = useNavigate();

    function handlePlaneChange(planeId) {
        props.setInitialLoading(true);
        navigate(`/plane/${planeId}`);
    }

    return (
        <Col xs={3} className='p-3'>

            <Card className='rounded mb-3'>
                <Card.Body>
                    <Button variant='success' className='sidebar w-100'>
                        <Badge> Availability </Badge>
                    </Button>
                    <ListGroup variant="flush" className='mb-2'>
                        <ListGroup.Item> Total seats in the plane: {props.initialLoading ? <Spinner animation="border" size="sm" variant='secondary' /> : props.plane.p * props.plane.f} </ListGroup.Item>
                        <ListGroup.Item> Available seats: {props.initialLoading ? <Spinner animation="border" size="sm" variant='secondary' /> : (props.plane.p * props.plane.f) - props.plane.booked} </ListGroup.Item>
                        <ListGroup.Item> Booked seats: {props.initialLoading ? <Spinner animation="border" size="sm" variant='secondary' /> : props.plane.booked} </ListGroup.Item>
                        {props.loggedIn ? <ListGroup.Item> Requested seats: {props.initialLoading ? <Spinner animation="border" size="sm" variant='secondary' /> : props.lastReservation.length} </ListGroup.Item> : null}
                    </ListGroup>
                </Card.Body>
            </Card>

            <Card className="rounded">
                <Card.Body>
                    <ListGroup variant='flush'>
                        <Button variant="success" className='sidebar'>
                            planes <Badge className='sidebar'> {props.initialLoading ? <Spinner animation="border" size="sm" variant='secondary' /> : props.planeList.length} </Badge>
                        </Button>
                        {props.planeList.map((p) => <ListGroup.Item key={p.id} className='p-2'> <Button variant='text' className='w-100' disabled={p.id === props.plane.id} size="sm" onClick={() => handlePlaneChange(p.id)}>{p.name}</Button> </ListGroup.Item>)}
                    </ListGroup>
                </Card.Body>
            </Card>
        </Col>
    );
}

export { MyNavbar, MySideBar }
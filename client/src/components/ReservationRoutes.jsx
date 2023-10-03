import { useParams, useNavigate} from "react-router-dom";
import { useEffect } from "react";
import { Col, Container, Row, Spinner } from "react-bootstrap";
import { MySideBar } from "./NavigationComponents";
import MainContent from "./MainContents";
import API from '../API';


function LoadingContent() {

    return (
        <Col className="d-flex justify-content-center">
            <Spinner animation="grow" variant="success" className="me-3" />
            <h3> Loading data...</h3>
        </Col>
    )
}

function ReservationRoute(props) {
    const params = useParams();
    const navigate = useNavigate();
    
    useEffect(() => {

        if (props.dirty || props.initialLoading) {  
          
            API.getPlaneById(params.planeId)
                .then((plane) => {
                    props.setPlane(plane);  
                    props.setInitialLoading(false); 
                    props.setLastReservation([]);
                })
                .catch((err) => {
                   navigate('/*');
                   props.setInitialLoading(false); 
                })

        }
    }, [params.planeId, props.dirty]);


    return (
        <Container fluid>
            <Row>
               
                <MySideBar planeList={props.planeList} plane={props.plane} loggedIn={props.loggedIn}
                    lastReservation={props.lastReservation} setInitialLoading={props.setInitialLoading} initialLoading={props.initialLoading} />
                {props.initialLoading? <LoadingContent /> : 
                 <MainContent loggedIn={props.loggedIn}   plane={props.plane} user={props.user} addReservation={props.addReservation} lastReservation={props.lastReservation}
                    setLastReservation={props.setLastReservation} deleteReservation={props.deleteReservation} upload={props.upload} conflict={props.conflict} />}
            </Row>
        </Container>

    )
}



export { ReservationRoute, LoadingContent };
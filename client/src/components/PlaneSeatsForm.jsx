import { useState } from 'react';
import { Form, Alert, Button } from 'react-bootstrap';

function PlaneSeatsForm(props) {
    const [numSeats, setNumSeats] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');

    function handleSubmit(event) {
        event.preventDefault();
        const planeCapacity = (props.plane.f * props.plane.p);
   
        if (isNaN(parseInt(numSeats))) setErrorMsg("Error, not a number");
        else if (parseInt(numSeats) === 0) setErrorMsg("The minimum number of seats that can be booked is 1");
        else if (parseInt(numSeats) < 0) setErrorMsg("Error, negative input not allowed");
        else if (parseInt(numSeats) > planeCapacity) setErrorMsg("This aircraft does not have this number of seats.");
        else if (parseInt(numSeats) > planeCapacity - props.plane.booked) setErrorMsg("There is not this number of seats available");
        else {
            const seats = [];  // array of object. Each object is a seat of the same reservation
            let i = 0;

            const reserved = new Set(props.plane.reservations.map(res => `${res.row}-${res.seat}`));
            for (let row = 1; row <= props.plane.f && i < numSeats; row++) {
                for (let seat = 1; seat <= props.plane.p && i < numSeats; seat++) {

                    const isReserved = reserved.has(`${row}-${seat}`);

                    if (!isReserved) {
                        seats.push(
                            {
                                row: row,
                                seat: seat,
                            }
                        )
                        i++;
                    }
                }
            }

            props.setRandom(false);
            props.setOperation('book');
            props.setLastReservation(seats);
            props.addReservation(seats);
        }

    }

    return (


        <Form onSubmit={handleSubmit}>
            {errorMsg ? <Alert variant='danger' dismissible onClick={() => setErrorMsg('')}>{errorMsg}</Alert> : ''}
            <Form.Group controlId='nseats'>
                <Form.Label>Enter the number of seats to book</Form.Label>
                <Form.Control type='number' value={numSeats} onChange={ev => setNumSeats(ev.target.value)} />
            </Form.Group>
            <Button className='me-2 mt-2' type='submit' variant='success'>Confirm reservation</Button>
            <Button className='mt-2' type='button' variant='danger' onClick={() => props.setRandom(false)}>Cancell</Button>
        </Form>

    );
}

export default PlaneSeatsForm;
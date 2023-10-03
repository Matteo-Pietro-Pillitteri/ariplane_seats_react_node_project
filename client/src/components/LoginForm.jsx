import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../API';

function LoginForm(props) {
  const [username, setUsername] = useState('u1@p.it'); //test use only
  const [password, setPassword] = useState('pwd'); // test use only
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then(user => {
        setErrorMessage('');
        props.loginSuccessful(user); 
      })
      .catch(err => {
        // NB: Generic error message, should not give additional info (e.g., if user exists etc.)
        setErrorMessage('Wrong username or password');
      })
  }

  const handleSubmit = (event) => {
    event.preventDefault();
   
    const credentials = { username, password }; 


    if(username === '' || password === '') setErrorMessage('Error, please check email and password');
    //other checks (without using regex ) in case the "novalidate" attribute is included in the form
    else if(!username.includes('@')) setErrorMessage('Error, missing @');
    else if(username.startsWith('@'))  setErrorMessage('Error, no character before @');
    else if(!username.includes('.')) setErrorMessage("Error, missing dot")
    else if(username.indexOf('.') < username.indexOf('@')) setErrorMessage('Error, dot allowd only after @'); 
    else doLogIn(credentials);
  

  };

  return (

    <Container>
      <Row>
        <Col xs={3}></Col>
        <Col xs={6} className='border border-success rounded'>
          <h2>Login</h2>
          <Form onSubmit={handleSubmit}>
            {errorMessage ? <Alert variant='danger' dismissible onClose={() => setErrorMessage('')}>{errorMessage}</Alert> : ''}
            <Form.Group controlId='username'>
              <Form.Label>Email</Form.Label>
              <Form.Control type='email' value={username} placeholder="Enter email" onChange={ev => setUsername(ev.target.value)} />
            </Form.Group>
            <Form.Group controlId='password'>
              <Form.Label>Password</Form.Label>
              <Form.Control type='password' value={password} placeholder="Enter password" onChange={ev => setPassword(ev.target.value)} />
            </Form.Group>
            <Button className='my-2' type='submit' variant='success'>Login</Button>
            <Button className='my-2 mx-2' variant='danger' onClick={() => navigate('/')}>Cancel</Button>
          </Form>
        </Col>
        <Col xs={3}></Col>
      </Row>
    </Container>

  )
}

export default LoginForm;
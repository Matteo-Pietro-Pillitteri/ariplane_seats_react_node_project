
const URL = 'http://localhost:3001/api';


async function getPlanesWithMoreInfo(){
  const response = await fetch(URL + '/planes');
  const planes = await response.json();
  if(response.ok){
    return planes.map((p) => ({ id: p.id, name: p.name, type: p.type, f: p.f, p: p.p, booked: p.booked}));
  }else{
    throw planes;
  }
}

async function getPlaneById(id){

  const response = await fetch(URL + `/planes/${id}`);
  const plane = await response.json();
  if(response.ok){
    const p = plane;
    return {id: p.id, name: p.name, type: p.type, f: p.f, p: p.p, booked: p.booked, reservations: p.reservations};
  }else{
    throw plane;
  }
}


function addReservation(reservation, planeId){
  return new Promise((resolve, reject) => {
    fetch(URL + '/reservations', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({seats: reservation, planeId: planeId}), // send to the server an object that includes the list of the requested seats and the plane id 
    }).then((response) =>{
      if(response.ok){
        resolve(null);
      }else{
        response.json()
          .then((message) => reject(message))  // error message in the body response
          .catch(() => {reject({error: "Cannot parse server response."})});
      }
    }).catch(() => reject({error: "Cannot communicate with the server."}));
  });
};

function deleteReservation(planeId){
  return new Promise((resolve, reject) =>{
    fetch(URL + `/reservations/${planeId}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then((response) =>{

      if(response.ok){
       resolve(null);
      }else{
        response.json()
          .then((message) =>  reject(message)) // error message in the response body
          .catch(() => reject({error: "Cannot parse server response."}));
      }

    }).catch(() => reject({error: "Cannot communicate with the server."}));
  });
}

async function logIn(credentials) {
  let response = await fetch(URL + '/sessions', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

async function logOut() {
  await fetch(URL+'/sessions/current', {
    method: 'DELETE', 
    credentials: 'include' 
  });
}

async function getUserInfo() {
  const response = await fetch(URL+'/sessions/current', {
    credentials: 'include'
  });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}

const API = {
  logIn, logOut, getUserInfo, getPlanesWithMoreInfo, getPlaneById, addReservation, deleteReservation
};
export default API;
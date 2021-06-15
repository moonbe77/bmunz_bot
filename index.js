const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fetch = require('node-fetch');
var nickname = require('nickname');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/bot', async (req, res) => {
  fetch('http://localhost:5001/bmunz-316708/us-central1/dialogflowGateway', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "sessionId": "berny",
      "queryInput": {
        "text": {
          "text": "howdy",
          "languageCode": "en-US"
        }
      }
    })
  })
    .then(data => data.json())
    .then(parse => {
      console.log(parse);
    })

  res.json({ message: 'fetched' })
});

let usersConnected = []

function getUserData(id) {
  const userData = usersConnected.find(user => user.id === id)
  return userData
}

io.on('connection', (socket) => {
  usersConnected.push({
    id: socket.id,
    nick: nickname.random()
  })

  const payload = {
    message: 'joined the chat',
    user: getUserData(socket.id)
  }
  socket.broadcast.emit('chat message', payload);
})

io.on('connection', (socket) => {
  socket.on('bot', (msg) => {    
    console.log(msg);

    fetch('http://localhost:5001/bmunz-316708/us-central1/dialogflowGateway', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "sessionId": socket.id,
        "queryInput": {
          "text": {
            "text": msg,
            "languageCode": "en-US"
          }
        }
      })
    })
      .then(data => data.json())
      .then(fullfil => {
        const payload = {
          message: fullfil.fulfillmentText,
          parameters: fullfil.parameters.fields
        }

        socket.emit('bot', payload);
      })
      .catch(err => {
        console.log(err);
      })
  });
});

io.on('connection', (socket) => {
  const payload = {
    connections: usersConnected.length,
    users: usersConnected.map(user => user.nick) || []
  }

  io.emit('stats', payload);
});








server.listen(3000, () => {
  console.log('listening on localhost:3000');
});
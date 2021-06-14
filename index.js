const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var nickname = require('nickname');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
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
  console.log(usersConnected);

  const payload = {
    message: 'joined the chat',
    user: getUserData(socket.id)
  }
  socket.broadcast.emit('chat message', payload);
})

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {

    const payload = {
      message: msg,
      user: getUserData(socket.id)
    }

    socket.broadcast.emit('chat message', payload);
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
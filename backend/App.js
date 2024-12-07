const express = require('express');
const app = express();
const http = require('http');
const { isNumberObject } = require('util/types');
const server = http.createServer(app);
const io = new require("socket.io")(server);
const { casesAdjacentes, getX, getY, getCoords, offset_to_cube, distance, pathFind } = require('./modules/backendHex');

app.use(express.static(__dirname));

const PORT = 8888;
const IP = "localhost"
server.listen(PORT, () => {
  console.log(`Server is running on ${IP}:${PORT}`);
});



app.get("/",(request,response)=>{
    response.sendFile("index.html",{root:__dirname+"/../frontend"})
})

app.get("/script/:nomFichier",(request,response)=>{
    response.sendFile(request.params.nomFichier,{root:__dirname+"/../frontend"})
})







//---------------------SOCKET------------------------------

io.on('connection', (socket) => {
console.log("ça connecte")


  socket.on('nouvellemap', (data) => {
    console.log("il veut une map")
  });

  socket.emit("map","a")
});

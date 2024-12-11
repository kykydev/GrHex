const express = require('express');
const app = express();
const http = require('http');
const { isNumberObject } = require('util/types');
const server = http.createServer(app);
const io = new require("socket.io")(server);
const { casesAdjacentes, getX, getY, getCoords, offset_to_cube, distance, pathFind } = require('./modules/backendHex');
const {createMap} = require('./modules/mapGeneration');
const { on } = require('events');

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

  socket.on('nouvellemap', (data) => {
    console.log("il veut une map")
  }); 

  carte =  createMap(40,30)
  socket.emit("map",carte)

  socket.on("saveçastp",data=>{
    const fs = require('fs');
    savedstring = "["
    for (z of data){savedstring=savedstring+"'"+z+"',"}
    savedstring += "]"

    fs.writeFileSync('lastmap.json', savedstring);
  })
});

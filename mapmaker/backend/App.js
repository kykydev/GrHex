const express = require('express');
const app = express();
const http = require('http');
const { isNumberObject } = require('util/types');
const server = http.createServer(app);
const io = new require("socket.io")(server);
const { casesAdjacentes, getX, getY, getCoords, offset_to_cube, distance, pathFind } = require('./modules/backendHex');
const {createMap} = require('./modules/mapGeneration');
const { on } = require('events');
const { hexagon } = require('./classes/hexagon');

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





function simpleToMap(carte){
map = []
for (z in carte){
  switch(carte[z]){
    case "plaine":
      map.push("plaine_1")
      break
  case "eau":
      map.push("eau")
      break
    case "montagne":
        map.push("montagne")
        break

  case "carriere":
          map.push("carriere_1")
          break
    case "foret":
            map.push("foret2_"+(Math.floor(Math.random()*3+1)))
            break
  }
}

  return map
}



//---------------------SOCKET------------------------------

io.on('connection', (socket) => {

  socket.on('nouvellemap', (data) => {
    console.log("il veut une map")
  }); 

  var w = 40
  var h = 30

  /*
  var aaaa = ['plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','plaine','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','plaine','plaine','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','plaine','plaine','plaine','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','eau','plaine','plaine','plaine','plaine','plaine','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','eau','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','plaine','eau','plaine','plaine','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','eau','eau','eau','eau','plaine','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','eau','eau','eau','eau','plaine','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','plaine','eau','eau','plaine','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','plaine','plaine','eau','plaine','plaine','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','plaine','eau','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','plaine','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine',]
  carte = simpleToMap(aaaa)
  carte = {"width":w,"height":h,"terrain":carte}*/
  carte = createMap(w,h)
  socket.emit("map",carte)

  socket.on("saveçastp",data=>{
    const fs = require('fs');
    
    /*
    savedstring = "["
    for (z of data){savedstring=savedstring+'"'+z+"',"}
    savedstring = savedstring[savedstring.length-1]="]"

    fs.writeFileSync('lastmap.json', savedstring);
    */
    fs.writeFileSync(data.nom+'.json', JSON.stringify(data));
  })
});

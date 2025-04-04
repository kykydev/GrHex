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
    var saved = data
    for (var z of Object.keys(saved.boards.beotie)){
      if (saved.boards.beotie[z]=="mur"){
        delete saved.boards.beotie[z]
        saved.boards.mursBeotie.push(z)
      }
      if (saved.boards.beotie[z]=="hôtel de ville"){
        delete saved.boards.beotie[z]
        saved.boards.hdvBeotie.push(z)
      }

      for (var z of Object.keys(saved.boards.argolide)) {
        if (saved.boards.argolide[z] == "mur") {
          delete saved.boards.argolide[z];
          saved.boards.mursArgolide.push(z);
        }
        if (saved.boards.argolide[z] == "hôtel de ville") {
          console.log("aaaaa")
          delete saved.boards.argolide[z];
          saved.boards.hdvArgolide.push(z);
        }
      }

      for (var z of Object.keys(saved.boards.attique)) {
        if (saved.boards.attique[z] == "mur") {
          delete saved.boards.attique[z];
          saved.boards.mursAttique.push(z);
        }
        if (saved.boards.attique[z] == "hôtel de ville") {
          delete saved.boards.attique[z];
          saved.boards.hdvAttique.push(z);
        }
      }

    }



    saved.map[saved.positionsDépart["beotie"]]="plaine"
    saved.boards.beotie[saved.positionsDépart["beotie"]]="stratege"
    
    saved.map[saved.positionsDépart["argolide"]]="plaine"
    saved.boards.argolide[saved.positionsDépart["argolide"]]="stratege"
    
    saved.map[saved.positionsDépart["attique"]]="plaine"
    saved.boards.attique[saved.positionsDépart["attique"]]="stratege"
    



    fs.writeFileSync(data.nom+'.json', JSON.stringify(saved,null,2));
  })
});

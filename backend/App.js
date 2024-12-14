const express = require('express');
const app = express();
const http = require('http');
const { isNumberObject } = require('util/types');
const server = http.createServer(app);
const io = new require("socket.io")(server);
const { casesAdjacentes, getX, getY, getCoords, offset_to_cube, distance, pathFind } = require('./modules/backendHex');
const {createMap} = require('./modules/mapGeneration')
const {game} = require('./classes/game')

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
    response.sendFile(request.params.nomFichier,{root:__dirname+"/../frontend/"})
})

app.get("/script/:dossier/:nomFichier",(request,response)=>{
  response.sendFile(request.params.nomFichier,{root:__dirname+"/../frontend/"+request.params.dossier});
});

app.get("/creerpartie",(request,response)=>{
  response.sendFile("pageCreation.html",{root:__dirname+"/../frontend/creationpartie"});
});

var lobbies = {}
var parties = {}


//-----------------------Fonctions de gestion des parties-----------------------------

function testStartPartie(partie){
if (partie.canStart()){
    parties[partie.id]=partie
    delete lobbies[partie.id]
    io.to(partie.id).emit("commencerPartie",null)
}
}



//---------------------SOCKET------------------------------

io.on('connection', (socket) => {

  socket.on('nouvellemap', (data) => {
    console.log("il veut une map")
  });

  socket.on("creerPartie",data=>{
    var nbJoueurs = data.nbJoueurs
    var nbTours = data.nbTours

    var partie = new game(nbJoueurs,nbTours)
    lobbies[partie.id]=partie
    
    var createur = partie.addPlayer()
    if (createur!=false){
    //{"terrain":la map,"width":int,"height":int,"positionsCites":{"béotie":215,"attique":1072,"argolide":297},"idPartie":int,"idJoueur":int}
      socket.join(partie.id)
      socket.emit("lobbyPartie",{"idPartie":partie.id,"idJoueur":createur,"map":partie.map,"positionCites":partie.positionsDepart,"nom":partie.name})
    }


  })

  socket.on("rejoindreLobby",data=>{
    var partie = lobbies[data]
    if (partie!=undefined && partie!=null){
      if (partie.players.length>=partie.nbJoueurs){//Send error socket
        socket.emit("erreurRejoindreLobby",false)
        return
      }
      else{//Add player to the game
        var joueur = partie.addPlayer()
        if (joueur==false){
          socket.emit("erreurRejoindreLobby",false)
        }
        else{
        //{"terrain":la map,"width":int,"height":int,"positionsCites":{"béotie":215,"attique":1072,"argolide":297},"idPartie":int,"idJoueur":int}
          socket.join(partie.id)
          socket.emit("lobbyPartie",{"idPartie":partie.id,"idJoueur":joueur,"map":partie.map,"positionCites":partie.positionsDepart,"nom":partie.name})
        }
        }
      }
    })


  socket.on("getListeParties",data=>{
      var retour = []
         for (z of Object.keys(lobbies)){
          par = lobbies[z]
          retour.push({"nom":par.name,"nbJoueurs":par.nbJoueurs,"nbTours":par.nbTours,"idPartie":par.id,"currentPlayers":Object.keys(par.players).length})
         }
         socket.emit("getListeParties",retour)
  })
   

  socket.on("rejoindrePartie",data=>{
        var partie = lobbies[data.idPartie]
        if (partie==undefined){return}
        var player = partie.players[data.idJoueur]
        if (player==undefined){return}


        if (partie.citePrise(data.maCite)){
          socket.emit("rejoindrePartie",false)
          return
        }

        if (player.choseCite(data.maCite)==false){
          socket.emit("rejoindrePartie",false);
        }
        else{
          player.name=data.nom
          socket.emit("rejoindrePartie",true);
        }

  })









});

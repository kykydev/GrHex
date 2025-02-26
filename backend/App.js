const express = require('express');
const app = express();
const http = require('http');
const { isNumberObject } = require('util/types');
const server = http.createServer(app);
const io = new require("socket.io")(server);
const { casesAdjacentes, getX, getY, getCoords, offset_to_cube, distance, pathFind } = require('./modules/backendHex');
const {createMap} = require('./modules/mapGeneration')
const {game} = require('./classes/game')
const {buildings} = require('./modules/buildingInfos')
const { turnAction,moveAction,newUnitAction,buildAction} = require('./classes/turnAction')
app.use(express.static(__dirname));

const PORT = 8888;
const IP = "http://localhost"
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

function testStartPartie(partie,io){
if (partie.canStart()){
    parties[partie.id]=partie
    delete lobbies[partie.id]
    partie.init()
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
      socket.idJoueur = createur
      socket.idPartie = partie.id
      socket.emit("lobbyPartie",{"idPartie":partie.id,"idJoueur":createur,"map":partie.map,"positionCites":partie.positionsDepart,"nom":partie.name})
    }


  })

  socket.on("rejoindreLobby",data=>{//Rejoindre un lobby depuis la liste des parties de l'écran titre
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
          socket.join(partie.id)
          socket.idJoueur = joueur
          socket.idPartie = partie.id
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
   

  socket.on("rejoindrePartie",data=>{//Rejoindre la partie depuis un lobby, donc choix de cité
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
          testStartPartie(partie,io)
        }

  })


  socket.on("demandeDamier",data=>{//Socket demandant le damier qui doit s'afficher pendant la partie côté client
    var partie = parties[socket.idPartie]
    if (partie==undefined){return}
    if (partie.players[socket.idJoueur].eliminated){return}
    var retour = partie.calculVue(socket.idJoueur)
    socket.emit("demandeDamier",retour)
  })



  socket.on("mouvement",data=>{
    var idPartie = socket.idPartie
    var idJoueur = socket.idJoueur
    if (idPartie==undefined || idJoueur == undefined){return}
    var partie = parties[idPartie]
    if (partie==undefined){return}
    let départ = parseInt(data.départ)
    let arrivée = parseInt(data.arrivée)
    if (partie.board[départ]==undefined || partie.board[départ].type=="building" ||  partie.board[départ].name=="Messager"){return}
    if (partie.board[départ].owner!=idJoueur){return }
    
    
    var check = partie.canOrder(idJoueur,départ)
    if (check==undefined){return}

    if (check==true){//Check la distance
      //Cas où on met quelqu'un dans un champ
      if (partie.board[arrivée]!=undefined && partie.board[arrivée].name=="Champ" && partie.board[arrivée].owner==idJoueur){
          if (casesAdjacentes(départ,partie.map.width,partie.map.height).includes(arrivée)){
          if (partie.board[arrivée].addWorker(départ,partie)){
            socket.emit("désafficherUnité",départ)
            return
            }
          }
        }
        //Cas où on a tenté de mettre un nouveau builder sur un job
        if (partie.board[arrivée]!=undefined && partie.board[départ].name=="Ouvrier" && partie.board[départ].owner==idJoueur){
            if (partie.addToChantier(départ,arrivée,idJoueur)){
            return
            }
          
        }
      
        
      let route = partie.pathfindToDestination(départ, arrivée, idJoueur)
      if (route == false) { return false }
      partie.board[départ].destination = arrivée
      partie.board[départ].path = undefined
      socket.emit("mouvement", route)

    }   
    else{
      var recruted = partie.recruteMessager(idJoueur,départ,arrivée);
      if (recruted!=false && recruted!=undefined){
        socket.emit("spawnMessager",recruted)

      }



    }


  })
   
  socket.on("finTour",data=>{
    var partie = parties[socket.idPartie]
    var idJoueur = socket.idJoueur
   
    if (partie==undefined || idJoueur==undefined){return}
    if (partie.players[idJoueur].played==true){return}//Le joueur a déjà passé son tour
    partie.players[idJoueur].played=true
    if (partie.canTour()){
      var winner = partie.tour()

      if (winner!=false){
        console.log("PARTIE "+partie.id+" TERMINEE, VAINQUEUR(S): | "+winner)
        io.to(partie.id).emit("PARTIEFINIE",winner)
        delete parties[socket.idPartie]
      }
      else{ 
        io.to(partie.id).emit("finTour",partie.actionsThisTurn)
      }
    }
    else{//Le tour n'est pas fini, renvoi de l'info au client pour qu'il affiche correctement
      socket.emit("finTour",false)
      return
    }



  })

  socket.on("ressources",data=>{//Le joueur demande les infos sur ses ressources
    var idPartie = socket.idPartie
    var idJoueur = socket.idJoueur
    if (idPartie==undefined || idJoueur == undefined){return}
    var partie = parties[idPartie]
    if (partie==undefined){return}
    var joueur = partie.players[idJoueur]
    socket.emit("ressources",partie.getEmitRessources(idJoueur))


  })

  socket.on("demandeBâtiments",data=>{
    if (socket.idPartie==undefined){return}
    let partie = parties[socket.idPartie]
    if (partie==undefined){return}
    
    socket.emit("demandeBâtiments",buildings)
  })


  socket.on("construireBâtiment",data=>{
    if (socket.idPartie==undefined){return}
    let partie = parties[socket.idPartie]
    if (partie==undefined){return}
    joueur = partie.players[socket.idJoueur]
    if (joueur==undefined){return}

    if (partie.build(data.nomBat,data.position,joueur)==true){
      socket.emit("construireBâtiment",{"nom":data.nomBat,"position":data.position})
    }
  })


  socket.on("croix",data=>{//Socket permettant la construction/destruction d'un bâtiment
    let partie = parties[socket.idPartie]
    if (data==undefined ||socket.idPartie==undefined ||partie==undefined || socket.idJoueur==undefined){return}
    partie.unbuild(data,socket.idJoueur,socket)
  })

  socket.on("recruterOuvrier",data=>{
    let partie = parties[socket.idPartie]
    if (partie==undefined){return}
    if (socket.idJoueur==undefined){return}
    var res = partie.recruteOuvrier(data)
    if (res!=false){socket.emit("recruterOuvrier",res)}
  })

  socket.on("citésDispo",data=>{
    var partie = parties[socket.idPartie]
    var idJoueur = socket.idJoueur
   
    if (partie==undefined || idJoueur==undefined){return}
    var retour = []
    if (partie.citePrise("beotie")==false){retour.push("beotie")}
    if (partie.citePrise("argolide")==false){retour.push("argolide")}
    if (partie.citePrise("attique")==false){retour.push("attique")}
    socket.emit("citésDispo",retour)

  })

    socket.on("demandeUnitesForge",data=>{//Socket qui prend comme data une case contenant une forge et renvoie les untiés qui peuvent évoluer avec
      var partie = parties[socket.idPartie]
    var idJoueur = socket.idJoueur
    if (partie==undefined || idJoueur==undefined ||data==undefined){return}
    var retour = partie.getForgeEvolutions(data,idJoueur) 
    if (retour===false){return}
      socket.emit("demandeUnitesForge",retour)
    })


    socket.on("evolution",data=>{//Socket demandant l'évolution d'une unité. Si l'évolution se fait, on renvoie le même socket pour mettre à jour l'affichage
      var partie = parties[socket.idPartie]
      var idJoueur = socket.idJoueur
      if (data==undefined || partie==undefined || idJoueur==undefined){return}
      if (data.avant==undefined || data.apres==undefined || data.position==undefined){return}
      var cbon = false
      for (var z of casesAdjacentes(data.position,partie.map.width,partie.map.height)){if (partie.board[z]!=undefined && partie.board[z].name=="Forge"){cbon=true}}
      if (!cbon){return}

      if (partie.evolve(data.position,data.apres)){socket.emit("evolution",{"position":data.position,"newUnit":data.apres}); return}



    })

    socket.on("demandeUnitesChamp",data=>{
      var partie = parties[socket.idPartie]
      var idJoueur = socket.idJoueur
      if (data==undefined || partie==undefined || idJoueur==undefined){return}

      var retour = partie.getUnitesChamp(data,idJoueur)
      if (retour != undefined && retour != false){socket.emit("demandeUnitesChamp",{"unites":retour,"revenu":partie.getRevenuChamp(data,idJoueur)})}

    })

    socket.on("sortirChamp",data=>{
      var partie = parties[socket.idPartie]
      var idJoueur = socket.idJoueur
      if (data==undefined || partie==undefined || idJoueur==undefined){return}
      var check = partie.sortirChamp(data.unite,data.position,idJoueur)
      if (check!=false){
        socket.emit("evolution",check)
        return
      }
    })

    socket.on("demandeHDV",data=>{
      var partie = parties[socket.idPartie]
      var idJoueur = socket.idJoueur
      if (data==undefined || partie==undefined || idJoueur==undefined){return}

      var retour = partie.getHDV(idJoueur)
      if (retour!=undefined && retour!=false){
        socket.emit("demandeHDV",retour)
      }

    })


});

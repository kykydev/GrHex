const express = require('express');
const app = express();
const http = require('http');
const fs = require('fs');
const server = http.createServer(app);
const socketIo = new require("socket.io");
const origines = [
  "https://grhex.elouand.fr",
  "http://localhost:3000",   // your local frontend
  "http://localhost:8888",   // optional, if testing frontend served by backend
];

const io = require("socket.io")(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || origines.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  },
});

const { casesAdjacentes, getX, getY, getCoords, offset_to_cube, distance, pathFind } = require('./modules/backendHex');
const {createMap, getMapList} = require('./modules/mapGeneration')
const {game} = require('./classes/game')
const {buildings} = require('./gameDatas/buildingInfos')
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





//TEST




//TEST





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


  socket.on("disconnect",data=>{
    var lobby = lobbies[socket.idPartie]
    if (lobby!=undefined){
      if (lobby.players[socket.idJoueur]!=undefined){
        delete lobby.players[socket.idJoueur]
        if (Object.keys(lobby.players).length<=0){delete lobbies[socket.idPartie]}
      }
      return 
    }
    
    var partie = parties[socket.idPartie]
    if (partie!=undefined){
      partie.removePlayer(socket.idJoueur)
      if (Object.keys(partie.players).length<=0){delete parties[socket.idPartie];return}
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
      
    }
  
  })




  socket.on('nouvellemap', (data) => {
  });

  socket.on("creerPartie",data=>{
    var nbJoueurs = data.nbJoueurs
    var nbTours = data.nbTours

    var partie = new game(nbJoueurs,nbTours,data.map)
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
          retour.push({"nom":par.name,"nbJoueurs":par.nbJoueurs,"nbTours":par.nbTours,"idPartie":par.id,"map":par.map.nom,"currentPlayers":Object.keys(par.players).length})
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
        else{//Choix réussi
          player.name=data.nom
          player.deity = data.dieu
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
    partie.handleLetters(socket,socket.idJoueur)
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

      //Cas où on met quelqu'un dans un champ ou une mine
   


      if (partie.board[arrivée]!=undefined && (partie.board[arrivée].name=="Champ" || partie.board[arrivée].name=="Mine" ||  partie.board[arrivée].name=="Tour" ||  partie.board[arrivée].name=="Tour d'archer") && partie.board[arrivée].owner==idJoueur){
        if (["Mineur","Paysanne","Bûcheron","Archer","Frondeur"].includes(partie.board[départ].name)){
          partie.board[départ].objectif=arrivée
          if (partie.testEntre(partie.board[départ])){
            socket.emit("désafficherUnité",départ)
            return
            }
          
          else{
            if (partie.board[arrivée].name=="Tour" ||partie.board[arrivée].workers.length<partie.board[arrivée].maxworkers){partie.board[départ].objectif=arrivée;}

            return
          }
        }
      }
              //Cas de changement de la base d'une unité
      if (partie.board[arrivée]!=undefined && (partie.board[arrivée].name=="Hôtel de ville" || partie.board[arrivée].name=="Entrepôt") && partie.board[arrivée].owner==idJoueur){
        partie.board[départ].base=arrivée
      }
        //Cas où on a tenté de mettre un nouveau builder sur un job
        if (partie.board[arrivée]!=undefined && partie.board[départ].name=="Ouvrier" && partie.board[départ].owner==idJoueur){
            if (partie.addToChantier(départ,arrivée,idJoueur)){
            return
            }
          
        }
      
        
      let route = partie.pathfindToDestination(départ, arrivée, idJoueur)
      partie.board[départ].destination = arrivée
      if (["Mineur","Paysanne","Bûcheron","Archer","Frondeur"].includes(partie.board[départ].name)){partie.board[départ].objectif=undefined}
      if (route == false) { return false }
      partie.board[départ].path = route
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

    if (partie.canOrder(socket.idJoueur,data)==false){return }


    var res = partie.recruteOuvrier(data)
    if (res!=false){
      socket.emit("dialogue",{"message":"Je m'y mets tout-de-suite, general !", "unite":"ouvrier","couleur": "rouge"})
      socket.emit("recruterOuvrier",res)}
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
  socket.on("recruteChevalDeTroie",data=>{
    let partie = parties[socket.idPartie]
    if (partie==undefined){return}
    if (socket.idJoueur==undefined){return}

    if (partie.canOrder(socket.idJoueur,data)==false){return }


    var res = partie.recruteChevalDeTroie(data)
    if (res!=false){
      socket.emit("dialogue",{"message":"C'est l'heure de passer à l'attaque !", "unite":"cheval de troie","couleur": "rouge"})
      socket.emit("evolution",{"position":res,"newUnit":"cheval de troie"}); 
      return}
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
    socket.on("demandeUnitesMine",data=>{
      var partie = parties[socket.idPartie]
      var idJoueur = socket.idJoueur
      if (data==undefined || partie==undefined || idJoueur==undefined){return}

      var retour = partie.getUnitesMine(data,idJoueur)
      if (retour != undefined && retour != false){socket.emit("demandeUnitesMine",retour)}

    })

    socket.on("demandeUnitesTour",data=>{
      var partie = parties[socket.idPartie]
      var idJoueur = socket.idJoueur
      if (data==undefined || partie==undefined || idJoueur==undefined){return}

      var retour = partie.getUnitesMine(data,idJoueur)
      if (retour != undefined && retour != false){socket.emit("demandeUnitesTour",retour)}

    })


    socket.on("sortirTour",data=>{
      var partie = parties[socket.idPartie]
      var idJoueur = socket.idJoueur
      if (data==undefined || partie==undefined || idJoueur==undefined){return}
      var check = partie.sortirTour(data.unite,data.position,idJoueur,data.index)
      if (check!=false){
        socket.emit("evolution",check)
        return
      }
    })
    


    socket.on("sortirChamp",data=>{
      var partie = parties[socket.idPartie]
      var idJoueur = socket.idJoueur
      if (data==undefined || partie==undefined || idJoueur==undefined){return}
      var check = partie.sortirChamp(data.unite,data.position,idJoueur,data.index)
      if (check!=false){
        socket.emit("evolution",check)
        return
      }
    })

    socket.on("demandeHDV",data=>{
      var partie = parties[socket.idPartie]
      var idJoueur = socket.idJoueur
      if (partie==undefined || idJoueur==undefined){return}

      var retour = partie.getHDV(idJoueur)
      if (retour!=undefined && retour!=false){
        socket.emit("demandeHDV",retour)
      }

    })


    socket.on("mail",data=>{


      var partie = parties[socket.idPartie]
      if (partie==undefined){return}
      var idJoueur = socket.idJoueur
      var joueur = partie.players[idJoueur]
      if (data==undefined || partie==undefined || idJoueur==undefined || joueur==undefined){return}
      var check = partie.canOrder(idJoueur,data.hdv)
      if (check==true){
          if (partie.addLetter(data.objet,data.contenu,joueur,data.cite)){
            socket.emit("dialogue",{"message":"Je pars sur le champ !", "unite":"messager","couleur": "rouge"})
            socket.emit("mail",true);
          }
        //{objet:objetMail.textContent,contenu:contenuMail.textContent});


      }
    })

    socket.on("nouveauEspion",data=>{
      var partie = parties[socket.idPartie]
      var idJoueur = socket.idJoueur
      if (data==undefined || partie==undefined || idJoueur==undefined){return}
      var check = partie.canOrder(idJoueur,data.hdv)
      if (check==true){if (partie.addEspion(idJoueur,data.positionEspion)){
        socket.emit("dialogue",{"message":"Ils ne vont rien voir venir 🕵️", "unite":"espionne","couleur": "rouge"})

        socket.emit("nouveauEspeion",true)}}
    })




    socket.on("echangeRessources",data=>{
      var partie = parties[socket.idPartie]
      var idJoueur = socket.idJoueur
      if (data==undefined || partie==undefined || idJoueur==undefined || data.hdv==undefined){return}
      var check = partie.canOrder(idJoueur,data.hdv)
      if (check==true){
          if (partie.newTrade(data,idJoueur)){
            socket.emit("echangeRessources",true);
            socket.emit("dialogue",{"message":"Je pars sur le champ !", "unite":"messager","couleur": "rouge"})
          }
      }})



    socket.on("demandeMines",data=>{
      var partie = parties[socket.idPartie]
      if ( partie==undefined ){return}
      socket.emit("demandeMines",partie.map.mines)
    })



    socket.on("Stratégie",data=>{
      var partie = parties[socket.idPartie]
      var idJoueur = socket.idJoueur
      if (data==undefined || partie==undefined || idJoueur==undefined || data.position == data.newStrat ||data.newStrat==undefined){return}
      var check = partie.canOrder(idJoueur,data.position)
      
      if (check==true){
        if (partie.changeStrat(idJoueur,data.position,data.newStrat)){
          socket.emit("Stratégie",true)
          var uni = partie.board[data.position]; if (uni!=undefined){socket.emit("dialogue",{"message":"C'est compris !", "unite":uni.name,"couleur": "rouge"})
          }
        }
      }
      



    })

    socket.on("askMaps",data=>{
      socket.emit("askMaps",getMapList())
    })


    socket.on("retourTrade",data=>{
      var partie = parties[socket.idPartie]
      var idJoueur = socket.idJoueur
      if (idJoueur==undefined || partie==undefined){return false}

      if (data.accepte==false){partie.refuseTrade(idJoueur,data.idRequête)}
      else{
      var check = partie.accepteTrade(idJoueur,data.idRequête,data.hdv)
      if (check!=false && check!=undefined){
        socket.emit("evolution",check)
      }
    }



    })

    socket.on("citesPrésentes",data=>{
      var partie = parties[socket.idPartie]
      if (partie==undefined){return}
      var retour = []
      if (partie.citePrise("beotie")){retour.push("beotie")}
      if (partie.citePrise("attique")){retour.push("attique")}
      if (partie.citePrise("argolide")){retour.push("argolide")}
      socket.emit("citesPrésentes",retour)
    })


    socket.on("demandeTuto",data=>{

          var retour = fs.readFileSync(__dirname+"/gameDatas/tutoriel.json");
          if (retour!=undefined){socket.emit("demandeTuto",JSON.parse(retour))};




    })



      socket.on("transfertRessources",data=>{
        console.log(data)
        var partie = parties[socket.idPartie]
        if (partie==undefined){return}
        if (partie.canOrder(socket.idJoueur,data.hdv)==false || data.entrepotDepart==undefined || data.entrepotArrive==undefined || data.entrepotDepart==data.entrepotArrive){return}
        var check = partie.transfertRessources(data,socket.idJoueur)

        if (check){
          socket.emit("dialogue",{"message":"Très bien, j'y serai en un rien de temps.", "unite":"caravane de commerce","couleur": "rouge"})
          socket.emit("evolution",check)
        }
      })



      //Affichage des messages de dieu
      socket.on("messageDieu",data=>{
        var partie = parties[socket.idPartie]
        if (partie==undefined){return}
        var retour = partie.getMessageDieu(socket.idJoueur)
        if (retour!=undefined){socket.emit("dialogue",retour)}
      })

});

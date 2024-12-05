const express = require('express');
const app = express();
const http = require('http');
const { isNumberObject } = require('util/types');
const server = http.createServer(app);
const io = new require("socket.io")(server);

const { Creature } = require('./Créature.js');
const { Joueur } = require('./Joueur.js');
const { Game } = require('./Game.js');
const {Lobby} = require("./Lobby.js")
const { Banane } = require('./banane.js');
var game;
var positionTanieres;

app.use(express.static(__dirname));

const PORT = 8888;
const IP = "localhost"
server.listen(PORT, () => {
  console.log(`Server is running on ${IP}:${PORT}`);
});


const lobbies = []
const games = []



//-------------------------------Express-------------------------------------------
app.get('/', (request, response) => {
  response.sendFile('index.html', {root: __dirname});
});

app.get('/fichier/:nomFichier', function(request, response) {
  // console.log("renvoi de "+request.params.nomFichier);
  response.sendFile(request.params.nomFichier, {root: __dirname});
});

app.get('/ressources/:nomFichier', function(request, response) {
  // console.log("renvoi de "+request.params.nomFichier);
  response.sendFile(request.params.nomFichier, {root: __dirname+"/ressources"});
});
//-------------------------------Fonctions------------------------------------------
















/* 

function initGame(firstPlayer,nbJoueurs){
game = new Game(firstPlayer);
game.setNbJoueurs(nbJoueurs);
game.setTours(10);
var largeur=13;
var longueur=13;
positionTanieres = [Math.floor(longueur/2)+13,Math.floor(((largeur-1)*longueur+longueur/2))-13,Math.floor(Math.floor(((largeur/2)))*longueur+1),Math.floor(Math.floor(((largeur/2)))*longueur+longueur-2)]
console.log("Position des tanières:"+positionTanieres)

//Création de la partie
for (i=0;i<longueur*largeur;i++){game.board.push(0);}

  game.terrain = [];
  for (i=0;i<longueur*largeur;i++){proba = Math.random()*100;
    if (proba<15){game.terrain.push("eau");}else{if (proba>65){game.terrain.push("plaine");}else{if (proba>60&&i%13!=0&&i%13!=12&&i/13!=0&&i/13!=12){game.terrain.push("montagne");}else{game.terrain.push("rocher");}}}}

    for (i=0;i<game.nbJoueurs;i++){

        game.terrain[positionTanieres[i]]=""+(i+1)
        game.board[positionTanieres[i]] = []
      }
      game.tanières = positionTanieres;
      console.log("terrain généré")
      console.log("Jeu vidé");
    }
    
    
    function actualisation(){
  var jeusimplifié = [];
  for (i in game.joueurs){
  jeusimplifié[i] = [];
  for(creature of game.joueurs[i].creatures){
    jeusimplifié[i].push(creature.position);
  }
  }
    
    io.emit("actualisation",{"players":game.joueurs,"jeu":jeusimplifié,"jeucomplet":game})
 }


 
 
 //Fonction qui gère le passage d'un tour
 function tour(jeu) {//Avec du recul ça aurait été plus malin de mettre la fonction "tour" comme méthode de la classe game, à noter pour la prochaine fois
  if (jeu.tourActuel >= jeu.nbtours) {
    
    var winner = jeu.getWinner();
    actualisation();
    io.emit('gameFinished',winner);

      console.log("partie finie, gagnant: "+winner);

      game = null;
      positionTanieres = null;
      haveHost = null;

      return;

  }

  jeu.reproduction();//Gère la reproduction de toutes les équipes
  jeu.joueurs.forEach(player => {
    //Gestion power
    if (player.cooldown>0){player.cooldown--;}
      if (player.power=="banane"){
        for (var banane of player.bananes){banane.tirer(game)}
      }

//Gestion animaux
      for (var animal of player.creatures) {
        animal.jouer(jeu);
        if (animal.cooldown>0){animal.cooldown--}
        
      }
    });
    actualisation();

    
  jeu.tourActuel++;
  console.log("Tour: "+jeu.tourActuel)

  setTimeout(() => {
    actualisation();
      tour(jeu);
  }, 1000);
}*/
//-------------------------------Sockets-------------------------------------------
var haveHost = false;
io.on('connection', (socket) => {//Reçoit les données d'une game, les vérifie, crée la game, la met temporairement dans la liste des lobbys et renvoie un socket avec l'ID de la game
  socket.on('load',data=>{socket.emit('loaded',!haveHost);haveHost=true;console.log("nouveau chargement de la page");})
  
  socket.on("lobbyList",()=>{
    var gargl = []
    for (z of lobbies){
      gargl.push({"id":z.gameId,"wolf":z.gameDatas.wolf,"name":z.lobbyName,"currentPlayers":z.joueurs.length,"maxPlayers":z.nbJoueurs})
    }
  io.emit("lobbyList",gargl)
  })


  socket.on("createGame",data=>{
  console.log("Tentative de création d'une nouvelle partie:")
    console.log(data)
    var nbJoueurs = data.nbJoueurs
    if (isNaN(nbJoueurs)||nbJoueurs=="" || nbJoueurs==null || nbJoueurs==NaN || nbJoueurs==undefined){console.log("nbJoueurs invalide");return}
    var plaine = data.plaine;var eau=data.eau;var rocher=data.rocher;var montagne=data.montagne;
    
    if (plaine > 100 ||plaine < 0 || eau > 100 || eau < 0 || rocher > 100 || rocher < 0 ||montagne > 100 || montagne < 0 ) {console.log("Pourcentages terrain invalides"); return }
    var wolf = data.wolf
    if (wolf!=false && wolf!=true){console.log("Paramètres du loup invalides");return}
  
    console.log("  |->Valide")
  var lobby = new Lobby(data)
  lobbies.push(lobby)
  socket.emit("joinLobby",{"data":lobby.gameDatas,"id":lobby.hostId,"host":true,"gameId":lobby.gameId})
  var gargl = []
  for (z of lobbies){
    gargl.push({"id":z.gameId,"wolf":z.gameDatas.wolf,"name":z.lobbyName,"currentPlayers":z.joueurs.length,"maxPlayers":z.nbJoueurs})
  }
io.emit("lobbyList",gargl)


  setTimeout(() => {//Pour ne pas garder les games vides, on l'enlève après 4 minutes si elle y est toujours
      for (z in lobbies){
        if (lobbies[z].id==lobby.id){lobbies.splice(z,1);}
      }
  }, 240000);

  })
  
  /*
  socket.on('join',data=>{
    let joueur;
    if (game==null){
      if (data.host==false){socket.emit("systeme","Veuillez attendre que la partie soit crée");return;}//Cas où l'host ne se connecte pas le premier
      console.log("-----------------------------------------\ncreation partie par "+data.pseudo);
      
      joueur = new Joueur(true,data.pseudo,data.power)//Création de la partie selon l'hôte et ses paramètres
      initGame(joueur,data.nbJoueurs);
      let male = new Creature(data.tauxrepro,data.perception,data.force,"male",positionTanieres[0],positionTanieres[0])
      let femelle = new Creature(data.tauxrepro,data.perception,data.force,"female",positionTanieres[0],positionTanieres[0])
      game.joueurs[0].addCreature(male)
      game.joueurs[0].addCreature(femelle)
      game.board[positionTanieres[0]].push(male);
      game.board[positionTanieres[0]].push(femelle);

     

      game.setTours(data.nbTours);
      console.log("Max joueurs: "+data.nbJoueurs+"\nNombre de tours: "+data.nbTours+"\n-----------------------------------------\n");
    }

    else {for (player of game.joueurs){if (player.pseudo==data.pseudo){
      console.log("pseudonyme pris");
      socket.emit("joined","pseudopris");return;
    }};

    console.log("Nouvelle connection: " +data.pseudo+"\nhote: "+data.host);
    if (game.joueurs.length>=game.nbJoueurs){
      socket.emit("joined","complet");return;
    }

    //Création du joueur-----
    joueur=new Joueur(false,data.pseudo,data.power)
    let male = new Creature(data.tauxrepro,data.perception,data.force,"male",positionTanieres[game.joueursConnectes],positionTanieres[game.joueursConnectes])
    let femelle = new Creature(data.tauxrepro,data.perception,data.force,"female",positionTanieres[game.joueursConnectes],positionTanieres[game.joueursConnectes])
    joueur.addCreature(male)
    joueur.addCreature(femelle)
    game.board[positionTanieres[game.joueursConnectes]].push(male)
    game.board[positionTanieres[game.joueursConnectes]].push(femelle)  
    game.addJoueur(joueur)
    actualisation();

  

  }

  //Le damier utilisé pour l'actuaisation côté client est calculé via les joueurs
  var jeusimplifié = [];
  for (i in game.joueurs){
  jeusimplifié[i] = [];
  for(creature of game.joueurs[i].creatures){
    jeusimplifié[i].push(creature.position);
  }

  }

    socket.emit("joined",{"players":game.joueurs,"jeu":jeusimplifié,"jeucomplet":game})
    console.log("Joueurs:\n");
    game.joueurs.forEach(element => {
      console.log(element);
    });


  if (game.nbJoueurs==game.joueursConnectes){
    console.log("démarrage de la partie")
    io.emit("systeme","La partie commence !")

    tour(game)}
});

  socket.on('unload',data=>{if(data==true){haveHost=false;console.log("hôte déconnecté.")}})


 
  socket.on('powerUtilise', data=>{ //Données reçues sous la forme  { "position": this.id.substring(1), "pseudo": informationsJoueur.pseudo}
    if (game.tourActuel==0){socket.emit("systeme","La partie n'a pas encore commencé");return;}
    let position = parseInt(data.position);
    if (game.tanières.includes(position)){socket.emit("systeme","Impossible d'utiliser un power sur une tanière");return}

      for (var joueur of game.joueurs){
        if (joueur.pseudo==data.pseudo){
          //On isole le joueur concerné
          if (joueur.cooldown>0){socket.emit("systeme","Vous ne pouvez pas encore utiliser votre power !");return;}

            if (joueur.power=="pasteque"){
              game.terrain[position] = "pasteque"
              joueur.cooldown = joueur.maxcooldown;
              actualisation();
            }
          
            if (joueur.power=="banane"){
                let canplace = false;
                if (game.board[position]!=1&&joueur.creatures.includes(game.board[position])){
                  canplace = true;
                }
                for (var test of game.casesAdjacentes(position)){
                  if (game.board[test]!=1&&joueur.creatures.includes(game.board[test])){
                    canplace = true;
                  }
                }

                if (canplace==false){socket.emit("systeme","Doit être placé près d'une de vos troupes");return;}


                for (var test of game.joueurs){
                  if (test.power=="banane"){
                  for (var t2 of test.bananes){
                      if (t2.position==position){
                        socket.emit("systeme","Il y a déjà une banane sur cet hexagone");return;
                      }
                  }
                  }
                }
            

              joueur.bananes.push(new Banane(data.pseudo,position))
              joueur.cooldown = joueur.maxcooldown;
              actualisation();

            }

            
            if (joueur.power=="coco"){
              for (var test of game.casesAdjacentes(position)){if (game.tanières.includes(test)){socket.emit("systeme","Trop près d'une tanière !");return}}
              game.coco(position)
              joueur.cooldown = joueur.maxcooldown;
              actualisation();
            }



        }
      }


  });
*/                    

});




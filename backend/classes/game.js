const motsGrece = ["Acropole", "Athéna", "Aristote", "Hoplite", "Méduse", "Sparte", "Zeus", "Olympie", "Parthénon", "Delphes", "Poséidon", "Socrate", "Platon", "Léonidas", "Héraclès", "Troie", "Odyssée", "Agora", "Dionysos", "Hadès", "Archimède", "Pythagore", "Mycènes", "Déméter", "Thermopyles", "Thucydide", "Rhétorique", "Cheval de Troie", "Phalange", "Colosse", "Marathon", "Péloponnèse", "Épicure", "Périclès"];
const adjectifs = ["Bancal", "Rigolo", "Fou", "Chancelant", "Bizarre", "Dingue", "Louche", "Zigzagant", "Moelleux", "Farfelu", "Grinçant", "Pétillant", "Foufou", "Clownesque", "Dodu", "Sautillant","Majestueux", "Légendaire", "Glorieux", "Héroïque", "Divin", "Redoutable", "Éternel", "Victorieux", "Puissant", "Imposant", "Intrépide", "Grandiose", "Immortel", "Inébranlable", "Formidable", "Valeureux", "Épique", "Mythique", "Titanesque", "Fulgurant","Lumineux", "Énigmatique", "Merveilleux", "Mystérieux", "Chaleureux", "Étincelant", "Rêveur", "Apaisant", "Charmant", "Bucolique", "Rayonnant", "Aérien", "Coloré", "Féerique", "Paisible", "Onirique", "Chatoyant", "Doux", "Fantaisiste", "Éblouissant"];
const couleurs = ["rouge","bleu","vert","jaune"]

const { v4: uuidv4 } = require('uuid');
const { casesAdjacentes, getX, getY, getCoords, offset_to_cube, distance, pathFind } = require('../modules/backendHex');
const {createMap} = require('../modules/mapGeneration')
const {player} = require('./player');
const { hexagon } = require('./hexagon');
const { hoplite,stratege,archer} = require('./unit');
class game {
    constructor(nbJoueurs,nbTours){
        this.nbJoueurs = nbJoueurs;
        this.nbTours = nbTours;
        this.id = uuidv4()
        this.players = {}

        this.map = createMap()
        this.board = {}
        this.positionsDepart = {"beotie":214,"attique":1072,"argolide":297}
        this.name = motsGrece[Math.floor(Math.random()*motsGrece.length)]+"-"+adjectifs[Math.floor(Math.random()*adjectifs.length)]

    }

    currentPlayers(){return Object.keys(this.players).length}

    addPlayer(){
        if (this.currentPlayers()>=this.nbJoueurs){
            return false
        }
        var joueur = new player(couleurs[Object.keys(this.players).length])
        this.players[joueur.id]=joueur
        return joueur.id
    }

    
    citePrise(cite){
        for (z of Object.keys(this.players)){
            if (this.players[z].cite==cite){return true}   
        }
        return false
    }
    canStart(){
        if (this.currentPlayers()<this.nbJoueurs){return false}
        var cites = ["argolide","beotie","attique"]
        for (zz of Object.keys(this.players)){
            var z = this.players[zz]
            if (z.cite==undefined || z.cite=="none" || !cites.includes(z.cite) ){return false}            
        }
        return true

    }

    addUnit(unit,position,player){
        if (this.board[position]==undefined){
            this.board[position]=unit
            player.addUnit(unit,position)
        }
        else{
            return false
        }
    }


    initBeotie(joueur){
        
        var boardBoetie = {
            185:new stratege(185,joueur),
            154:new archer(154,joueur),
            332:new archer(332,joueur)
        }

        for (var position of Object.keys(boardBoetie)){
            this.addUnit(boardBoetie[position],position,joueur)
            this.map.infos[position] = new hexagon("plaine","plaine_1",position)
            this.map.terrain[position]=this.map.infos[position].pattern
            }       
    }

    initArgolide(joueur){
        var boardArgolide  = {
            328:new stratege(328,joueur),
            327:new archer(327,joueur),
            237:new archer(237,joueur)
        }

        for (var position of Object.keys(boardArgolide)){
            this.addUnit(boardArgolide[position],position,joueur)
            this.map.infos[position] = new hexagon("plaine","plaine_1",position)
            this.map.terrain[position]=this.map.infos[position].pattern
            }    
    }
    initAttique(joueur){
        var boardAttique  = {
            1011:new stratege(1011,joueur),
            1101:new archer(1101,joueur),
            1073:new archer(1073,joueur)
        }

        for (var position of Object.keys(boardAttique)){
            this.addUnit(boardAttique[position],position,joueur)
            this.map.infos[position] = new hexagon("plaine","plaine_1",position)
            this.map.terrain[position]=this.map.infos[position].pattern
            }    
    }

    initCites(){//Initialise les cités
        
        for (var joueur of Object.keys(this.players)){
                var ville = this.players[joueur].cite 
                var position = this.positionsDepart[ville]
                switch(ville){
                    case "beotie":
                        this.initBeotie(this.players[joueur])
                        break
                    case "argolide":
                        this.initArgolide(this.players[joueur])
                        break
                    case "attique":
                        this.initAttique(this.players[joueur])
                        break

                }
            }
        }


        init(){//Fonction qui initialise la partie
            this.initCites()

        }


        calculVision(unit){//Renvoi les informations de ce qui est visible par l'unité passée en paramètre
            var pos = unit.position
            var vision = unit.vision
            var retour = []
            var positionsVues = [pos]
            var positionsAdded = [pos]
            while (vision>  0){
                for (var z of positionsVues){
                    for (var zz of casesAdjacentes(z,this.map.width,this.map.height)){
                        if (!positionsVues.includes(zz) && !positionsAdded.includes(zz)){
                            positionsAdded.push(zz)
                        }
                    }
                }
                for (var j of positionsAdded){positionsVues.push(j)
                }
                vision--
            }
            for (var z of positionsVues){
                retour.push({"info":this.map.infos[z],"terrain":this.map.infos[z].pattern,"board":this.board[z]})
            }
            return retour

        }

        calculVue(player){//Crée la vue qui s'affichera pour le joueur, player étant un id
            var joueur = this.players[player]
          
            var retour = {"height":this.map.height,"width":this.map.width,"infos":[],"terrain":[],"board":{}}
           
            for (var z=0;z<this.map.height*this.map.width;z++){
                retour.infos.push(new hexagon("?","?",z))
                retour.terrain.push("?")
            }


            for (var uni of Object.keys(joueur.units)){
                var casesVues = this.calculVision(joueur.units[uni])
                for (var z of casesVues){
                    var posi = z.info.pos

                    retour.infos[posi] = z.info
                    retour.terrain[posi]=z.terrain
                    if (z.board!=undefined){retour.board[posi]=z.board}
            }
        }

        return retour

    }
        
    couldMove(unit,destination){//Regarde si l'unité pourrait aller à destination dans l'état actuel des choses et, si oui, tente de le faire
        if (!casesAdjacentes(unit.position,this.map.width,this.map.height).includes(destination)){return false}//Déplacement une case par une case, si la destination n'est pas adjacente on annule
        if (!unit.canGo(this.map.terrain[destination])){return false}//Si l'unité ne peut pas se déplacer à destination, on annule
        
        //A faire: Check si il y a une unité appartenant au même propriétaire
    }

    move(unit,destination){//Tente de déplacer unit sur la case destination. Retourne "false" si impossible, "true" sinon. Si la destination est occupée, initie un combat
        if (unit==undefined){return false}
        if (destination<0 || destination>this.map.terrain.length){return false}
        console.log(destination)
        console.log(casesAdjacentes(unit.position,this.map.width,this.map.height))
        if (!casesAdjacentes(unit.position,this.map.width,this.map.height).includes(destination)){return false}//Déplacement une case par une case, si la destination n'est pas adjacente on annule
        console.log("gargl")
        if (!unit.canGo(this.map.terrain[destination])){return false}//Si l'unité ne peut pas se déplacer à destination, on annule
      
        let unitOwner = this.players[unit.owner]
        if (this.board[destination]==undefined){//Cas où la case est libre
            unitOwner[unit.position]=undefined
            this.board[unit.position]=undefined
            this.board[destination] = unit
            unit.position = destination
            unitOwner[unit.position]=unit
            return true
        }

        else{//Cas où la case est occupée
            target = this.board[destination]
            targetOwner = this.players[target.owner]


        }


    }


    }




        

        
        module.exports = { game };

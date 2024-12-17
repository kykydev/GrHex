const motsGrece = ["Acropole", "Athéna", "Aristote", "Hoplite", "Méduse", "Sparte", "Zeus", "Olympie", "Parthénon", "Delphes", "Poséidon", "Socrate", "Platon", "Léonidas", "Héraclès", "Troie", "Odyssée", "Agora", "Dionysos", "Hadès", "Archimède", "Pythagore", "Mycènes", "Déméter", "Thermopyles", "Thucydide", "Rhétorique", "Cheval de Troie", "Phalange", "Colosse", "Marathon", "Péloponnèse", "Épicure", "Périclès"];
const adjectifs = ["Bancal", "Rigolo", "Fou", "Chancelant", "Bizarre", "Dingue", "Louche", "Zigzagant", "Moelleux", "Farfelu", "Grinçant", "Pétillant", "Foufou", "Clownesque", "Dodu", "Sautillant","Majestueux", "Légendaire", "Glorieux", "Héroïque", "Divin", "Redoutable", "Éternel", "Victorieux", "Puissant", "Imposant", "Intrépide", "Grandiose", "Immortel", "Inébranlable", "Formidable", "Valeureux", "Épique", "Mythique", "Titanesque", "Fulgurant","Lumineux", "Énigmatique", "Merveilleux", "Mystérieux", "Chaleureux", "Étincelant", "Rêveur", "Apaisant", "Charmant", "Bucolique", "Rayonnant", "Aérien", "Coloré", "Féerique", "Paisible", "Onirique", "Chatoyant", "Doux", "Fantaisiste", "Éblouissant"];
const couleurs = ["rouge","bleu","vert","jaune"]

const { v4: uuidv4 } = require('uuid');
const { casesAdjacentes, getX, getY, getCoords, offset_to_cube, distance, pathFind } = require('../modules/backendHex');
const {createMap} = require('../modules/mapGeneration')
const {player} = require('./player');
const { hexagon } = require('./hexagon');
const { hoplite,stratege} = require('./unit');
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


    initCites(){//Initialise les cités
        
        for (var joueur of Object.keys(this.players)){
                var ville = this.players[joueur].cite 
                var position = this.positionsDepart[ville]
                this.map[position] = new hexagon("plaine","plaine_1",position)
                this.addUnit(new stratege(position,this.players[joueur]),position,this.players[joueur])
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
        





    }




        

        
        module.exports = { game };

const motsGrece = ["Acropole", "Athéna", "Aristote", "Hoplite", "Méduse", "Sparte", "Zeus", "Olympie", "Parthénon", "Delphes", "Poséidon", "Socrate", "Platon", "Léonidas", "Héraclès", "Troie", "Odyssée", "Agora", "Dionysos", "Hadès", "Archimède", "Pythagore", "Mycènes", "Déméter", "Thermopyles", "Thucydide", "Rhétorique", "Cheval de Troie", "Phalange", "Colosse", "Marathon", "Péloponnèse", "Épicure", "Périclès"];
const adjectifs = ["Bancal", "Rigolo", "Fou", "Chancelant", "Bizarre", "Dingue", "Louche", "Zigzagant", "Moelleux", "Farfelu", "Grinçant", "Pétillant", "Foufou", "Clownesque", "Dodu", "Sautillant","Majestueux", "Légendaire", "Glorieux", "Héroïque", "Divin", "Redoutable", "Éternel", "Victorieux", "Puissant", "Imposant", "Intrépide", "Grandiose", "Immortel", "Inébranlable", "Formidable", "Valeureux", "Épique", "Mythique", "Titanesque", "Fulgurant","Lumineux", "Énigmatique", "Merveilleux", "Mystérieux", "Chaleureux", "Étincelant", "Rêveur", "Apaisant", "Charmant", "Bucolique", "Rayonnant", "Aérien", "Coloré", "Féerique", "Paisible", "Onirique", "Chatoyant", "Doux", "Fantaisiste", "Éblouissant"];

const { v4: uuidv4 } = require('uuid');
const { casesAdjacentes, getX, getY, getCoords, offset_to_cube, distance, pathFind } = require('../modules/backendHex');
const {createMap} = require('../modules/mapGeneration')
const {player} = require('./player')
class game {
    constructor(nbJoueurs,nbTours){
        this.nbJoueurs = nbJoueurs;
        this.nbTours = nbTours;
        this.id = uuidv4()
        this.players = {}

        this.map = createMap()
        this.positionsDepart = {"béotie":215,"attique":1072,"argolide":297}
        this.name = motsGrece[Math.floor(Math.random()*motsGrece.length)]+"-"+adjectifs[Math.floor(Math.random()*adjectifs.length)]

    }

    currentPlayers(){return Object.keys(this.players).length}

    addPlayer(){
        if (this.currentPlayers()>=this.nbJoueurs){
            return false
        }
        var joueur = new player()
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

        
}
        
        module.exports = { game };

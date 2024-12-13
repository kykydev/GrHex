
const { v4: uuidv4 } = require('uuid');
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

    }

    addPlayer(){
        if (this.players.len>=this.nbJoueurs){
            return false
        }
        var joueur = new player()
        this.players[joueur.id]=joueur
        return joueur.id
    }


}



module.exports = { game };

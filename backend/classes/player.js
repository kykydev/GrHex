
const { v4: uuidv4 } = require('uuid');
const { casesAdjacentes, getX, getY, getCoords, offset_to_cube, distance, pathFind } = require('../modules/backendHex');

class player {
    constructor(couleur){
        this.id = uuidv4()
        this.units = {}
        this.couleur=couleur
        this.played = false
        this.eliminated=false
    }

    choseCite(citer){
    var cites = ["argolide","beotie","attique"]
    if (!cites.includes(citer)){return false}
    this.cite = citer
    }


    addUnit(unit,position){
        this.units[position]=unit
    }







}



module.exports = { player };

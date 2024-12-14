
const { v4: uuidv4 } = require('uuid');
class player {
    constructor(){
        this.id = uuidv4()
    }

    choseCite(citer){
    var cites = ["argolide","beotie","attique"]
    if (!cites.includes(citer)){return false}
    this.cite = citer
    }

}



module.exports = { player };

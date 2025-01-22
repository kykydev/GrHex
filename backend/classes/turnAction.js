
class turnAction {

constructor(type,priorité,joueur){
    this.type=type
    this.priorité=priorité 
    this.joueur=joueur
}
}

class moveAction{
constructor(pos,joueur){
    super("movement",(100+joueur.units[start]),joueur)
    this.pos = pos
}
}


class newUnitAction{
    constructor(caserne,joueur){
        super("newUnit",10,joueur)
        this.origin = caserne
    }
    }

class buildAction{
        constructor(zone,building,joueur){
            super("newBuilding",5,joueur)
            this.origin = zone
            this.building = building
        }
        }





module.exports = { turnAction,moveAction,newUnitAction,buildAction};

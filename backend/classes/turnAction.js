
class turnAction {

constructor(type,priorité,joueur){
    this.type=type
    this.priorité=priorité 
    this.joueur=joueur
}
}

class moveAction extends turnAction{
constructor(pos,joueur){
    super("movement",(120-joueur.units[pos].initiative),joueur)
    this.pos = pos
}
}


class newUnitAction extends turnAction{
    constructor(caserne,joueur){
        super("newUnit",10,joueur)
        this.origin = caserne
    }
    }

class buildAction extends turnAction{
        constructor(zone,building,joueur){
            super("newBuilding",5,joueur)
            this.origin = zone
            this.building = building
        }
        }





module.exports = { turnAction,moveAction,newUnitAction,buildAction};


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

class neutralMoveAction extends turnAction{
    constructor(pos){
        super("movement",(120))
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


class builderPickupAction extends turnAction{
    constructor(uni,joueur){
        super("builderPickup",250,joueur)
        this.uni=uni
    }
}

class builderBuildAction extends turnAction{
    constructor(uni,joueur){
        super("builderBuild",300,joueur)
        this.uni=uni
    }
}





module.exports = { turnAction,moveAction,newUnitAction,buildAction,neutralMoveAction,builderPickupAction,builderBuildAction};

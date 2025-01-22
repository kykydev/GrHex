
class turnAction {

constructor(type,priorité,joueur){
    this.type=type
    this.priorité=priorité 
    this.joueur=joueur
}
}

class moveAction{
constructor(start,dest,joueur){
    super("movement",(100+joueur.units[start]),joueur)
    this.start=start
    this.dest=dest
}
}


class newUnitAction{
    constructor(caserne,joueur){
        super("newUnit",1,joueur)
        this.origin = caserne
    }
    }





module.exports = { turnAction,moveAction,newUnitAction,buildAction};

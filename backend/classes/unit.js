
class unit {
    constructor(hp,attack,defense,initiative,movement,name,position,player,vision){
       this.hp=hp
       this.couleur=player.couleur
       this.attack=attack
       this.defense=defense
       this.initiative=initiative
       this.movement=movement
       this.name=name
        this.position=position
        this.owner=player.id
        this.vision=vision
    }

}


class hoplite extends unit{
    constructor(position,player){
        super(100,10,5,2,3,"Hoplite",position,player,3)
    }
}

class stratege extends unit{
    constructor(position,player){
        super(1500,40,15,0,3,"Stratege",position,player,4)
    }
}


module.exports = { hoplite,stratege };

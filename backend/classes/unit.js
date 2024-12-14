
class unit {
    constructor(hp,attack,defense,initiative,movement,name,position,player){
       this.hp=hp
       this.attack=attack
       this.defense=defense
       this.initiative=initiative
       this.movement=movement
       this.name=name
        this.position=position
        this.owner=player
    }

}

class hoplite extends unit{
    constructor(position,player){
        super(100,10,5,2,3,"Hoplite",position,player)
}
}


module.exports = { hoplite };

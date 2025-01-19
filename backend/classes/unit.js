
class unit {
    constructor(hp,attack,defense,initiative,movement,name,position,player,vision, range){
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

    canGo(dest){//Prend un terrain et renvoie true ou false selon si l'unité peut s'y rendre. Par défaut, l'eau est interdite mais pour les bâteaux ce sera l'inverse
        if (dest=="X" || dest=="eau"){return false}
        return true
    }
}


class hoplite extends unit{
    constructor(position,player){
        super(100,15,5,2,3,"Hoplite",position,player,0,1)
    }
}

class stratege extends unit{
    constructor(position,player){
        super(800,40,15,0,3,"Stratege",position,player,4,1)
    }
}
class archer extends unit{
    constructor(position,player){
        super(70,10,0,4,3,"Archer",position,player,0,2)
    }
}

module.exports = { hoplite,stratege,archer };

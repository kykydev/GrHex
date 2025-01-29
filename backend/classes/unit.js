const { casesAdjacentes } = require("../modules/backendHex")

class unit {
    constructor(hp,attack,defense,initiative,movement,name,position,player,vision, range){
        this.hp=hp
        this.maxhp = this.hp
       this.couleur=player.couleur
       this.attack=attack
       this.defense=defense
       this.range=range
       this.initiative=initiative
       this.movement=movement
       this.movementLeft = this.movement    
       this.name=name
        this.position=position
        this.owner=player.id
        this.vision=vision
        this.destination = undefined
        this.path = undefined
        this.type="unit"
    }

    canGo(dest){//Prend un terrain et renvoie true ou false selon si l'unité peut s'y rendre. Par défaut, l'eau est interdite mais pour les bâteaux ce sera l'inverse
        if (dest=="X" || dest=="eau"){return false}
        return true
    }

    canEvolve(){
        return false
    }
    findGoal(partie){
        return undefined
    }
    
}


class hoplite extends unit{
    constructor(position,player){
        super(50,15,5,5,2,"Hoplite",position,player,1,1)
    }
}

class stratege extends unit{
    constructor(position,player){
        super(150,40,15,15,2,"Stratege",position,player,3,1)
    }
}
class archer extends unit{
    constructor(position,player){
        super(30,10,0,1,1,"Archer",position,player,2,2)
        this.range=2
    }
}

class messager extends unit{
    constructor(position,player){
        super(30,0,15,7,3,"Messager",position,player,2,1)
    }
}

class bucheron extends unit{
    constructor(position,player){
        super(25,10,5,2,1,"Bûcheron",position,player,1,1)
        this.wood=0
        this.maxWood=10
    }
    canEvolve(){
        return true
    }

    evolution(player){
        return (new hoplite(this.position,player))
    }
}

class mineur extends unit{
    constructor(position,player){
        super(20,10,5,2,1,"Mineur",position,player,1,1)
        this.stone=0
        this.maxStone=8
    }
    canEvolve(){
        return true
    }

    evolution(player){
        return (new hoplite(this.position,player))
    }
}

class paysanne extends unit{
    constructor(position,player){
        super(15,0,0,1,1,"Paysanne",position,player,1,1)
        this.wood=0
        this.stone=0
        this.maxStone=5
        this.maxWood=7
    }
}

class building extends unit{
    constructor(hp,attack,defense,initiative,name,position,player,vision, range){
        super(hp,attack,defense,initiative,0,name,position,player,vision,range)
        this.type="building"
    }
}

class hdv extends building{
    constructor(position,player){
        super(350,0,15,0,"Hôtel de ville",position,player,0,0)
    }
}

class maison extends building{
    constructor(position,player){
        super(30,0,0,0,"Maison",position,player,0,0)
    }

    generateVillager(position,player,game){
        let villageois = ["mineur","bucheron","paysanne"]
        let villageoisChois = villageois[Math.floor(Math.random()*villageois.length)]
        var cases = casesAdjacentes(position,game.map.width,game.map.height)
        for (var z of cases){
            if (game.board[z]==undefined){
            let uni = new (eval(villageoisChois))(z,player)
            game.addUnit(uni,z,player)
            return true
            }
        }
        return false
    }
}

class tour extends building{
    constructor(position,player){
        super(50,0,10,0,"Tour",position,player,4,0)
    }
}

class forge extends building{
    constructor(position,player){
        super(30,0,5,0,"Forge",position,player,0,0)
    }
}
class champ extends building{
    constructor(position,player){
        super(20,0,5,0,"Champ",position,player,0,0)
    }
}

class creatureNeutre{
    constructor(hp,attack,defense,initiative,movement,name,position,vision, range){
        this.hp=hp
        this.maxhp = this.hp
       this.couleur="blanc"
       this.attack=attack
       this.defense=defense
       this.range=range
       this.initiative=initiative
       this.movement=movement
       this.movementLeft = this.movement    
       this.name=name
        this.position=position
        this.owner="Système"
        this.vision=vision
        this.destination = undefined
        this.path = undefined
        this.type="unit"    }

        canGo(dest){//Prend un terrain et renvoie true ou false selon si l'unité peut s'y rendre. Par défaut, l'eau est interdite mais pour les bâteaux ce sera l'inverse
            if (dest=="X" || dest=="eau"){return false}
            return true
        }
    
        canEvolve(){
            return false
        }
}

class loup extends creatureNeutre{
    constructor(position){
        super(30,20,4,4,1,"Loup",position,2,1)
    }


    findGoal(partie){
        var tablo = []
        for (var z of casesAdjacentes(this.position,partie.map.width,partie.map.height)){
            for (var zz of casesAdjacentes(z,partie.map.width,partie.map.height)){
                if (partie.board[zz]!=undefined && partie.board[zz].owner!=this.owner && partie.board[zz].defense<this.attack){return zz}
                tablo.push(zz)
            }
        }
        return tablo[Math.floor(Math.random()*tablo.length)]
    }
}





module.exports = { hoplite,stratege,archer,messager,paysanne,building,hdv,bucheron,mineur,maison,forge,tour,champ,loup };

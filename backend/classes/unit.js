const { casesAdjacentes, distance } = require("../modules/backendHex")

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
        this.tracked=false
    }

    canGo(dest){//Prend un terrain et renvoie true ou false selon si l'unité peut s'y rendre. Par défaut, l'eau est interdite mais pour les bâteaux ce sera l'inverse
        if (dest=="X" || dest=="eau"){return false}
        return true
    }

    canEvolve(){
        return false
    }
    findGoal(partie){
        return this.destination
    }
    
    canRécolte(partie){return false}


    steal(uni){
        if (uni.gold!=undefined){if (this.gold==undefined){this.gold=uni.gold;} else {this.gold+=uni.gold};uni.gold=0}
        if (uni.wood!=undefined){if (this.wood==undefined){this.wood=uni.wood;} else {this.wood+=uni.wood};uni.wood=0}
        if (uni.stone!=undefined){if (this.stone==undefined){this.stone=uni.stone;} else {this.stone+=uni.stone};uni.stone=0}
        if (uni.copper!=undefined){if (this.copper==undefined){this.copper=uni.copper;} else {this.copper+=uni.copper};uni.copper=0}
    }
}


class hoplite extends unit{
    constructor(position,player){
        super(50,15,5,5,2,"Hoplite",position,player,2,1)
        this.tracked=true

    }
}

class stratege extends unit{
    constructor(position,player){
        super(100,10,5,0,2,"Stratege",position,player,3,1)
        this.tracked=true

    }
}

class archer extends unit{
    constructor(position,player){
        super(30,10,0,1,1,"Archer",position,player,2,2)
        this.tracked=true


    }
}

class messager extends unit{
    constructor(position,player){
        super(30,0,5,7,3,"Messager",position,player,2,1)
        this.tracked=true

    }
}

class builder extends unit{
    constructor(position,player){
        super(30,10,5,10,3,"Builder",position,player,2,1)
        this.tracked=false

    }
}

class bucheron extends unit{
    constructor(position,player){
        super(25,10,5,2,1,"Bûcheron",position,player,1,1)
        this.wood=0
        this.maxWood=10
        this.knownForests = []
        this.base = player.hdv[0]//endroit où déposer les ressources
    }
    updateBase(game){
        for (var z of (game.players[this.owner].hdv)){
            if (distance(this.position,z,game.map.height)<distance(this.position,this.base,game.map.height)){
        
        this.base=z}}
    }



    canEvolve(){
        return true
    }

    
    canGo(dest){
        if (dest=="X" || dest=="eau" || dest=="montagne"){return false}
        return true
    }

    evolution(player){
        return (new hoplite(this.position,player))
    }
    canRécolte(partie){
        return (this.wood<this.maxWood)
    }

    findGoal(partie){//Retourne la meilleure destination possible pour l'unité
        if (this.canRécolte(partie)==false){
            let meilleurebase = undefined
            for (var z of casesAdjacentes(this.base,partie.map.width,partie.map.height)){
                if (partie.board[z]==undefined && (meilleurebase==undefined || (distance(this.position,z,partie.map.height)<distance(this.position,meilleurebase,partie.map.height)))){meilleurebase=z}
            }
            if (meilleurebase!=undefined){return meilleurebase}
        }
        if (this.destination!=undefined ){return this.destination}

        if (partie.map.infos[this.position].type=="foret"){return this.position}//Si la case actuelle est une forêt c'est bon

        let c =  casesAdjacentes(this.position,partie.map.width,partie.map.height)
        for (var z of c){
            //On commence par chercher une forêt adjacente, cas le plus simple
            if (partie.map.infos[z].type=="foret" && partie.board[z]==undefined){return z}
        }

        while (this.knownForests.length>0){
            var z = this.knownForests.shift()
            if (partie.map.infos[z].type=="foret" && partie.board[z]==undefined){return z}
        }

        while (c.length>0){
            var z = c.splice(Math.floor(Math.random()*c.length),1)[0]
            if (partie.board[z]==undefined && this.canGo(partie.map.infos[z].type) && z!=this.position){return z}

        }
        return undefined
    }
}

class mineur extends unit{
    constructor(position,player){
        super(20,10,5,2,1,"Mineur",position,player,1,1)
        this.stone=0
        this.maxStone=8
        this.knownCarrieres = []
        this.base=player.hdv[0]
    }

    updateBase(game){
        for (var z of (game.players[this.owner].hdv)){
            if (distance(this.position,z,game.map.height)<distance(this.position,this.base,game.map.height)){
        
        this.base=z}}
    }

    canGo(dest){
        if (dest=="X" || dest=="eau" || dest=="montagne"){return false}
        return true
    }
    canEvolve(){
        return true
    }

    canRécolte(partie){
        return (this.sotne<this.maxStone)
    }

    evolution(player){
        return (new hoplite(this.position,player))
    }

    canRécolte(partie){return (this.stone<this.maxStone)}

    
    findGoal(partie){//Retourne la meilleure destination possible pour l'unité
        if (this.canRécolte(partie)==false){
            let meilleurebase = undefined
            for (var z of casesAdjacentes(this.base,partie.map.width,partie.map.height)){
                if (partie.board[z]==undefined && (meilleurebase==undefined || (distance(this.position,z,partie.map.height)<distance(this.position,meilleurebase,partie.map.height)))){meilleurebase=z}
            }
            if (meilleurebase!=undefined){return meilleurebase}
        }
        
        if (this.destination!=undefined ){return this.destination}
        if (partie.map.infos[this.position].type=="carriere"){return this.position}//Si la case actuelle est une forêt c'est bon

        let c =  casesAdjacentes(this.position,partie.map.width,partie.map.height)
        for (var z of c){
            //On commence par chercher une forêt adjacente, cas le plus simple
            if (partie.map.infos[z].type=="carriere" && partie.board[z]==undefined){return z}
        }

        while (this.knownCarrieres.length>0){
            var z = this.knownCarrieres.shift()
            if (partie.map.infos[z].type=="carriere" && partie.board[z]==undefined){return z}
        }

        while (c.length>0){
            var z = c.splice(Math.floor(Math.random()*c.length),1)[0]
            if (partie.board[z]==undefined && this.canGo(partie.map.infos[z].type) && z!=this.position){return z}

        }
        return undefined
    }
   

}

class paysanne extends unit{
    constructor(position,player){
        super(15,0,0,1,1,"Paysanne",position,player,1,1)
        this.wood=0
        this.stone=0
        this.maxRessources
        this.knownForests = []
        this.knownCarrieres = []
        this.base=player.hdv[0]
    }
    canRécolte(partie){
        return ((this.stone+this.wood)<this.maxRessources)
    }

    updateBase(game){
        for (var z of (game.players[this.owner].hdv)){
            if (distance(this.position,z,game.map.height)<distance(this.position,this.base,game.map.height)){
        
        this.base=z}}
    }

    canGo(dest){
        if (dest=="X" || dest=="eau" || dest=="montagne"){return false}
        return true
    }

    findGoalWood(partie){//Retourne la meilleure destination possible pour l'unité
        if (this.canRécolte(partie)==false){
            let meilleurebase = undefined
            for (var z of casesAdjacentes(this.base,partie.map.width,partie.map.height)){
                if (partie.board[z]==undefined && (meilleurebase==undefined || (distance(this.position,z,partie.map.height)<distance(this.position,meilleurebase,partie.map.height)))){meilleurebase=z}
            }
            if (meilleurebase!=undefined){return meilleurebase}
        }

        if (this.destination!=undefined ){return this.destination}
        if (partie.map.infos[this.position].type=="foret"){return this.position}//Si la case actuelle est une forêt c'est bon

        let c =  casesAdjacentes(this.position,partie.map.width,partie.map.height)
        for (var z of c){
            //On commence par chercher une forêt adjacente, cas le plus simple
            if (partie.map.infos[z].type=="foret" && partie.board[z]==undefined){return z}
        }

        while (this.knownForests.length>0){
            var z = this.knownForests.shift()
            if (partie.map.infos[z].type=="foret" && partie.board[z]==undefined){return z}
        }

        while (c.length>0){
            var z = c.splice(Math.floor(Math.random()*c.length),1)[0]
            if (partie.board[z]==undefined && this.canGo(partie.map.infos[z].type) && z!=this.position){return z}

        }
        return undefined
    }

    
    findGoalStone(partie){//Retourne la meilleure destination possible pour l'unité
        if (this.canRécolte(partie)==false){
            let meilleurebase = undefined
            for (var z of casesAdjacentes(this.base,partie.map.width,partie.map.height)){
                if (partie.board[z]==undefined && (meilleurebase==undefined || (distance(this.position,z,partie.map.height)<distance(this.position,meilleurebase,partie.map.height)))){meilleurebase=z}
            }
            if (meilleurebase!=undefined){return meilleurebase}
        }

        if (this.destination!=undefined ){return this.destination}
        if (partie.map.infos[this.position].type=="carriere"){return this.position}//Si la case actuelle est une forêt c'est bon

        let c =  casesAdjacentes(this.position,partie.map.width,partie.map.height)
        for (var z of c){
            //On commence par chercher une forêt adjacente, cas le plus simple
            if (partie.map.infos[z].type=="carriere" && partie.board[z]==undefined){return z}
        }

        while (this.knownCarrieres.length>0){
            var z = this.knownCarrieres.shift()
            if (partie.map.infos[z].type=="carriere" && partie.board[z]==undefined){return z}
        }

        while (c.length>0){
            var z = c.splice(Math.floor(Math.random()*c.length),1)[0]
            if (partie.board[z]==undefined && this.canGo(partie.map.infos[z].type) && z!=this.position){return z}

        }
        return undefined
    }

    findGoal(partie){
        
        //IL FAUT REFAIRE LE RESTE
        if (this.destination!=undefined){return this.destination}
        
        if (this.wood<this.stone){
            return this.findGoalWood(partie)
        }
        else{
            return this.findGoalStone(partie)
        }
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
        super(350,0,15,0,"Hôtel de ville",position,player,2,0)
        this.tracked=true
        this.wood = 0
        this.stone = 0
        this.copper = 0
        this.maxWood = 100
        this.maxStone = 100
        this.maxCopper = 100
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
            if (game.board[z]==undefined && game.map.infos[z].type!="eau"  && game.map.infos[z].type!="montagne"){
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

class entrepôt extends building{
    constructor(position,player){
        super(50,0,5,0,"Entrepôt",position,player,0,0)
        
        this.wood = 0
        this.stone = 0
        this.copper = 0
        this.maxWood = 40
        this.maxStone = 40
        this.maxCopper = 30 
    }
}

class chantier extends building{
    constructor(position,player,buildingInfos){
        super(40,0,3,0,"Chantier",position,player,0,0)
        this.turnsToBuild = buildingInfos.turnsToBuild
        this.building = buildingInfos.name
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

        steal(uni){
            if (uni.gold!=undefined){if (this.gold==undefined){this.gold=uni.gold;} else {this.gold+=uni.gold};uni.gold=0}
            if (uni.wood!=undefined){if (this.wood==undefined){this.wood=uni.wood;} else {this.wood+=uni.wood};uni.wood=0}
            if (uni.stone!=undefined){if (this.stone==undefined){this.stone=uni.stone;} else {this.stone+=uni.stone};uni.stone=0}
            if (uni.copper!=undefined){if (this.copper==undefined){this.copper=uni.copper;} else {this.copper+=uni.copper};uni.copper=0}
        }

        canGo(dest){//Prend un terrain et renvoie true ou false selon si l'unité peut s'y rendre. Par défaut, l'eau est interdite mais pour les bâteaux ce sera l'inverse
            if (dest=="X" || dest=="eau" ||dest=="montagne"){return false}
            return true
        }
    
        canEvolve(){
            return false
        }
}

class loup extends creatureNeutre{
    constructor(position){
        super(20,15,4,10,1,"Loup",position,2,1)
    }

    findGoal(partie){
        var tablo = []
        for (var z of casesAdjacentes(this.position,partie.map.width,partie.map.height)){
            for (var zz of casesAdjacentes(z,partie.map.width,partie.map.height)){
                if (partie.board[zz]!=undefined && partie.board[zz].owner!=this.owner && partie.board[zz].defense<this.attack && partie.board[zz].type!="building"){return zz}
                tablo.push(zz)
            }
        }
        return tablo[Math.floor(Math.random()*tablo.length)]
    }
}



class pierris extends creatureNeutre{
    constructor(position){
        super(150,20,15,0,1,"Pierris Pompidoris",position,2,1)
        this.gold=100
        this.stone=100
        this.wood=100
        this.copper=100
    }

    findGoal(partie){
        var tablo = []
        for (var z of casesAdjacentes(this.position,partie.map.width,partie.map.height)){
            for (var zz of casesAdjacentes(z,partie.map.width,partie.map.height)){
                if (partie.board[zz]!=undefined && partie.board[zz].name!="Stratege"){return zz}
                tablo.push(zz)
            }
        }
        return tablo[Math.floor(Math.random()*tablo.length)]
    }




}



module.exports = { hoplite,stratege,archer,messager,paysanne,building,hdv,bucheron,mineur,maison,forge,tour,champ,loup,pierris,entrepôt,chantier,builder };

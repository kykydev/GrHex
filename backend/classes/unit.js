const { casesAdjacentes, distance } = require("../modules/backendHex")
const fs = require('fs');
const path = require('path');
const stats = JSON.parse(fs.readFileSync(path.join(__dirname,"../gameDatas/unitsStats.json")))
 


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
        this.fieldRevenu=0 //Attribut qui donne le nombre de pièces générées dans un champ
        this.strategy = "prudence"

        //Chargement des statistiques custom

        if (stats[this.name]!=undefined){
            this.maxhp = stats[this.name].maxhp
            this.attack = stats[this.name].attack
            this.defense = stats[this.name].defense
            this.initiative = stats[this.name].initiative
            this.movement = stats[this.name].movement
            this.range = stats[this.name].range
            this.vision = stats[this.name].vision
            this.fieldRevenu=stats[this.name].fieldRevenu
            this.maxworkers=stats[this.name].maxworkers
            this.turnsToRespawn = stats[this.name].turnsToRespawn
            
            this.hp = this.maxhp
            this.movementLeft=this.movement
        }

        
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
    
    canDépose(){return false}
    canRécolte(partie){return false}
    updateBase(partie){return}

    steal(uni){
        if (uni.gold!=undefined){if (this.gold==undefined){this.gold=uni.gold;} else {this.gold+=uni.gold};uni.gold=0}
        if (uni.wood!=undefined){if (this.wood==undefined){this.wood=uni.wood;} else {this.wood+=uni.wood};uni.wood=0}
        if (uni.stone!=undefined){if (this.stone==undefined){this.stone=uni.stone;} else {this.stone+=uni.stone};uni.stone=0}
        if (uni.copper!=undefined){if (this.copper==undefined){this.copper=uni.copper;} else {this.copper+=uni.copper};uni.copper=0}
        if (uni.tin!=undefined){if (this.tin==undefined){this.tin=uni.tin;} else {this.tin+=uni.tin};uni.tin=0}
    }
    getForgeEvos(){
        return false
    }
}


class hoplite extends unit{
    constructor(position,player){
        super(50,25,5,5,2,"Hoplite",position,player,2,1)
        this.tracked=true
        this.origin = false//Attribut qui stocke ce qu'était l'unité avant pour le désenrôlement
        this.strategy = "agression"

    }
    getForgeEvos(){
        return this.origin
    }
}

class stratege extends unit{
    constructor(position,player){
        super(100,10,5,0,3,"Stratege",position,player,4,1)
        this.tracked=true

    }
}

class archer extends unit{
    constructor(position,player){
        super(30,20,0,1,2,"Archer",position,player,2,2)
        this.tracked=true
        this.origin = false//Attribut qui stocke ce qu'était l'unité avant pour le désenrôlement
        this.strategy = "agression"

    }

    findGoal(partie){
        if (this.destination!=undefined){return this.destination}
        if (this.objectif!=undefined){
            if (partie.board[this.objectif]==undefined ||( partie.board[this.objectif].name!="Tour" &&  partie.board[this.objectif].name!="Tour d'archer" ) || (partie.board[this.objectif].name=="Tour d'archer" && partie.board[this.objectif].workers.length>=partie.board[this.objectif].maxworkers)){this.objectif=undefined}
            else{
                let meilleureCase = undefined
                for (var z of casesAdjacentes(this.objectif,partie.map.width,partie.map.height)){
                    if (partie.board[z]==undefined && (partie.pathfindToDestination(this.position,z,this.owner)!=false) && this.canGo(partie.map.terrain[z]) && (meilleureCase==undefined || (distance(this.position,z,partie.map.height)<distance(this.position,meilleureCase,partie.map.height)))){
                        meilleureCase=z
                        }
                }
                if (meilleureCase!=undefined){return meilleureCase}
            }
        }
    }

    getForgeEvos(){
        return this.origin
    }
}


class discipleath extends unit{
    constructor(position,player){
    super(40,2,10,0,1,"Disciple d'Athéna",position,player,2,1)
    this.tracked=true
    this.origin = false//Attribut qui stocke ce qu'était l'unité avant pour le désenrôlement
    this.strategy = "agression"

}
}


class messager extends unit{
    constructor(position,player){
        super(30,0,5,7,3,"Messager",position,player,2,1)
        this.targetUni = undefined
        this.destMessage=undefined
    }
    canGo(dest){
        if (dest=="X" || dest=="eau" ){return false}
        return true
    }

    
    
    findGoal(partie){//Retourne la meilleure destination possible pour l'unité
        if (this.targetUni==undefined){
            return undefined
        }
        
        var meilleurePos;
        
        for (var z of casesAdjacentes(this.targetUni.position,partie.map.width,partie.map.height)){
            if (this.canGo(partie.map.terrain[z]) && (partie.pathfindToDestination(this.position,z,this.owner)!=false) && partie.board[z]==undefined){
                if (meilleurePos==undefined || (distance(z,this.position,partie.map.height)<distance(meilleurePos,this.position,partie.map.height))){
                    meilleurePos=z
                }
            }
        }
        return meilleurePos
    }
   
    

}

class builder extends unit{
    constructor(position,player){
        super(30,0,2,10,4,"Ouvrier",position,player,2,1)
        this.tracked=false
        this.currentBuilding = undefined//currentBuilding est la position du building actuellement attribué
        this.phase = undefined //Phase qui dit si le builder va chercher les ressources ou s'il va construire.
        this.wood=0
        this.stone=0
        this.copper=0
        this.tin=0
        this.base = player.hdv[0]//endroit où récupérer les ressources
  
    }

    updateBase(game){
        if (this.base==undefined){this.base=game.players[this.owner].hdv[0]}

        if (this.phase=="getRessources"){
        var travail = game.board[this.currentBuilding]
        if (travail==undefined ||travail.name!="Chantier"){return this.position}
        var zzpossible = false //Test de possibilité initiale
        if ((travail.buildingInfos.coûtBois-this.wood<=game.board[this.base].wood || travail.buildingInfos.coûtBois==undefined) && (travail.buildingInfos.coûtPierre-this.stone<=game.board[this.base].stone || travail.buildingInfos.coûtPierre==undefined) && (travail.buildingInfos.coûtCuivre-this.copper<=game.board[this.base].copper || travail.buildingInfos.coûtCuivre==undefined)&& (travail.buildingInfos.coûtEtain-this.tin<=game.board[this.base].tin || travail.buildingInfos.coûtEtain==undefined)){zzpossible=true}
        for (var z of (game.players[this.owner].hdv)){
            var zPossible = false/*Dit si le bâtiment en position z permet de construire */
            if ((travail.buildingInfos.coûtBois-this.wood<=game.board[z].wood || travail.buildingInfos.coûtBois==undefined) && (travail.buildingInfos.coûtPierre-this.stone<=game.board[z].stone || travail.buildingInfos.coûtPierre==undefined) && (travail.buildingInfos.coûtCuivre-this.copper<=game.board[z].copper || travail.buildingInfos.coûtCuivre==undefined)&&(travail.buildingInfos.coûtEtain-this.tin<=game.board[z].tin || travail.buildingInfos.coûtEtain==undefined)){zPossible=true}

            if ((distance(this.position,z,game.map.height)<distance(this.position,this.base,game.map.height) || zzpossible==false) && (zPossible)){
                 this.base=z
                 zzpossible=true//On a passé l'étape initiale
                }}

            }  
            
        else{

            for (var z of (game.players[this.owner].hdv)){
                if (distance(this.position,z,game.map.height)<distance(this.position,this.base,game.map.height)){
            
            this.base=z}}

        }


        }

    canGo(dest){
        if (dest=="X" || dest=="eau" || dest=="montagne"){return false}
        return true
    }


    
    findGoal(partie){//Retourne la meilleure destination possible pour l'unité
        
        if (this.destination!=undefined){return this.destination}

        if (this.currentBuilding==undefined){return undefined}
        var travail = partie.board[this.currentBuilding];
        if (travail==undefined || travail.name!="Chantier"){this.currentBuilding=undefined;this.phase="getRessources";return undefined}


        //Test pour voir si l'unité peut actuellement faire son build
        if (this.wood<travail.buildingInfos.coûtBois || this.stone<travail.buildingInfos.coûtPierre || this.copper<travail.buildingInfos.coûtCuivre || this.tin<travail.buildingInfos.coûtEtain){
            this.phase = "getRessources"}
        else{ this.phase="buildBuilding"}
        if (this.phase=="buildBuilding" && casesAdjacentes(this.position,partie.map.width,partie.map.height).includes(this.currentBuilding)){return this.position}

            if (this.phase=="getRessources"){
                let meilleurebase = undefined
                if (casesAdjacentes(this.base,partie.map.width,partie.map.height).includes(this.position)){return this.position}
                for (var z of casesAdjacentes(this.base,partie.map.width,partie.map.height)){
                    if (partie.board[z]==undefined&& (partie.pathfindToDestination(this.position,z,this.owner)!=false)&& this.canGo(partie.map.terrain[z]) && (meilleurebase==undefined || (distance(this.position,z,partie.map.height)<distance(this.position,meilleurebase,partie.map.height)))){meilleurebase=z}
                }


                return meilleurebase
            }

            else{
                if (this.phase=="buildBuilding"){

            let meilleureCase = undefined
            for (var z of casesAdjacentes(this.currentBuilding,partie.map.width,partie.map.height)){
                if (partie.board[z]==undefined&& (partie.pathfindToDestination(this.position,z,this.owner)!=false)&& this.canGo(partie.map.terrain[z]) && (meilleureCase==undefined || (distance(this.position,z,partie.map.height)<distance(this.position,meilleureCase,partie.map.height)))){meilleureCase=z}
            }
            return meilleureCase
           

        }
        else{
            for (var z of casesAdjacentes(this.base,partie.map.width,partie.map.height)){
                if (partie.board[z]==undefined&& (partie.pathfindToDestination(this.position,z,this.owner)!=false)&& this.canGo(partie.map.terrain[z])){return z}
            }
        }
            }
    }


}

class bucheron extends unit{
    constructor(position,player){
        super(25,10,5,7,3,"Bûcheron",position,player,1,1)
        this.wood=0
        this.maxWood=10
        this.copper=0
        this.tin=0
        this.knownForests = []
        this.base = player.hdv[0]//endroit où déposer les ressources
        this.fieldRevenu=2
    }
    canDépose(){return true}

  
 
    updateBase(game){
        if (this.base!=undefined){return this.base}
        this.base =  game.players[this.owner].hdv[0]
        for (var z of (game.players[this.owner].hdv)){
            if (distance(this.position,z,game.map.height)<distance(this.position,this.base,game.map.height)){
                this.base=z}
        }
    }

    getForgeEvos(){
        return [{"nom":"Hoplite","gold":10,"wood":5, "stone":5},{"nom":"Archer","gold":25,"wood":5, "stone":5}]
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


        //Test entrée champ
        if (this.objectif!=undefined){
            if (partie.board[this.objectif]==undefined || partie.board[this.objectif].name!="Champ" || partie.board[this.objectif].workers.length>=partie.board[this.objectif].maxworkers){console.log("ono");this.objectif=undefined}
            else{
                let meilleureCase = undefined
                for (var z of casesAdjacentes(this.objectif,partie.map.width,partie.map.height)){
                    if (partie.board[z]==undefined && (partie.pathfindToDestination(this.position,z,this.owner)!=false) && this.canGo(partie.map.terrain[z]) && (meilleureCase==undefined || (distance(this.position,z,partie.map.height)<distance(this.position,meilleureCase,partie.map.height)))){
                        meilleureCase=z
                        }
                }
                if (meilleureCase!=undefined){return meilleureCase}
            }
        }



        if (this.canRécolte(partie)==false){

            let meilleurebase = undefined
            for (var z of casesAdjacentes(this.base,partie.map.width,partie.map.height)){
                if (partie.board[z]==undefined && (partie.pathfindToDestination(this.position,z,this.owner)!=false) && this.canGo(partie.map.terrain[z]) 
                && (meilleurebase==undefined 
                    || (distance(this.position,z,partie.map.height)<distance(this.position,meilleurebase,partie.map.height)))){
                        meilleurebase=z
                    }
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
        super(25,20,5,10,3,"Mineur",position,player,1,1)
        this.stone=0
        this.maxStone=12
        this.copper=0;
        this.tin=0;
        this.knownCarrieres = []
        this.base=player.hdv[0]
       
        this.fieldRevenu=2
    }

    canDépose(){return true}

    getForgeEvos(){
        return [{"nom":"Hoplite","gold":10,"wood":5, "stone":5},{"nom":"Archer","gold":25,"wood":5, "stone":5}]
    }
    canEvolve(){
        return true
    }

    updateBase(game){
        if (this.base!=undefined){return this.base}
        this.base =  game.players[this.owner].hdv[0]
        for (var z of (game.players[this.owner].hdv)){
            if (distance(this.position,z,game.map.height)<distance(this.position,this.base,game.map.height)){
                this.base=z}
        }
    }

    canGo(dest){
        if (dest=="X" || dest=="eau" || dest=="montagne"){return false}
        return true
    }


    canRécolte(partie){
        return (this.stone<this.maxStone)
    }

    evolution(player){
        return (new hoplite(this.position,player))
    }

    canRécolte(partie){return (this.stone<this.maxStone)}

    
    findGoal(partie){//Retourne la meilleure destination possible pour l'unité

        //Test entrée mine
        if (this.objectif!=undefined){
            if (partie.board[this.objectif]==undefined ||(  partie.board[this.objectif].name!="Champ"&&partie.board[this.objectif].name!="Mine") || partie.board[this.objectif].workers.length>=partie.board[this.objectif].maxworkers){console.log("ono");this.objectif=undefined}
            else{
                let meilleureCase = undefined
                for (var z of casesAdjacentes(this.objectif,partie.map.width,partie.map.height)){
                    if (partie.board[z]==undefined && (partie.pathfindToDestination(this.position,z,this.owner)!=false) && this.canGo(partie.map.terrain[z]) && (meilleureCase==undefined || (distance(this.position,z,partie.map.height)<distance(this.position,meilleureCase,partie.map.height)))){
                        meilleureCase=z
                        }
                }
                if (meilleureCase!=undefined){return meilleureCase}
            }
        }




        if (this.canRécolte(partie)==false){
            let meilleurebase = undefined
            for (var z of casesAdjacentes(this.base,partie.map.width,partie.map.height)){
                if (partie.board[z]==undefined && (partie.pathfindToDestination(this.position,z,this.owner)!=false) && this.canGo(partie.map.terrain[z])&& (meilleurebase==undefined || (distance(this.position,z,partie.map.height)<distance(this.position,meilleurebase,partie.map.height)))){meilleurebase=z}
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
        super(15,15,0,5,3,"Paysanne",position,player,1,1)
        this.wood=0
        this.stone=0
        this.maxRessources = 7
        this.knownForests = []
        this.knownCarrieres = []
        this.base=player.hdv[0]
        this.fieldRevenu=1
        this.élue = false
        this.forgeEvos=false

        if (Math.random()<0.05){
            this.élue=true
            this.forgeEvos=[{"nom":"Disciple d'Athéna","gold":50}]
        }

    }
    canEvolve(){return this.élue}
    getForgeEvos(){
        return this.forgeEvos
    }
    canDépose(){
        return true
    }

    canRécolte(partie){
        return ((this.stone+this.wood)<this.maxRessources)
    }

  
    
    updateBase(game){
        if (this.base!=undefined){return this.base}
        this.base =  game.players[this.owner].hdv[0]
        for (var z of (game.players[this.owner].hdv)){
            if (distance(this.position,z,game.map.height)<distance(this.position,this.base,game.map.height)){
                this.base=z}
        }
    }

    canGo(dest){
        if (dest=="X" || dest=="eau" || dest=="montagne"){return false}
        return true
    }

    findGoalWood(partie){//Retourne la meilleure destination possible pour l'unité

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

        return undefined
    }

    
    findGoalStone(partie){//Retourne la meilleure destination possible pour l'unité
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

        return undefined
    }

    findGoal(partie){
        
        //Test entrée mine et champ
        if (this.objectif!=undefined){
            if (partie.board[this.objectif]==undefined || (partie.board[this.objectif].name!="Champ"&&partie.board[this.objectif].name!="Mine") || partie.board[this.objectif].workers.length>=partie.board[this.objectif].maxworkers){console.log("ono");this.objectif=undefined}
            else{
                let meilleureCase = undefined
                for (var z of casesAdjacentes(this.objectif,partie.map.width,partie.map.height)){
                    if (partie.board[z]==undefined && (partie.pathfindToDestination(this.position,z,this.owner)!=false) && this.canGo(partie.map.terrain[z]) && (meilleureCase==undefined || (distance(this.position,z,partie.map.height)<distance(this.position,meilleureCase,partie.map.height)))){
                        meilleureCase=z
                        }
                }
                if (meilleureCase!=undefined){return meilleureCase}
            }
        }




        if (this.canRécolte(partie)==false){
            let meilleurebase = undefined
            for (var z of casesAdjacentes(this.base,partie.map.width,partie.map.height)){
                if (partie.board[z]==undefined && (meilleurebase==undefined || (distance(this.position,z,partie.map.height)<distance(this.position,meilleurebase,partie.map.height)))){meilleurebase=z}
            }
            if (meilleurebase!=undefined){return meilleurebase}
        }

        
        var objectifWood = this.findGoalWood(partie)
        var objectifStone = this.findGoalStone(partie)
        
        let c =  casesAdjacentes(this.position,partie.map.width,partie.map.height)
        if (objectifStone==undefined && objectifWood==undefined){
            while (c.length>0){
                var z = c.splice(Math.floor(Math.random()*c.length),1)[0]
                if (partie.board[z]==undefined && this.canGo(partie.map.infos[z].type) && z!=this.position){return z}
            }
        }
        
        if (objectifWood==undefined){return objectifStone}
        else{
            if (objectifStone==undefined){return objectifWood}
            else{
                if (distance(this.position,objectifWood,partie.map.height)<distance(this.position,objectifStone,map.height)){
                    return objectifWood
                }
                else{
                    return objectifStone
                }
            }
        } 

    }
}


class pecheur extends unit{
    constructor(position,player){
        super(20,8,3,1,1,"Pêcheur",position,player,1,1)
        this.tracked=false
        this.fish=0
        this.maxFish=5
        this.fishValue=0
        this.knownWater = []
    }



    canDépose(){return true}

    getForgeEvos(){
        return [{"nom":"Archer","gold":25}]
    }

    updateBase(game){
        if (this.base!=undefined){return this.base}
        this.base =  game.players[this.owner].hdv[0]
        for (var z of (game.players[this.owner].hdv)){
            if (distance(this.position,z,game.map.height)<distance(this.position,this.base,game.map.height)){
                this.base=z}
        }
    }
    canGo(dest){
        if (dest=="X" || dest=="eau" || dest=="montagne"){return false}
        return true
    }
    canEvolve(){
        return true
    }

    canRécolte(partie){
        return (this.fish<this.maxFish)
    }

    evolution(player){
        return (new hoplite(this.position,player))
    }


    
    findGoal(partie){//Retourne la meilleure destination possible pour l'unité

        if (this.canRécolte(partie)==false){
            let meilleurebase = undefined
            for (var z of casesAdjacentes(this.base,partie.map.width,partie.map.height)){
                if (partie.board[z]==undefined && (partie.pathfindToDestination(this.position,z,this.owner)!=false) && this.canGo(partie.map.terrain[z])&& (meilleurebase==undefined || (distance(this.position,z,partie.map.height)<distance(this.position,meilleurebase,partie.map.height)))){meilleurebase=z}
            }
            if (meilleurebase!=undefined){return meilleurebase}
        }
        
        if (this.destination!=undefined ){return this.destination}
        if (partie.map.infos[this.position].type=="carriere"){return this.position}//Si la case actuelle est une forêt c'est bon

        let c =  casesAdjacentes(this.position,partie.map.width,partie.map.height)
        for (var z of c){
            //On commence par chercher une forêt adjacente, cas le plus simple
            if (partie.map.infos[z].type=="eau" && partie.board[z]==undefined){return this.position}
        }

        while (this.knownWater.length>0){
            var z = this.knownWater.shift()
            for (var z of casesAdjacentes(z,partie.map.width,partie.map.height)){
                if (partie.pathfindToDestination(this.position,z,this.owner)!=false){return z}
            }
        }

        while (c.length>0){
            var z = c.splice(Math.floor(Math.random()*c.length),1)[0]
            if (partie.board[z]==undefined && this.canGo(partie.map.infos[z].type) && z!=this.position){return z}

        }
        return undefined
    }
   





}

class chevaldetroie extends unit{
    constructor(position,player){
        super(70,20,10,1,2,"Cheval de Troie",position,player,1,1)
        this.tracked=true
        this.strategy="agression"

    }

    canGo(dest){
        if (dest=="X" || dest=="eau" || dest=="montagne"){return false}
        return true
    }
}


class caravaneCommerce extends unit{
    constructor(position,player){
        super(30,0,2,0,3,"Caravane de commerce",position,player,1,0)
        this.tracked=false
        this.pacifist=true
    }

    
    canGo(dest){//Prend un terrain et renvoie true ou false selon si l'unité peut s'y rendre. Par défaut, l'eau est interdite mais pour les bâteaux ce sera l'inverse
        if (dest=="X" || dest=="eau"){return false}
        return true
    }


    findGoal(partie){
        
        if (this.phase==undefined ||this.objectif==undefined ){return this.position}

        let c =  casesAdjacentes(this.objectif,partie.map.width,partie.map.height)
        for (var z of c){
            if (this.canGo(partie.map.infos[z].type)&&partie.board[z]==undefined && partie.pathfindToDestination(this.position,z,this.owner)!=false){
                return z 
            }
        }
            return this.position




    }





}
class bateauCommerce extends unit{
    constructor(position,player){
        super(100,0,10,0,5,"Navire de commerce",position,player,1,1)
        this.tracked=false
        this.pacifist=true

    }

    
    canGo(dest){//Prend un terrain et renvoie true ou false selon si l'unité peut s'y rendre. Par défaut, l'eau est interdite mais pour les bâteaux ce sera l'inverse
        if (dest!="eau"){return false}
        return true
    }

    findGoal(partie){
        
        if (this.phase==undefined ||this.objectif==undefined ){return this.position}

        let c =  casesAdjacentes(this.objectif,partie.map.width,partie.map.height)
        for (var z of c){
            if (this.canGo(partie.map.infos[z].type)&&partie.board[z]==undefined && partie.pathfindToDestination(this.position,z,this.owner)!=false){
                return z 
            }
        }
            return this.position
    }

}







class building extends unit{
    constructor(hp,attack,defense,initiative,name,position,player,vision, range){
        super(hp,attack,defense,initiative,0,name,position,player,vision,range)
        this.type="building"
    }
}


class mur extends building{
    constructor(position,player){
        super(50,0,10,0,"Mur",position,player,1,0)
        this.tracked = false
    }
}

class hdv extends building{
    constructor(position,player){
        super(350,0,15,0,"Hôtel de ville",position,player,2,0)
        this.tracked=true
        this.wood = 30
        this.stone = 30
        this.copper = 0
        this.tin = 0
        this.maxWood = 80
        this.maxStone = 80
        this.maxCopper = 60
        this.maxTin = 60
    }
}

class maison extends building{
    constructor(position,player){
        super(30,0,0,0,"Maison",position,player,0,0)
        if (this.turnsToRespawn==undefined){this.turnsToRespawn=3}
        this.cooldown = this.turnsToRespawn
    }

    generateVillager(position,player,game){
        let villageois = ["mineur","bucheron","paysanne"]
        let villageoisChois = villageois[Math.floor(Math.random()*villageois.length)]
        var cases = casesAdjacentes(position,game.map.width,game.map.height)
        for (var z of cases){
            if (game.board[z]==undefined && game.map.infos[z].type!="eau"  && game.map.infos[z].type!="montagne"){
            let uni = new (eval(villageoisChois))(z,player)
            this.habitant=uni
            game.addUnit(uni,z,player)
            this.cooldown = this.turnsToRespawn
            return true
            }
        }
        return false
    }
}
class cabane extends building{
    constructor(position,player){
        super(20,0,0,0,"Cabane",position,player,0,0)
    }

    generatePecheur(position,player,game){
        var cases = casesAdjacentes(position,game.map.width,game.map.height)
        for (var z of cases){
            if (game.board[z]==undefined && game.map.infos[z].type!="eau"  && game.map.infos[z].type!="montagne"){
            let uni = new pecheur(z,player)
            game.addUnit(uni,z,player)
            return true
            }
        }
        return false
    }
}

class tour extends building{
    constructor(position,player){
        super(50,0,10,0,"Tour",position,player,5,0)
    }
}
class tourarcher extends building{
    constructor(position,player){
        super(50,0,10,0,"Tour d'archer",position,player,5,0)
        this.workers = []
        this.strategy="agression"
    }

    addWorker(pos,partie){//Ajoute une unité pour travailler dans ce champ
        if (this.workers.length>=this.maxworkers){return false}
        var uni = partie.board[pos]
        if (uni==undefined || ((uni.name!="Archer") && uni.name!="Frondeur")){return false}
        this.workers.push(uni)
        delete partie.players[uni.owner].units[pos]
        delete partie.board[pos]
        return true
    }


    getUnis(){
        var ret = []
        for (var z of this.workers){ret.push(z.name)}
        return {"couleur":this.couleur,"unites":ret}
        
    }


}

class forge extends building{
    constructor(position,player){
        super(30,0,5,0,"Forge",position,player,0,0)
    }
}



class mine extends building{
    constructor(position,player){
        super(35,0,5,0,"Mine",position,player,0,0)
        this.workers = []
        this.mineral = undefined
        this.maxworkers=2
    }

    addWorker(pos,partie){//Ajoute une unité pour travailler dans ce champ
        if (this.workers.length==this.maxworkers){return false}
        var uni = partie.board[pos]
        if (uni==undefined || ((uni.name!="Mineur") && uni.name!="Paysanne")){return false}
        this.workers.push(uni)
        delete partie.players[uni.owner].units[pos]
        delete partie.board[pos]
        return true
    }






}
class champ extends building{
    constructor(position,player){
        super(20,0,5,0,"Champ",position,player,0,0)
        this.workers=[]
        this.maxworkers=2
    }
    addWorker(pos,partie){//Ajoute une unité pour travailler dans ce champ
        if (this.workers.length>=this.maxworkers){return false}
        var uni = partie.board[pos]
        if (uni==undefined || (uni.name!="Bûcheron" && uni.name!="Paysanne" && uni.name!="Mineur" )){return false}
        this.workers.push(uni)
        delete partie.players[uni.owner].units[pos]
        delete partie.board[pos]
        return true
    }

    getUnis(){
        if (this.workers==undefined || this.workers.length==0){return false}
        var retour = []
        for (var z of this.workers){
            retour.push(z.name)
        }
        return retour
    }

}

class entrepôt extends building{
    constructor(position,player){
        super(50,0,5,0,"Entrepôt",position,player,0,0)
        
        this.wood = 0
        this.stone = 0
        this.copper = 0
        this.tin = 0
        this.maxWood = 40
        this.maxStone = 40
        this.maxCopper = 30 
        this.maxTin = 30 
    }
}

class chantier extends building{
    constructor(position,player,buildingInfos){
        super(40,0,3,0,"Chantier",position,player,0,0)
        this.turnsToBuild = buildingInfos.turnsToBuild
        this.buildingInfos = JSON.parse(JSON.stringify(buildingInfos));
    }

    canGo(dest){
        if (dest=="X"){return false}
        return true
    }


}


class port extends building{
    constructor(position,player,buildingInfos){
        super(60,0,3,0,"Port",position,player,0,0)
    }

    canGo(dest){//Prend un terrain et renvoie true ou false selon si l'unité peut s'y rendre. Par défaut, l'eau est interdite mais pour les bâteaux ce sera l'inverse
        if (dest!="eau"){return false}
        return true
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
        this.type="unit"    
    
    
        if (stats[this.name]!=undefined){
            this.maxhp = stats[this.name].maxhp
            this.attack = stats[this.name].attack
            this.defense = stats[this.name].defense
            this.initiative = stats[this.name].initiative
            this.movement = stats[this.name].movement
            this.range = stats[this.name].range
            this.vision = stats[this.name].vision
            this.fieldRevenu=stats[this.name].fieldRevenu
            this.maxworkers=stats[this.name].maxworkers
            
            this.hp = this.maxhp
            this.movementLeft=this.movement
        }
    
    
    
    
    
    
    }

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
            if (uni.tin!=undefined){if (this.tin==undefined){this.tin=uni.tin;} else {this.tin+=uni.tin};uni.tin=0}
        }

        canGo(dest){//Prend un terrain et renvoie true ou false selon si l'unité peut s'y rendre. Par défaut, l'eau est interdite mais pour les bâteaux ce sera l'inverse
            if (dest=="X" || dest=="eau" ||dest=="montagne"){return false}
            return true
        }
    
        canEvolve(){
            return false
        }

        findGoal(){return undefined}
}

class loup extends creatureNeutre{
    constructor(position){
        super(20,15,4,10,1,"Loup",position,2,1)
        this.strategy="agression"
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
        this.tin=100
        this.strategy = "agression"

    }

    findGoal(partie){
        var tablo = []
        for (var z of casesAdjacentes   (this.position,partie.map.width,partie.map.height)){
            for (var zz of casesAdjacentes(z,partie.map.width,partie.map.height)){
                if (partie.board[zz]!=undefined && partie.board[zz].name!="Stratege"){return zz}
                tablo.push(zz)
            }
        }
        return tablo[Math.floor(Math.random()*tablo.length)]
    }

}

class discipleathneutre extends creatureNeutre{
    constructor(position){
        super(100,15,30,0,1,"Disciple d'Athéna",position,2,1)
        this.gold=1
        this.strategy = "agression"
    }

}




module.exports = { hoplite,stratege,archer,messager,paysanne,building,hdv,bucheron,mineur,maison,forge,tour,champ,loup,pierris,entrepôt,chantier,builder,pecheur,discipleathneutre,discipleath,mur,mine,chevaldetroie,caravaneCommerce,bateauCommerce,cabane,port,tourarcher};

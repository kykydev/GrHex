const motsGrece = ["Acropole", "Athéna", "Aristote", "Hoplite", "Méduse", "Sparte", "Zeus", "Olympie", "Parthénon", "Delphes", "Poséidon", "Socrate", "Platon", "Léonidas", "Héraclès", "Troie", "Odyssée", "Agora", "Dionysos", "Hadès", "Archimède", "Pythagore", "Mycènes", "Déméter", "Thermopyles", "Thucydide", "Rhétorique", "Cheval de Troie", "Phalange", "Colosse", "Marathon", "Péloponnèse", "Épicure", "Périclès"];
const adjectifs = ["Bancal", "Rigolo", "Fou", "Chancelant", "Bizarre", "Dingue", "Louche", "Zigzagant", "Moelleux", "Farfelu", "Grinçant", "Pétillant", "Foufou", "Clownesque", "Dodu", "Sautillant","Majestueux", "Légendaire", "Glorieux", "Héroïque", "Divin", "Redoutable", "Éternel", "Victorieux", "Puissant", "Imposant", "Intrépide", "Grandiose", "Immortel", "Inébranlable", "Formidable", "Valeureux", "Épique", "Mythique", "Titanesque", "Fulgurant","Lumineux", "Énigmatique", "Merveilleux", "Mystérieux", "Chaleureux", "Étincelant", "Rêveur", "Apaisant", "Charmant", "Bucolique", "Rayonnant", "Aérien", "Coloré", "Féerique", "Paisible", "Onirique", "Chatoyant", "Doux", "Fantaisiste", "Éblouissant"];
const couleurs = ["rouge","bleu","vert","jaune"]

const { v4: uuidv4 } = require('uuid');
const { casesAdjacentes, getX, getY, getCoords, offset_to_cube, distance, pathFind } = require('../modules/backendHex');
const {createMap} = require('../modules/mapGeneration')
const {player} = require('./player');
const { hexagon } = require('./hexagon');
const { turnAction,moveAction,newUnitAction,buildAction} = require('./turnAction')
const { hoplite,stratege,archer,messager,paysanne,building,hdv } = require('./unit')

class game {
    constructor(nbJoueurs,nbTours){
        this.nbJoueurs = nbJoueurs;
        this.nbTours = nbTours;
        this.tourCourant=0
        this.id = uuidv4()
        this.players = {}
        this.actions = []
        this.map = createMap()
        this.board = {}
        this.positionsDepart = {"beotie":214,"attique":1072,"argolide":297}
        this.name = motsGrece[Math.floor(Math.random()*motsGrece.length)]+"-"+adjectifs[Math.floor(Math.random()*adjectifs.length)]

    }

    currentPlayers(){return Object.keys(this.players).length}

    addPlayer(){
        if (this.currentPlayers()>=this.nbJoueurs){
            return false
        }
        var joueur = new player(couleurs[Object.keys(this.players).length])
        this.players[joueur.id]=joueur
        return joueur.id
    }

    
    citePrise(cite){
        for (z of Object.keys(this.players)){
            if (this.players[z].cite==cite){return true}   
        }
        return false
    }
    canStart(){
        if (this.currentPlayers()<this.nbJoueurs){return false}
        var cites = ["argolide","beotie","attique"]
        for (let zz of Object.keys(this.players)){
            var z = this.players[zz]
            if (z.cite==undefined || z.cite=="none" || !cites.includes(z.cite) ){return false}            
        }
        return true

    }

    addUnit(unit,position,player){
        if (this.board[position]==undefined){
            this.board[position]=unit
            player.addUnit(unit,position)
        }
        else{
            return false
        }
    }


    initBeotie(joueur){
        
        var boardBoetie = {
            185:new stratege(185,joueur),
            154:new archer(154,joueur),
            332:new archer(332,joueur),
            333:new paysanne(333,joueur),
            214: new hdv(214,joueur)
        }

        for (var position of Object.keys(boardBoetie)){
            this.addUnit(boardBoetie[position],position,joueur)
            this.map.infos[position] = new hexagon("plaine","plaine_1",position)
            this.map.terrain[position]=this.map.infos[position].pattern
            }       
    }

    initArgolide(joueur){
        var boardArgolide  = {
            328:new stratege(328,joueur),
            327:new archer(327,joueur),
            327:new archer(327,joueur),
            237:new archer(237,joueur),
            207:new paysanne(207,joueur),
            297: new hdv(297,joueur),
            155:new archer(155,joueur)
        }

        for (var position of Object.keys(boardArgolide)){
            this.addUnit(boardArgolide[position],position,joueur)
            this.map.infos[position] = new hexagon("plaine","plaine_1",position)
            this.map.terrain[position]=this.map.infos[position].pattern
            }    
            joueur.units[155].hp=20
    }
    initAttique(joueur){
        var boardAttique  = {
            1011:new stratege(1011,joueur),
            1101:new archer(1101,joueur),
            1073:new archer(1073,joueur),
            1071:new paysanne(1071,joueur),
            1072:new hdv(1072,joueur)
        }

        for (var position of Object.keys(boardAttique)){
            this.addUnit(boardAttique[position],position,joueur)
            this.map.infos[position] = new hexagon("plaine","plaine_1",position)
            this.map.terrain[position]=this.map.infos[position].pattern
            }    
    }

    initCites(){//Initialise les cités
        
        for (var joueur of Object.keys(this.players)){
                var ville = this.players[joueur].cite 
                var position = this.positionsDepart[ville]
                switch(ville){
                    case "beotie":
                        this.initBeotie(this.players[joueur])
                        break
                    case "argolide":
                        this.initArgolide(this.players[joueur])
                        break
                    case "attique":
                        this.initAttique(this.players[joueur])
                        break

                }
            }
        }


        init(){//Fonction qui initialise la partie
            this.initCites()

        }


        calculVision(unit){//Renvoi les informations de ce qui est visible par l'unité passée en paramètre
            var pos = unit.position
            var vision = unit.vision
            var retour = []
            var positionsVues = [pos]
            var positionsAdded = [pos]
            while (vision>  0){
                for (var z of positionsVues){
                    for (var zz of casesAdjacentes(z,this.map.width,this.map.height)){
                        if (!positionsVues.includes(zz) && !positionsAdded.includes(zz)){
                            positionsAdded.push(zz)
                        }
                    }
                }
                for (var j of positionsAdded){positionsVues.push(j)
                }
                vision--
            }
            for (var z of positionsVues){
                retour.push({"info":this.map.infos[z],"terrain":this.map.infos[z].pattern,"board":this.board[z]})
            }
            return retour

        }

        calculVue(player){//Crée la vue qui s'affichera pour le joueur, player étant un id
            var joueur = this.players[player]
          
            var retour = {"height":this.map.height,"width":this.map.width,"infos":[],"terrain":[],"board":{}}
           
            for (var z=0;z<this.map.height*this.map.width;z++){
                retour.infos.push(new hexagon("?","?",z))
                retour.terrain.push("?")
            }


            for (var uni of Object.keys(joueur.units)){
                var casesVues = this.calculVision(joueur.units[uni])
                for (var z of casesVues){
                    var posi = z.info.pos

                    retour.infos[posi] = z.info
                    retour.terrain[posi]=z.terrain
                    if (z.board!=undefined){retour.board[posi]=z.board}
            }
        }

        return retour

    }
        
    couldMove(unit,destination){//Regarde si l'unité pourrait aller à destination dans l'état actuel des choses 
        if (!casesAdjacentes(unit.position,this.map.width,this.map.height).includes(destination)){return false}//Déplacement une case par une case, si la destination n'est pas adjacente on annule
        if (!unit.canGo(this.map.terrain[destination])){return false}//Si l'unité ne peut pas se déplacer à destination, on annule
        if (this.board[destination]!=undefined){
            if (this.board[destination].owner==unit.owner){return false}
        }
        if (unit.movementLeft<this.moveCost(unit,destination)){return false}

        return true
        }

        moveCost(unit,destination){//Calcule le coût de mouvement d'une unité d'un point A à un point B
        let desthex = this.map.terrain[destination]
        if (desthex=="montagne" || desthex=="deepwater"){
            return 2
        }
        return 1


        }



    move(unit,destination){//Tente de déplacer unit sur la case destination. Retourne "false" si impossible, "true" sinon. Si la destination est occupée, initie un combat
        if (unit==undefined){return false}
        if (destination<0 || destination>this.map.terrain.length){return false}
        if (this.board[destination]!=undefined){ if (this.board[destination].owner==unit.owner){return false} }
        if (!casesAdjacentes(unit.position,this.map.width,this.map.height).includes(destination)){return false}//Déplacement une case par une case, si la destination n'est pas adjacente on annule
        if (!unit.canGo(this.map.terrain[destination])){return false}//Si l'unité ne peut pas se déplacer à destination, on annule
        if (!this.couldMove(unit,destination)){return false}//Si l'unité ne peut pas se déplacer à destination, on annule


        let unitOwner = this.players[unit.owner]
        if (this.board[destination]==undefined){//Cas où la case est libre
            delete unitOwner.units[unit.position]
            delete this.board[unit.position]
            this.board[destination] = unit
            unit.position = destination
            unitOwner.units[unit.position]=unit
            unit.movementLeft-=this.moveCost(unit,destination)
            return true
        }

        else{//Cas où la case est occupée
            let target = this.board[destination]
            let targetOwner = this.players[target.owner]

            let res = this.combat(unit,target)
            if (res==2){
                delete unitOwner.units[unit.position]
                delete this.board[unit.position]
                this.board[destination] = unit
                unit.position = destination
                unitOwner.units[unit.position]=unit
                unit.movementLeft-=this.moveCost(unit,destination)
                return true
            }
            else{
                 unit.movementLeft-=this.moveCost(unit,destination)
                 return false
            }
        }



    }


    kill(unit){
        if (unit==undefined){return false}
        delete this.board[unit.position]
        delete this.players[unit.owner].units[unit.position]
        return true
    }

    

    combat(unit1,unit2){//Fait se battre l'unité 1 avec l'unité 2. Renvoie false s'il n'y a pas de mort, 1 ou 2 pour dire qui est mort si un seul et 3 si les deux unités sont mortes
        let damage=0
        if (unit1.initiative > unit2.initiative){//L'unité 1 attaque avant
            damage =  unit1.attack-unit2.defense
            if (damage<0) {damage=0}
            if (damage>=unit2.hp){//Cas où l'unité 1 a tué
                this.kill(unit2)
                return 2
            }
            else{//Cas où l'unité 1 n'a pas tué
                unit2.hp = unit2.hp-damage
                let damage =unit2.attack-unit1.defense
                if (damage<0) {damage=0}
                if (damage>=unit1.hp){//Cas où l'unité 1 a tué
                    this.kill(unit1)
                    return 1
                }
                else{//Cas où personne n'est mort
                        unit1.hp = unit1.hp-damage
                        return false

                    }
                    
                }
        }
        else{//Cas où l'unité 2 attaque avant
            
             damage =   unit2.attack-unit1.defense
                if (damage<0) {damage=0}
            if (damage>=unit1.hp){//Cas où l'unité 2 a tué
                    this.kill(unit1)
                    return 1
                }
            else{//Cas où l'unité 2 n'a pas tué
                    unit1.hp = unit1.hp-damage
                     damage =  (unit1.attack-unit2.defense)
                    if (damage<0) {damage=0}
                    if (damage>=unit2.hp){//Cas où l'unité 1 a tué
                        this.kill(unit2)
                        return 2
                    }
                    else{//Cas où personne n'est mort
                        unit2.hp = unit2.hp-damage
                        return false

                    }
                    
                }

        }

    }

    canTour(){//Check si tous les joueurs ont passé leur tour
        for (z of Object.keys(this.players)){
            if ((this.players[z]).played==false && this.players[z].eliminated==false){return false}
            }
            return true
    }
    tour(){//Fait se jouer un tour avec une liste d'actions
        //------------Itère au travers des unités pour générer les actions du tour--------------
        for (let uni of Object.keys(this.board)){
            this.board[uni].movementLeft = this.board[uni].movement
            if (this.board[uni].destination==this.board[uni].position){this.board[uni].destination=undefined}
            if (this.board[uni].destination != undefined){
                if (this.board[uni].type!="building" && this.board[uni].path!=undefined && this.board[uni].path.length==0){this.board[uni].path=undefined}

                this.actions.push(new moveAction(this.board[uni].position,this.players[this.board[uni].owner]))
            }

        }
            
            for (var act of this.actions){
                switch (act.type) {
                    case "movement":
                        let uni = this.board[act.pos]
                        this.moveTurn(uni)
                        
                        break;
                
                    default:
                        break;
                }
            }
            
            

        //trie les actions par priorité

        //Fait les actions dans l'ordre


        //Reset les mouvements et tours

        for (z of Object.keys(this.players)){
            this.players[z].played=false
        }
        for (let uni of Object.keys(this.board)){
            this.board[uni].movementLeft=this.board[uni].movement
            if (this.board[uni].path==[]){this.board[uni].path=undefined}
        }

    }

    pathfindToDestination(départ,arrivée,owner){
        var rules = []
        for (var z in this.map.terrain){
            let zz = this.map.terrain[z]
            if (zz=="eau" || (this.board[z]!=undefined && this.board[z].owner==owner) || (zz=="montagne" && this.board[départ].movement<=1)){rules.push("X")}
            else if (zz=="montagne"){rules.push(1)}
                else{rules.push(0)}
            }
            
            let route = pathFind(départ,arrivée,this.map.height,this.map.width,rules)
            return route
    }


    moveTurn(uni){//Fait jouer le tour de l'unité (la déplace case par case vers sa destination. Si le pathfind n'a pas été fait, le fait aussi)
        if (uni==undefined){return}
        
        if (uni.destination!=undefined && uni.destination!=uni.position && uni.path==undefined){//Calcul de la route voulue
                let route = this.pathfindToDestination(uni.position,uni.destination,uni.owner)
                uni.path = route
                if (uni.path==undefined || uni.path==false){return}
                uni.path.shift()
            
        }
        let moved = true
        while (uni!=undefined && uni.movementLeft>0 && moved!=false){
            if (uni.path==undefined || uni.path==false){return}

            moved = this.move(uni,uni.path[0])
            if (moved!=false){uni.path.shift()}
        }

        if (uni.path.length==0){uni.path=undefined}


    }









    }




        

        
        module.exports = { game };

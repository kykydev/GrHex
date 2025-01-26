const motsGrece = ["Acropole", "Athéna", "Aristote", "Hoplite", "Méduse", "Sparte", "Zeus", "Olympie", "Parthénon", "Delphes", "Poséidon", "Socrate", "Platon", "Léonidas", "Héraclès", "Troie", "Odyssée", "Agora", "Dionysos", "Hadès", "Archimède", "Pythagore", "Mycènes", "Déméter", "Thermopyles", "Thucydide", "Rhétorique", "Cheval de Troie", "Phalange", "Colosse", "Marathon", "Péloponnèse", "Épicure", "Périclès"];
const adjectifs = ["Bancal", "Rigolo", "Fou", "Chancelant", "Bizarre", "Dingue", "Louche", "Zigzagant", "Moelleux", "Farfelu", "Grinçant", "Pétillant", "Foufou", "Clownesque", "Dodu", "Sautillant", "Majestueux", "Légendaire", "Glorieux", "Héroïque", "Divin", "Redoutable", "Éternel", "Victorieux", "Puissant", "Imposant", "Intrépide", "Grandiose", "Immortel", "Inébranlable", "Formidable", "Valeureux", "Épique", "Mythique", "Titanesque", "Fulgurant", "Lumineux", "Énigmatique", "Merveilleux", "Mystérieux", "Chaleureux", "Étincelant", "Rêveur", "Apaisant", "Charmant", "Bucolique", "Rayonnant", "Aérien", "Coloré", "Féerique", "Paisible", "Onirique", "Chatoyant", "Doux", "Fantaisiste", "Éblouissant"];
const couleurs = ["rouge", "bleu", "vert", "jaune", "jaune"]

const { v4: uuidv4 } = require('uuid');
const { casesAdjacentes, getX, getY, getCoords, offset_to_cube, distance, pathFind } = require('../modules/backendHex');
const { createMap } = require('../modules/mapGeneration')
const { player } = require('./player');
const { hexagon } = require('./hexagon');
const { turnAction, moveAction, newUnitAction, buildAction } = require('./turnAction')
const { hoplite,stratege,archer,messager,paysanne,building,hdv,bucheron,mineur,maison,forge,tour,champ } = require('./unit')
const {buildings} = require('../modules/buildingInfos')



class game {
    constructor(nbJoueurs, nbTours) {
        this.nbJoueurs = nbJoueurs;
        this.nbTours = nbTours;
        this.tourCourant = 0
        this.id = uuidv4()
        this.players = {}
        this.actions = []
        this.map = createMap()
        this.board = {}
        this.positionsDepart = { "beotie": 214, "attique": 1072, "argolide": 297 }
        this.name = motsGrece[Math.floor(Math.random() * motsGrece.length)] + "-" + adjectifs[Math.floor(Math.random() * adjectifs.length)]
        this.actionsThisTurn = []
    }

    currentPlayers() { return Object.keys(this.players).length }

    addPlayer() {
        if (this.currentPlayers() >= this.nbJoueurs) {
            return false
        }
        var joueur = new player(couleurs[Object.keys(this.players).length])
        this.players[joueur.id] = joueur
        return joueur.id
    }


    citePrise(cite) {
        for (z of Object.keys(this.players)) {
            if (this.players[z].cite == cite) { return true }
        }
        return false
    }
    canStart() {
        if (this.currentPlayers() < this.nbJoueurs) { return false }
        var cites = ["argolide", "beotie", "attique"]
        for (let zz of Object.keys(this.players)) {
            var z = this.players[zz]
            if (z.cite == undefined || z.cite == "none" || !cites.includes(z.cite)) { return false }
        }
        return true

    }

    addUnit(unit, position, player) {
        if (this.board[position] == undefined) {
            this.board[position] = unit
            player.addUnit(unit, position)
            return true
        }
        else {
            return false
        }
    }


    initBeotie(joueur) {

        var boardBoetie = {
            185: new stratege(185, joueur),

            243: new bucheron(243, joueur),
            183: new paysanne(183, joueur),
            214: new hdv(214, joueur),
            215: new mineur(215, joueur)
        }

        for (var position of Object.keys(boardBoetie)) {
            this.addUnit(boardBoetie[position], position, joueur)
            this.map.infos[position] = new hexagon("plaine", "plaine_1", position)
            this.map.terrain[position] = this.map.infos[position].pattern
        }
        joueur.hdv = 214

    }

    initArgolide(joueur) {
        var boardArgolide = {
            328: new stratege(328, joueur),
            237: new bucheron(237, joueur),
            267: new paysanne(267, joueur),
            297: new hdv(297, joueur),
            357: new mineur(357,joueur),
        }

        for (var position of Object.keys(boardArgolide)) {
            this.addUnit(boardArgolide[position], position, joueur)
            this.map.infos[position] = new hexagon("plaine", "plaine_1", position)
            this.map.terrain[position] = this.map.infos[position].pattern
        }
        joueur.hdv = 297
    }

    initAttique(joueur) {
        var boardAttique = {
            1011: new stratege(1011, joueur),
            1043: new bucheron(1043, joueur),
            1071: new paysanne(1071, joueur),
            1072: new hdv(1072, joueur),
            1041: new mineur(1041,joueur)
        }

        for (var position of Object.keys(boardAttique)) {
            this.addUnit(boardAttique[position], position, joueur)
            this.map.infos[position] = new hexagon("plaine", "plaine_1", position)
            this.map.terrain[position] = this.map.infos[position].pattern
        }
        joueur.hdv = 1072

    }

    initCites() {//Initialise les cités

        for (var joueur of Object.keys(this.players)) {
            var ville = this.players[joueur].cite
            var position = this.positionsDepart[ville]
            switch (ville) {
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


    init() {//Fonction qui initialise la partie
        this.initCites()

    }


    calculVision(unit) {//Renvoi les informations de ce qui est visible par l'unité passée en paramètre
        var pos = unit.position
        var vision = unit.vision
        var retour = []
        var positionsVues = [pos]
        var positionsAdded = [pos]
        while (vision > 0) {
            for (var z of positionsVues) {
                for (var zz of casesAdjacentes(z, this.map.width, this.map.height)) {
                    if (!positionsVues.includes(zz) && !positionsAdded.includes(zz)) {
                        positionsAdded.push(zz)
                    }
                }
            }
            for (var j of positionsAdded) {
                positionsVues.push(j)
            }
            vision--
        }
        for (var z of positionsVues) {
            retour.push({ "info": this.map.infos[z], "terrain": this.map.infos[z].pattern, "board": this.board[z] })
        }
        return retour

    }

    calculVue(player) {//Crée la vue qui s'affichera pour le joueur, player étant un id
        var joueur = this.players[player]

        var retour = { "height": this.map.height, "width": this.map.width, "infos": [], "terrain": [], "board": {} }

        for (var z = 0; z < this.map.height * this.map.width; z++) {
            retour.infos.push(new hexagon("?", "?", z))
            retour.terrain.push("?")
        }


        for (var uni of Object.keys(joueur.units)) {
            var casesVues = this.calculVision(joueur.units[uni])
            for (var z of casesVues) {
                var posi = z.info.pos

                retour.infos[posi] = z.info
                retour.terrain[posi] = z.terrain
                if (z.board != undefined) { retour.board[posi] = z.board }
            }
        }

        return retour

    }

    couldMove(unit, destination) {//Regarde si l'unité pourrait aller à destination dans l'état actuel des choses 
        if (!casesAdjacentes(unit.position, this.map.width, this.map.height).includes(destination)) { return false }//Déplacement une case par une case, si la destination n'est pas adjacente on annule
        if (!unit.canGo(this.map.terrain[destination])) { return false }//Si l'unité ne peut pas se déplacer à destination, on annule
        if (this.board[destination] != undefined) {
            if (this.board[destination].owner == unit.owner) { return false }
        }
        if (unit.movementLeft < this.moveCost(unit, destination)) { return false }

        return true
    }

    moveCost(unit, destination) {//Calcule le coût de mouvement d'une unité d'un point A à un point B
        let desthex = this.map.terrain[destination]
        if (desthex == "montagne" || desthex == "deepwater") {
            return 2
        }
        return 1


    }



    move(unit, destination) {//Tente de déplacer unit sur la case destination. Retourne "false" si impossible, "true" sinon. Si la destination est occupée, initie un combat
        if (unit == undefined) { return false }
        if (destination < 0 || destination > this.map.terrain.length) { return false }
        if (this.board[destination] != undefined) { if (this.board[destination].owner == unit.owner) { return false } }
        if (!casesAdjacentes(unit.position, this.map.width, this.map.height).includes(destination)) { return false }//Déplacement une case par une case, si la destination n'est pas adjacente on annule
        if (!unit.canGo(this.map.terrain[destination])) { return false }//Si l'unité ne peut pas se déplacer à destination, on annule
        if (!this.couldMove(unit, destination)) { return false }//Si l'unité ne peut pas se déplacer à destination, on annule


        let unitOwner = this.players[unit.owner]
        if (this.board[destination] == undefined) {//Cas où la case est libre
            delete unitOwner.units[unit.position]
            delete this.board[unit.position]
            this.board[destination] = unit
            unit.position = destination
            unitOwner.units[unit.position] = unit
            unit.movementLeft -= this.moveCost(unit, destination)
            return true
        }

        else {//Cas où la case est occupée
            let target = this.board[destination]
            let targetOwner = this.players[target.owner]

            let res = this.combat(unit, target)
            if (res == 2) {
                delete unitOwner.units[unit.position]
                delete this.board[unit.position]
                this.board[destination] = unit
                unit.position = destination
                unitOwner.units[unit.position] = unit
                unit.movementLeft -= this.moveCost(unit, destination)
                return true
            }
            else {
                unit.movementLeft -= this.moveCost(unit, destination)
                return false
            }
        }



    }


    kill(unit) {
        if (unit == undefined) { return false }
        this.actionsThisTurn.push({ "type": "mort", "position": unit.position })
        delete this.board[unit.position]
        delete this.players[unit.owner].units[unit.position]
        return true
    }



    combat(unit1, unit2) {//Fait se battre l'unité 1 avec l'unité 2. Renvoie false s'il n'y a pas de mort, 1 ou 2 pour dire qui est mort si un seul et 3 si les deux unités sont mortes
        let damage = 0
        if (unit1.initiative > unit2.initiative) {//L'unité 1 attaque avant
            damage = unit1.attack - unit2.defense
            if (damage < 0) { damage = 0 }
            if (damage >= unit2.hp) {//Cas où l'unité 1 a tué
                this.kill(unit2)
                return 2
            }
            else {//Cas où l'unité 1 n'a pas tué
                unit2.hp = unit2.hp - damage
                damage = unit2.attack - unit1.defense
                if (damage < 0) { damage = 0 }
                if (damage >= unit1.hp) {//Cas où l'unité 1 a tué
                    this.kill(unit1)
                    return 1
                }
                else {//Cas où personne n'est mort
                    unit1.hp = unit1.hp - damage
                    return false

                }

            }
        }
        else {//Cas où l'unité 2 attaque avant

            damage = unit2.attack - unit1.defense
            if (damage < 0) { damage = 0 }
            if (damage >= unit1.hp) {//Cas où l'unité 2 a tué
                this.kill(unit1)
                return 1
            }
            else {//Cas où l'unité 2 n'a pas tué
                unit1.hp = unit1.hp - damage
                damage = (unit1.attack - unit2.defense)
                if (damage < 0) { damage = 0 }
                if (damage >= unit2.hp) {//Cas où l'unité 1 a tué
                    this.kill(unit2)
                    return 2
                }
                else {//Cas où personne n'est mort
                    unit2.hp = unit2.hp - damage
                    return false

                }

            }

        }

    }



    récolte(uni, position) {
        switch (this.map.infos[position].type) {
            case "carriere":
                uni.stone += 1
                this.map.infos[position].nbStone--
                if (this.map.infos[position].nbStone <= 0) {
                    this.map.infos[position] = new hexagon("plaine", "plaine_1", position)
                    this.map.terrain[position]="plaine_1"
                }
                else{uni.lastCarriere = position}

                break


            case "foret":
                uni.wood += 1
                this.map.infos[position].nbTrees--
                if (this.map.infos[position].nbTrees <= 0) {
                    this.map.infos[position] = new hexagon("plaine", "plaine_1", position)
                    this.map.terrain[position]="plaine_1"
                }
                else{uni.lastForet = position}
                break
        }
    }



    testRécolteRessources(uni) {//Tente de faire récolter des ressources à l'unité
        switch (uni.name) {
            case "Mineur":
                if (this.map.infos[uni.position].type == "carriere" && this.map.infos[uni.position].nbStone > 0) {
                    if (uni.stone>=uni.maxStone){return}
                    this.récolte(uni, uni.position)
                }
                break

            case "Bûcheron":
                if (this.map.infos[uni.position].type == "foret" && this.map.infos[uni.position].nbTrees > 0) {
                    if (uni.wood>=uni.maxWood){return}
                    this.récolte(uni, uni.position)
                }
                break

            case "Paysanne":

            if (this.map.infos[uni.position].type == "foret" && this.map.infos[uni.position].nbTrees > 0) {
                if (uni.wood>=uni.maxWood){return}
                this.récolte(uni, uni.position)}
            
            if (this.map.infos[uni.position].type == "carriere" && this.map.infos[uni.position].nbStone > 0) {
                if (uni.stone>=uni.maxStone){return}
                this.récolte(uni, uni.position)}

            break

            default: 
                return
                
        }
    }

    testDéposeRessources(uni){//Tente de déposer les ressources à sa base
        if (uni == undefined) { return }

        if (casesAdjacentes(uni.position,this.map.width,this.map.height).includes(this.players[uni.owner].hdv)){
            if (uni.stone!=undefined){
                this.players[uni.owner].stone += uni.stone
                uni.stone = 0                
            }

            if (uni.wood!=undefined){
                this.players[uni.owner].wood += uni.wood
                uni.wood = 0                
            }

            if (uni.copper!=undefined){
                this.players[uni.owner].copper += uni.copper
                uni.copper = 0                
            }
        }
    }

    canTour() {//Check si tous les joueurs ont passé leur tour
        for (z of Object.keys(this.players)) {
            if ((this.players[z]).played == false && this.players[z].eliminated == false) { return false }

        }
        return true
    }

    tour() {//Fait se jouer un tour avec une liste d'actions

        this.actionsThisTurn = []
        this.actions = []
        //------------Itère au travers des unités pour générer les actions du tour--------------
        for (let uni of Object.keys(this.board)) {
            this.board[uni].movementLeft = this.board[uni].movement
            if (this.board[uni].destination == this.board[uni].position) { this.board[uni].destination = undefined }
            if (this.board[uni].destination != undefined) {
                if (this.board[uni].type != "building" && this.board[uni].path != undefined && this.board[uni].path.length == 0) { this.board[uni].path = undefined }//Reset les path vides
                this.actions.push(new moveAction(this.board[uni].position, this.players[this.board[uni].owner]))
            }
            
        //Récolte des ressources en début de tour
        if (this.board[uni].name=="Bûcheron" || this.board[uni].name=="Paysanne" || this.board[uni].name=="Mineur"){
            this.testRécolteRessources(this.board[uni])
        }
        }

        //------Tri des actions par initiative ---------------------------

        this.actions.sort((a, b) => a.priorité - b.priorité)

        //Activation des actions
        for (var act of this.actions) {
            switch (act.type) {
                case "movement":
                    let uni = this.board[act.pos]
                    this.moveTurn(uni)
                    this.testDéposeRessources(uni)
                    break;

                default:
                    break;
            }
        }



        //trie les actions par priorité

        //Fait les actions dans l'ordre



        //Reset les mouvements et tours

        for (z of Object.keys(this.players)) {
            this.players[z].played = false
        }
        for (let uni of Object.keys(this.board)) {
            this.board[uni].movementLeft = this.board[uni].movement
            if (this.board[uni].path == []) { this.board[uni].path = undefined }
        }

        this.tourCourant++

        //Vérifie les morts et éventuellement la fin de partie

        this.checkForDead()
        return this.checkForVictory()

    }

    pathfindToDestination(départ, arrivée, owner) {
        var rules = []
        for (var z in this.map.terrain) {
            let zz = this.map.terrain[z]
            if (zz == "eau" || (this.board[z] != undefined && this.board[z].owner == owner) || (zz == "montagne" && this.board[départ].movement <= 1)) { rules.push("X") }
            else if (zz == "montagne") { rules.push(2) }
            else { rules.push(1) }
        }

        let route = pathFind(départ, arrivée, this.map.height, this.map.width, rules)
        return route
    }


    moveTurn(uni) {//Fait jouer le tour de l'unité (la déplace case par case vers sa destination. Si le pathfind n'a pas été fait, le fait aussi)
        if (uni == undefined) { return }

        if (uni.destination != undefined && uni.destination != uni.position && uni.path == undefined) {//Calcul de la route voulue
            let route = this.pathfindToDestination(uni.position, uni.destination, uni.owner)
            uni.path = route
            if (uni.path == undefined || uni.path == false) { return }
            uni.path.shift()
        }

        let moved = true
        while (uni != undefined && uni.movementLeft > 0 && moved != false) {
            if (uni.path == undefined || uni.path == false) { return }
            let posd = uni.position

            moved = this.move(uni, uni.path[0])
            if (moved != false) {//Cas où on a réussi à bouger
                uni.path.shift()
                let posa = uni.position
                this.actionsThisTurn.push({ "type": "mouvement", "départ": posd, "arrivée": posa })
            }
        }

        if (uni.path!=undefined && uni.path.length == 0) { uni.path = undefined }


    }



    checkForDead(){//Vérifie si l'un des joueurs a perdu son stratège et, si oui, appelle eliminate dessus
        for (var z of Object.keys(this.players)){
            let strategeEnVie = false
            for (var zz of Object.keys(this.players[z].units)){
                if (this.players[z].units[zz].name=="Stratege"){strategeEnVie=true}
            }
            if (strategeEnVie==false){
                this.eliminate(this.players[z])
            }
        }
    }

    eliminate(player){//élimine le joueur en détruisant toutes ses unités et en mettant "eliminated" à true
    player.eliminated=true
    for (var z of Object.keys(player.units)){
        this.kill(player.units[z])
    }

    }


getTurnWinner(){//Récupère le (ou les) joueur qui a le plus d'or, utilisé en cas de fin de partie par tours
    var winner = undefined;
    for (let z of Object.keys(this.players)){
        if (this.players[z].eliminated==false && (winner==undefined || this.players[z].gold>=winner.gold )){
            winner=this.players[z]
        }
    }

    var winningGold = winner.gold
    for (let z of Object.keys(this.players)){
        if (winner==undefined || (this.players[z].id!=winner.id && this.players[z].gold==winner.gold)){
            winner = undefined
        }
    }
    if (winner==undefined){
        winner = []
        for (let z of Object.keys(this.players)){
            if (this.players[z].gold==winningGold){
                winner.push(this.players[z].name)
            }
        }   
    }

    return winner
}

checkForDeathVictory(){//Vérifie s'il n'y a qu'un seul joueur en vie et, si c'est le cas, renvoie son nom comme gagnant
var nbJoueursVivants = 0
for (let z of Object.keys(this.players)){//Vérifie le nombre de joueurs en vie
    if (this.players[z].eliminated==false){
        nbJoueursVivants++
    }
}   

if (nbJoueursVivants==1){

    for (let z of Object.keys(this.players)){//Renvoie le gagnant si oui
        if (this.players[z].eliminated==false){
            return this.players[z].name
        }
    }   

}

return false

}


checkForVictory(){//Vérifie si la partie est finie et renvoie le pseudo du vainqueur si oui



    var winner = false

    if (this.tourCourant==this.nbTours){
        winner = this.getTurnWinner()
}

if (winner==false){

    winner = this.checkForDeathVictory()
}


return winner
}




build(nomBat,pos,joueur){//Tente de faire construire le bâtiment à la position voulue pour le joueur concerné
    if (nomBat==undefined || pos==undefined || joueur==undefined){return false}
    //Checks pour voir si c'est bon
    if (this.map.terrain[pos]=="montagne" || this.map.terrain[pos]=="eau"){return false}
    if (this.board[pos]!=undefined){return false}
    let batInfos = undefined
    for (var z of buildings){
        if (z.nom==nomBat){batInfos=z}
    }
    
    var posStratège
    for (var z of Object.keys(joueur.units)){
        if (joueur.units[z].name=="Stratege"){
            posStratège=z
        }
    }
    if (posStratège==undefined || distance(posStratège,pos,this.map.height)>2){return false}
    if (batInfos==undefined){return false}
    
    if (joueur.gold<batInfos.coûtOr || joueur.wood<batInfos.coûtBois || joueur.stone<batInfos.coûtPierre || joueur.copper<batInfos.coûtCuivre ){return false}
    //Eval permet de transformer la string en la classe
    console.log(batInfos.nom)
    let uni = new (eval(batInfos.nom.toLowerCase()))(pos,joueur)
    if (this.addUnit(uni,pos,joueur)==true){
        joueur.gold-=batInfos.coûtOr;
        joueur.wood-=batInfos.coûtBois;
        joueur.stone-=batInfos.coûtPierre;
        joueur.copper-=batInfos.coûtCuivre;


        return true
    }
    else{
        return false
    }

}


evolve(uniPos){//Tente de faire évoluer l'unité en position pos
    var uni = this.board[uniPos]
    if (uni==undefined){return false}
    var joueur = this.players[uni.owner]

    if (uni.canEvolve()==false){return false}

    var newUni = uni.evolution(joueur)
    this.board[uni.position]=newUni
    joueur.units[uni.position]=newUni
    return true
    
}



}

module.exports = { game };

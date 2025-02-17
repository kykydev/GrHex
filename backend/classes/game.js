const motsGrece = ["Acropole", "Athéna", "Aristote", "Hoplite", "Méduse", "Sparte", "Zeus", "Olympie", "Parthénon", "Delphes", "Poséidon", "Socrate", "Platon", "Léonidas", "Héraclès", "Troie", "Odyssée", "Agora", "Dionysos", "Hadès", "Archimède", "Pythagore", "Mycènes", "Déméter", "Thermopyles", "Thucydide", "Rhétorique", "Cheval de Troie", "Phalange", "Colosse", "Marathon", "Péloponnèse", "Épicure", "Périclès"];
const adjectifs = ["Bancal", "Rigolo", "Fou", "Chancelant", "Bizarre", "Dingue", "Louche", "Zigzagant", "Moelleux", "Farfelu", "Grinçant", "Pétillant", "Foufou", "Clownesque", "Dodu", "Sautillant", "Majestueux", "Légendaire", "Glorieux", "Héroïque", "Divin", "Redoutable", "Éternel", "Victorieux", "Puissant", "Imposant", "Intrépide", "Grandiose", "Immortel", "Inébranlable", "Formidable", "Valeureux", "Épique", "Mythique", "Titanesque", "Fulgurant", "Lumineux", "Énigmatique", "Merveilleux", "Mystérieux", "Chaleureux", "Étincelant", "Rêveur", "Apaisant", "Charmant", "Bucolique", "Rayonnant", "Aérien", "Coloré", "Féerique", "Paisible", "Onirique", "Chatoyant", "Doux", "Fantaisiste", "Éblouissant"];
const couleurs = ["rouge", "bleu", "vert", "jaune"]

const { v4: uuidv4 } = require('uuid');
const { casesAdjacentes, getX, getY, getCoords, offset_to_cube, distance, pathFind } = require('../modules/backendHex');
const { createMap } = require('../modules/mapGeneration')
const { player } = require('./player');
const { visionDiff } = require('./visionDiff');
const { hexagon } = require('./hexagon');
const { turnAction, moveAction, newUnitAction, buildAction,neutralMoveAction,builderPickupAction,builderBuildAction} = require('./turnAction')
const { hoplite,stratege,archer,messager,paysanne,building,hdv,bucheron,mineur,maison,forge,tour,champ,loup,pierris,entrepôt,chantier,builder, discipleathneutre } = require('./unit')
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
        this.positionsDepart = { "beotie": 573, "attique": 1072, "argolide": 297 }
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
            if (unit.canGo(this.map.terrain[position])==false){return false}
            this.board[position] = unit
            player.addUnit(unit, position)
            if (this.board[position].name=="Maison"){this.board[position].generateVillager(position,player,this);}
            if (this.board[position].name=="Hôtel de ville" || this.board[position].name=="Entrepôt"){player.hdv.push(parseInt(position))}
            unit.updateBase(this)
            return true
        }
        else {
            return false
        }
    }


    initBeotie(joueur) {

        var boardBeotie = {
            //Thèbes
            573: new hdv(573, joueur),//HDV de thèbes
            496:new hdv(496,joueur),//HDV de platées
            515: new stratege(515, joueur),
            541: new bucheron(541, joueur),
            183: new paysanne(183, joueur),
            215: new mineur(215, joueur),
            122: new champ(122,joueur),
            63: new champ(63,joueur),
            576: new tour(576,joueur),
            542: new tour(542,joueur),
            516: new hoplite(516,joueur),
            696: new hoplite(696,joueur),
            483: new maison(483,joueur),
            570: new maison(570,joueur),
            664: new maison(664,joueur),
            636: new maison(636,joueur),

            //Platées
            524:new hoplite(524,joueur),
            434:new hoplite(434,joueur),
            437:new maison(437,joueur),
            545:new forge(545,joueur)

            }


            for (var position of Object.keys(boardBeotie)) {
                this.addUnit(boardBeotie[position], position, joueur)
                for (var z of casesAdjacentes(position,this.map.width,this.map.height)){
                    if (this.map.infos[z].type=="montagne"){
                this.map.infos[z] = new hexagon("plaine", "plaine_1", z)    
                this.map.terrain[z] = this.map.infos[z].pattern
                }
            }
            }
            for (var position of Object.keys(joueur.units)) {
                joueur.units[position].updateBase(this)
            }
    }

    initArgolide(joueur) {
        var boardArgolide = {
            //Corrinthe
            327: new stratege(327, joueur),
            288: new bucheron(288, joueur),
            268: new mineur(268,joueur),
            415:new paysanne(415,joueur),
            359:new champ(359,joueur),
            297: new hdv(297, joueur),
            386: new tour(386,joueur),
            299: new tour(299,joueur),
            179:new hoplite(179,joueur),
            446:new hoplite(446,joueur),
            236:new maison(236,joueur),
            267: new maison(267, joueur),
            208: new maison(208, joueur),
            419: new maison(419, joueur),
            //Mégare
            680: new hdv(680,joueur),
            589:new hoplite(589,joueur),
            559:new hoplite(559,joueur),
            651:new maison(651,joueur)


        }

        for (var position of Object.keys(boardArgolide)) {
            this.addUnit(boardArgolide[position], position, joueur)
            for (var z of casesAdjacentes(position,this.map.width,this.map.height)){
                if (this.map.infos[z].type=="montagne"){
            this.map.infos[z] = new hexagon("plaine", "plaine_1", z)    
            this.map.terrain[z] = this.map.infos[z].pattern
            }
        }
        }
    }

    initAttique(joueur) {
        var boardAttique = {
            //Athènes
            1011: new stratege(1011, joueur),
            1043: new bucheron(1043, joueur),
            977: new paysanne(977, joueur),
            1072: new hdv(1072, joueur),
            1041: new mineur(1041,joueur),
            949: new hoplite(949,joueur),
            861: new hoplite(861,joueur),
            981: new tour(981,joueur),
            1101: new tour(1101,joueur),
            1009:new champ(1009,joueur),
            1192: new maison(1192,joueur),
            1159: new maison(1159,joueur),
            1039: new maison(1039,joueur),
            1134: new maison(1134,joueur),
            //Décélie
            1119: new hdv(1119,joueur),
            1088:new hoplite(1088,joueur),  
            1087:new bucheron(1087,joueur),
            1147:new maison(1147,joueur)
        }
        for (var position of Object.keys(boardAttique)) {
            this.addUnit(boardAttique[position], position, joueur)
            for (var z of casesAdjacentes(position,this.map.width,this.map.height)){
                if (this.map.infos[z].type=="montagne"){
            this.map.infos[z] = new hexagon("plaine", "plaine_1", z)    
            this.map.terrain[z] = this.map.infos[z].pattern
            }
        }
        }
     

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
        this.board[94] = new pierris(94)
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
            if ((unit.name=="Paysanne" || unit.name=="Bûcheron") && this.map.infos[z].type=="foret" && unit.knownForests.includes(z)==false){unit.knownForests.push(z)}
            if ((unit.name=="Paysanne" || unit.name=="Mineur") && this.map.infos[z].type=="carriere" && unit.knownCarrieres.includes(z)==false){unit.knownCarrieres.push(z)}
        }
        return retour

    }


 


    créeVisionDifférée(player,visions,uni,posStratège){//Ajoute la vision de l'unité aux visions différées du joueur
        var vis = JSON.parse(JSON.stringify(visions[uni]));
        var unité = this.board[uni]
        var visAge = 1
        for (var z in vis){if (vis[z].pos==uni){vis.splice(z,1);break}}

        var distStratège = distance(posStratège,uni,this.map.height)
        if (distStratège<=this.board[posStratège].vision){return}
        if (distStratège>this.board[posStratège].vision+10){visAge=2}
        if (distStratège>this.board[posStratège].vision+20){visAge=3}        
        player.visionsDiff.push(new visionDiff(vis,visAge))
    }

    ajoutVisionsDifférées(player,ret){//Ajoute les visions différées du joueur à sa vue actuelle
        var retour = ret
        for (var z in player.visionsDiff){
            var vision = player.visionsDiff[z]
            if (vision.tours==0){
                for (var vis of vision.vision){
                        if (retour.terrain[vis.info.pos][0]=="?"){
                        retour.infos[vis.info.pos] = new hexagon("!"+vision.age+vis.info.type, "!1"+vision.age+vis.info.pattern.pattern,vis.info.pos)
                        retour.terrain[vis.info.pos] = "!"+vision.age+vis.terrain
                        if (vis.board!=undefined && !(vis.board.tracked==true && vis.board.owner==player.id)){retour.board[vis.info.pos]=vis.board}
                        }
                    }
                }
            player.visionsDiff[z].tours--
        }
        for (var z in player.visionsDiff){
                    if (vision.tours==0){
                    player.visionsDiff.splice(z,1)
                    z--
                    }
        }
        return retour
    }


    calculVue(player) {//Crée la vue qui s'affichera pour le joueur, player étant un id
        var joueur = this.players[player]

        //Initialisation du tableau vide pour le retour
        var retour = { "height": this.map.height, "width": this.map.width, "infos": [], "terrain": [], "board": {} }

        for (var z = 0; z < this.map.height * this.map.width; z++) {
            retour.infos.push(new hexagon("?"+this.map.infos[z].type, "?"+this.map.infos[z].pattern,z))
            retour.terrain.push("?"+this.map.terrain[z])
        }


        let visions = {}//Donne les cases vues par l'unité en position i pour i une case
        let comps = {}//Donne la comp (=groupe de tours couvrant) de l'unité dans la case
        let tours = []//Liste des tours vues
        var posStratège;

        for (var uni of Object.keys(joueur.units)) {//Itération au travers des unités pour trouver les tours et le stratège

            var unité = joueur.units[uni]
            visions[uni]=this.calculVision(unité)
            if (unité.name=="Tour"){
                tours.push(uni)
                }
            if (unité.name=="Stratege"){posStratège=uni}
                comps[uni]=uni
            }

           

            for (var uni of Object.keys(joueur.units)) {//Itération au travers des unités pour trouver les tours et le stratège
            if (this.board[uni].tracked){this.créeVisionDifférée(joueur,visions ,uni,posStratège)}
            }


            for (var z of tours){//Déterminer les chaînes de tours
                for (var posTest of visions[z]){
                    if (joueur.units[posTest.info.pos]!=undefined && comps[z]!=comps[posTest.info.pos] && posTest.board.name=="Tour"){
                        comps[posTest.info.pos]=comps[z]
                        for (var zz of Object.keys(comps)){
                            if (comps[zz]==comps[posTest.info.pos]){
                                comps[zz]=comps[z]
                        }
                    }
                }
            }
        }

        
        
            for (var z of visions[posStratège]){//Récupération des unités vues par le stratège ou la chaîne
                if (comps[z.info.pos]!=undefined){
                    for (var zz of Object.keys(comps)){
                        if (comps[zz]==comps[z.info.pos]){
                            comps[zz]=comps[posStratège]
                        }
                    }
                    comps[z.info.pos]=comps[posStratège]
                }
            }   

            for (var z of tours){//
                if (comps[z]==comps[posStratège]){
                for (var posTest of visions[z]){
                    if (joueur.units[posTest.info.pos]!=undefined){
                        comps[posTest.info.pos]=comps[z]
                        }
                    }
                }
            }


            for (var z of Object.keys(visions)){//Ajout de toutes les cases vues par la chaîne
                if (this.board[z].tracked){
                retour.infos[z] = this.map.infos[z]
                retour.terrain[z] = this.map.terrain[z]
               retour.board[z] = this.board[z]} 
                if (comps[z]==comps[posStratège]){
                    for (var posi of visions[z]){
                        retour.infos[posi.info.pos] = posi.info
                        retour.terrain[posi.info.pos] = posi.terrain
                        if (posi.board != undefined) { retour.board[posi.info.pos] = posi.board }
                    }
                }
            }
            
            retour = this.ajoutVisionsDifférées(joueur,retour)



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
            if (unitOwner!=undefined){delete unitOwner.units[unit.position]}
            delete this.board[unit.position]
            this.board[destination] = unit
            unit.position = destination
            if (unitOwner!=undefined){unitOwner.units[unit.position] = unit}
            unit.movementLeft -= this.moveCost(unit, destination)
            return true
        }

        else {//Cas où la case est occupée
            let target = this.board[destination]
            let targetOwner = this.players[target.owner]

            let res = this.combat(unit, target)
            if (res == 2) {
                if (unitOwner!=undefined) {delete unitOwner.units[unit.position]}
                delete this.board[unit.position]
                this.board[destination] = unit
                unit.position = destination
                if (unitOwner!=undefined){unitOwner.units[unit.position] = unit}
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
        if (this.players[unit.owner]!=undefined && this.players[unit.owner].units[unit.position]!=undefined){delete this.players[unit.owner].units[unit.position]}
        if (unit.name=="Hôtel de ville" || unit.name=="Entrepôt"){
            for (var z in  this.players[unit.owner].hdv ){
                this.players[unit.owner].hdv.splice(z,1);break}
            }
        return true
    }



    combat(unit1, unit2) {//Fait se battre l'unité 1 avec l'unité 2. Renvoie false s'il n'y a pas de mort, 1 ou 2 pour dire qui est mort si un seul et 3 si les deux unités sont mortes
        let damage = 0
        if (unit1.initiative >= unit2.initiative) {//L'unité 1 attaque avant
            damage = unit1.attack - unit2.defense
            if (damage < 0) { damage = 0 }
            this.actionsThisTurn.push({ "type": "combat", "départ": unit1.position, "arrivée":unit2.position,"dégâts":"-"+damage})
            if (damage >= unit2.hp) {//Cas où l'unité 1 a tué
                unit1.steal(unit2)
                this.kill(unit2)
                return 2
            }
            else {//Cas où l'unité 1 n'a pas tué
                unit2.hp = unit2.hp - damage
                if (unit2.range>=unit1.range){
                damage = unit2.attack - unit1.defense
                if (damage < 0) { damage = 0 }

                if (unit2.type!="building" && damage>0){this.actionsThisTurn.push({ "type": "combat", "départ": unit2.position, "arrivée":unit1.position,"dégâts":"-"+damage})}

                if (damage >= unit1.hp) {//Cas où l'unité 2 a tué
                    unit2.steal(unit1)
                    this.kill(unit1)
                    return 1
                }
                else {//Cas où personne n'est mort
                    unit1.hp = unit1.hp - damage
                    return false

                    }
                }
            }
        }
        else {//Cas où l'unité 2 attaque avant
            
            if (unit2.range>=unit1.range){
            damage = unit2.attack - unit1.defense
            if (damage < 0) { damage = 0 }
            this.actionsThisTurn.push({ "type": "combat", "départ": unit2.position, "arrivée":unit1.position,"dégâts":"-"+damage})
            if (damage >= unit1.hp) {//Cas où l'unité 2 a tué
                unit2.steal(unit1)
                this.kill(unit1)
                return 1
            }
            else {//Cas où l'unité 2 n'a pas tué
                unit1.hp = unit1.hp - damage
                damage = (unit1.attack - unit2.defense)
                if (damage < 0) { damage = 0 }
                if (unit1.type!="building" && damage>0){ this.actionsThisTurn.push({ "type": "combat", "départ": unit1.position, "arrivée":unit2.position,"dégâts":"-"+damage})}
                if (damage >= unit2.hp) {//Cas où l'unité 1 a tué
                    unit1.steal(unit2)
                    this.kill(unit2)
                    return 2
                }
                else {//Cas où personne n'est mort
                    unit2.hp = unit2.hp - damage
                    return false

                }

            }
            }
            else{
                damage = (unit1.attack - unit2.defense)
                if (damage < 0) { damage = 0 }
                if (unit1.type!="building" && damage>0){ this.actionsThisTurn.push({ "type": "combat", "départ": unit1.position, "arrivée":unit2.position,"dégâts":"-"+damage})}
                if (damage >= unit2.hp) {//Cas où l'unité 1 a tué
                    unit1.steal(unit2)
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
                this.actionsThisTurn.push({ "type": "ressource", "position": uni.position, "ressource": "pierre" })
                if (this.map.infos[position].nbStone <= 0) {
                    this.map.infos[position] = new hexagon("plaine", "plaine_1", position)
                    this.map.terrain[position]="plaine_1"
                }
                
                break
                
                
                case "foret":
                this.actionsThisTurn.push({ "type": "ressource", "position": uni.position, "ressource": "bois" })
                uni.wood += 1
                this.map.infos[position].nbTrees--
                if (this.map.infos[position].nbTrees <= 0) {
                    this.map.infos[position] = new hexagon("plaine", "plaine_1", position)
                    this.map.terrain[position]="plaine_1"
                }
                break
        }
    }



    testRécolteRessources(uni) {//Tente de faire récolter des ressources à l'unité
        switch (uni.name) {
            case "Mineur":
                if (this.map.infos[uni.position].type == "carriere" && this.map.infos[uni.position].nbStone > 0) {
                    if (uni.canRécolte(this)==false){return}
                    this.récolte(uni, uni.position)
                }
                break

            case "Bûcheron":
                if (this.map.infos[uni.position].type == "foret" && this.map.infos[uni.position].nbTrees > 0) {
                    if (uni.canRécolte(this)==false){return}
                    this.récolte(uni, uni.position)
                }
                break

            case "Paysanne":

            if (this.map.infos[uni.position].type == "foret" && this.map.infos[uni.position].nbTrees > 0) {
                if (uni.canRécolte(this)==false){return}
                this.récolte(uni, uni.position)}
            
            if (this.map.infos[uni.position].type == "carriere" && this.map.infos[uni.position].nbStone > 0) {
                if (uni.canRécolte(this)==false){return}
                this.récolte(uni, uni.position)}

            break

            default: 
                return
                
        }
    }

    //JE DOIS TESTER AVEC UN ENTREPOT   

    
    testDéposeRessources(uni){//Tente de déposer les ressources à sa base
        if (uni == undefined) { return }
        if (uni.canDépose()!=true){return false}
        if (casesAdjacentes(uni.position,this.map.width,this.map.height).includes(uni.base)){
        if (uni.base==undefined){return}
        var receiver = this.board[uni.base]; if (receiver.name!="Hôtel de ville" && receiver.name!="Entrepôt"){return}

            if (uni.stone!=undefined && uni.stone>0){
                if (receiver.stone==undefined){receiver.stone=0}
                receiver.stone += uni.stone
                this.actionsThisTurn.push({ "type": "poseHDV", "position": receiver.position, "ressource": "pierre","quantité":uni.stone })             
                uni.stone = 0   
            }   
            
            if (uni.wood!=undefined && uni.wood>0){
                if (receiver.wood==undefined){receiver.wood=0}
                receiver.wood += uni.wood
                this.actionsThisTurn.push({ "type": "poseHDV", "position": receiver.position, "ressource": "bois","quantité":uni.wood })             
                uni.wood = 0                    
            }
            
            if (receiver.copper!=undefined){receiver.copper=0}
            receiver.copper += uni.copper
            this.actionsThisTurn.push({ "type": "poseHDV", "position": receiver.position, "ressource": "cuivre","quantité":uni.copper })             
            uni.copper= 0     

            if (uni.gold!=undefined){
                this.players[uni.owner].gold += uni.gold
                uni.gold = 0                
            }
        }
    }


    testRécup(unité){//Prend la position d'un ouvrier en entrée. Teste si l'ouvrier peut récupérer les ressources nécessaires à son chantier
        if (unité==undefined){return}
        if (unité.phase!="getRessources"){return}
        
        if (unité.currentBuilding==undefined || this.board[unité.currentBuilding]==undefined){return}
        
        

        for (var z of casesAdjacentes(unité.position,this.map.width,this.map.height)){
            if (this.board[z]!=undefined && (this.board[z].name=="Hôtel de ville" || this.board[z].name=="Entrepôt")){
                var réserve = this.board[z]
                var travail = this.board[unité.currentBuilding]//Si l'unité n'a pas les ressources elle tente de les prendre
                if (travail.buildingInfos.coûtBois<=unité.wood && travail.buildingInfos.coûtPierre<=unité.stone && travail.buildingInfos.coûtCuivre<=unité.copper){unité.phase="buildBuilding";return}
                if (travail.buildingInfos.coûtBois>unité.wood){
                    //Après récupération des ressources avec un if pour voir si on en a besoin de plus qu'il y en a
                    var neededWood = travail.buildingInfos.coûtBois-unité.wood
                    if (neededWood>réserve.wood){neededWood=réserve.wood}
                    réserve.wood-=neededWood
                    unité.wood+=neededWood

                }
                if (travail.buildingInfos.coûtPierre>unité.stone){
                    //Après récupération des ressources avec un if pour voir si on en a besoin de plus qu'il y en a
                    var neededStone = travail.buildingInfos.coûtPierre-unité.stone
                    if (neededStone>réserve.stone){neededStone=réserve.stone}
                    réserve.stone-=neededStone
                    unité.stone+=neededStone

                }
                if (travail.buildingInfos.coûtCuivre>unité.copper){
                    //Après récupération des ressources avec un if pour voir si on en a besoin de plus qu'il y en a
                    var neededCopper = travail.buildingInfos.coûtCuivre-unité.copper
                    if (neededCopper>réserve.copper){neededCopper=réserve.copper}
                    réserve.copper-=neededCopper
                    unité.copper+=neededCopper

                }




            }
        }
    }

    testBuild(uni){
        if (uni==undefined && uni.wood!=undefined){return}
        var joueur = this.players[uni.owner]
        if (joueur==undefined){return}
        //Faire test dépôt des ressources dans le chantier, puis réduction tours si possible et enfin build quand tour=0
        var travail = this.board[uni.currentBuilding]
        if (casesAdjacentes(uni.position,this.map.width,this.map.height).includes(uni.currentBuilding)==false){return}
        if (travail==undefined){return}
        if (travail.buildingInfos.coûtBois!=0){
            var depositedwood = uni.wood;
            if (depositedwood>travail.buildingInfos.coûtBois){depositedwood=travail.buildingInfos.coûtBois}
            travail.buildingInfos.coûtBois-=depositedwood;uni.wood-=depositedwood
    }
    
        if (travail.buildingInfos.coûtPierre!=0 && uni.stone!=undefined){
            var depositedstone = uni.stone;
            if (depositedstone>travail.buildingInfos.coûtPierre){depositedstone=travail.buildingInfos.coûtPierre}
            travail.buildingInfos.coûtPierre-=depositedstone;uni.stone-=depositedstone
    }   
    
        if (travail.buildingInfos.coûtCuivre!=0 && uni.copper!=undefined){
            var depositedcopper = uni.copper;
            if (depositedcopper>travail.buildingInfos.coûtCuivre){depositedcopper=travail.buildingInfos.coûtCuivre}
            travail.buildingInfos.coûtCuivre-=depositedcopper;uni.copper-=depositedcopper
    }
    

    if (travail.turnsToBuild==0){//Si la construction est terminée, tout reset et créer le bâtiment
        var nomBuild = travail.buildingInfos.nom.toLowerCase();if (nomBuild=="hôtel de ville"){nomBuild="hdv"} 
        let build = new (eval(nomBuild))(travail.position,joueur)
        delete this.board[build.position]
        delete joueur.units[build.position]
        this.addUnit(build,build.position,joueur)
        uni.phase=undefined
        uni.currentBuilding=undefined
    }

    if (travail.buildingInfos.coûtBois==0 && travail.buildingInfos.coûtPierre==0 && travail.buildingInfos.coûtCuivre==0){
        travail.turnsToBuild-=1
        
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
        this.SpawnLoup()
        //------------Itère au travers des unités pour générer les actions du tour--------------
        for (let uni of Object.keys(this.board)) {
            this.board[uni].movementLeft = this.board[uni].movement
            if (this.board[uni].name=="Champ"){this.revenuChamp(this.board[uni])}
            if (this.board[uni].destination == this.board[uni].position) { this.board[uni].destination = undefined }
            this.board[uni].destination = this.board[uni].findGoal(this)            
            if (this.board[uni].destination != undefined) {
                if (this.board[uni].type != "building") { this.board[uni].path = this.pathfindToDestination(this.board[uni].position, this.board[uni].destination, this.board[uni].owner);
                        if (this.board[uni].path==false){this.board[uni].path=undefined}
                        else{this.board[uni].path.shift()}}//Reset les path 
                if (this.board[uni].owner!="Système"){
                this.actions.push(new moveAction(this.board[uni].position, this.players[this.board[uni].owner]))
                }
                else{
                    this.actions.push(new neutralMoveAction(this.board[uni].position))                 
                }
            }
            
        //Récolte des ressources en début de tour
        if (this.board[uni].name=="Bûcheron" || this.board[uni].name=="Paysanne" || this.board[uni].name=="Mineur"){
            this.testRécolteRessources(this.board[uni])
            this.board[uni].updateBase(this)
        }
        if (this.board[uni].name=="Ouvrier"){
            this.board[uni].updateBase(this)
            if (this.board[uni].phase=="getRessources"){this.actions.push(new builderPickupAction(this.board[uni],this.players[this.board[uni].owner]))}
            if (this.board[uni].phase=="buildBuilding"){this.actions.push(new builderBuildAction(this.board[uni],this.players[this.board[uni].owner]))}
        }
        }

        //------Tri des actions par initiative ---------------------------
        this.actions.sort((a, b) => a.priorité - b.priorité)

        //Activation des actions
        for (var act of this.actions) {
            let uni
            switch (act.type) {
                case "movement":
                     uni = this.board[act.pos]
                    this.moveTurn(uni)
                    if (uni!=undefined && uni.owner!="Système"){this.testDéposeRessources(uni)}
                    if (uni!=undefined && uni.owner!="Système" && uni.name=="Messager"){this.testMessager(uni)}
                    break;

                case "builderPickup":
                uni = act.uni
                if (uni!=undefined && uni.owner!="Système"){
                    this.testRécup(uni)}    
                break

                case "builderBuild":
                uni = act.uni
                if (uni!=undefined && uni.owner!="Système"){
                    this.testBuild(uni)}    
                break

                default:
                    break;
            }
        }



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
        var uni = this.board[départ];if (uni==undefined){return}
        for (var z in this.map.terrain){
            let zz = this.map.terrain[z]
            if (uni.canGo(zz)==false || (this.board[z] != undefined && this.board[z].owner == owner)) { rules.push("X") }
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
                winner.push(this.players[z])
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


revenuChamp(unite){
    var joueur = this.players[unite.owner]
    if (joueur==undefined){return false}
    for (var z of unite.workers){
    var revenu = z.fieldRevenu
    joueur.gold+=revenu;
    this.actionsThisTurn.push({ "type": "ressource", "position": unite.position, "ressource": "or" })
    
}

}

build(nomBat,pos,joueur){//Tente de faire construire le bâtiment à la position voulue pour le joueur concerné
    var pos = parseInt(pos)
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
    
    
    var assignedBuilder = undefined
    
    for (var z of Object.keys(joueur.units)){
        if (joueur.units[z].name=="Ouvrier" && joueur.units[z].currentBuilding==undefined){
            assignedBuilder=joueur.units[z]
        }
    }
    
    if (posStratège==undefined || distance(posStratège,pos,this.map.height)>3){return false}
    if (batInfos==undefined){return false}
    if (assignedBuilder==undefined){return false}
    
    if (joueur.gold<batInfos.coûtOr){return}


    let uni = new chantier(pos,joueur,batInfos)
    if (this.addUnit(uni,pos,joueur)==true){
        assignedBuilder.currentBuilding = uni.position
        assignedBuilder.phase = "getRessources"
        joueur.gold-=batInfos.coûtOr
        return true
    }
    else{
        return false
    }

}



recruteOuvrier(pos){
    if (this.board[pos]==undefined || this.board[pos].name!="Hôtel de ville"){return false}
    var joueur = this.players[this.board[pos].owner]

    if (joueur.gold<30){return false}
    
    for (var z of casesAdjacentes(pos,this.map.width,this.map.height)){
        if (this.board[z]==undefined){
            var uni = new builder(z,joueur)
            if (this.addUnit(uni,z,joueur)){            
                    joueur.gold-=30;
                   return z}
        }
    }


    return false
}


evolve(uniPos,evo ){//Tente de faire évoluer l'unité en position pos
    var uni = this.board[uniPos]; if (uni==undefined){return false}
    var evos = uni.getForgeEvos();if (evos==undefined || evos==false){return false}
    var joueur = this.players[uni.owner]; if (uni==undefined){return false}

     for (var z of evos){
        if (z.nom==evo){
            if (joueur.gold>=z.prix){
                var newUni = new (eval(evo.toLowerCase()))(uniPos,joueur)
                delete this.board[uniPos] 
                delete joueur.units[uniPos]
                if (this.addUnit(newUni,uniPos,joueur)){
                    joueur.gold-=z.prix
                    return true
                }
            }
        }
     }

    
    return false
}

/*     var uni = this.board[uniPos]
    if (uni==undefined){return false}
    var joueur = this.players[uni.owner]

    if (uni.canEvolve()==false){return false}

    var newUni = uni.evolution(joueur)
    this.board[uni.position]=newUni
    joueur.units[uni.position]=newUni
    return true */


SpawnLoup(){//Fait apparaître un nombre aléatoire de loups sur des cases aléatoires de la carte
let nbLoups=0
var rand = Math.random()
if (rand<0.15){nbLoups=1}
if (rand>0.97){nbLoups=2}

    while (nbLoups>0){

        let ajouted = false
        while (ajouted==false){
            var position = Math.floor(Math.random()*this.map.terrain.length)
            var peutAjouter = true
            if (this.board[position]!=undefined || this.map.terrain[position]=="montagne" || this.map.terrain[position]=="eau"){peutAjouter=false}

            let oldtab = casesAdjacentes(position,this.map.width,this.map.height)
            let newtab = []    
            for (let j=0;j<5;j++){
                for (var z of oldtab){
                    if (this.board[z]!=undefined && this.board[z].owner!="Système"){
                        peutAjouter=false
                        break
                    }
                    for (var zz of casesAdjacentes(z,this.map.width,this.map.height)){
                        newtab.push(zz)
                    }
                }
                oldtab=newtab
                newtab=[]
            }


            
            if (peutAjouter){
                this.board[position]=new loup(position)
                ajouted=true
            }
        }
        nbLoups--
    }

}

getEmitRessources(idJoueur){//Renvoie les informatios pour le socket.on("ressources")
    var or=0;var bois=0;var pierre=0;var cuivre=0
    var joueur = this.players[idJoueur]; if (joueur==undefined){return false}
    or = joueur.gold;
    for (var z of Object.keys(joueur.units)){
        let uni = joueur.units[z]
        if (uni.name=="Hôtel de ville" || uni.name=="Entrepôt"){
            if (uni.wood!=undefined){bois+=uni.wood}
            if (uni.stone!=undefined){pierre+=uni.stone}
            if (uni.copper!=undefined){cuivre+=uni.copper}
    }
}
return {"or":or,"bois":bois,"pierre":pierre,"cuivre":cuivre, "tourCourant":this.tourCourant,"toursMax":this.nbTours}

}

getForgeEvolutions(position,idJoueur) {//Teste si la case ciblée est une forge et, si oui, 

    var joueur = this.players[idJoueur];if (joueur==undefined){return false}
    if (this.board[position]==undefined ||this.board[position].name!="Forge" || this.board[position].owner!=idJoueur){return false}
var retour = []
for (var z of casesAdjacentes(position,this.map.width,this.map.height)){
    if (this.board[z]!=undefined && this.board[z].owner==idJoueur){
        var evos = this.board[z].getForgeEvos()
        if (evos!=false){retour.push({"position":z,"name":this.board[z].name,"evolutions":evos})}
    }
}

return retour
}

getUnitesChamp(position,idJoueur){
    var cham = this.board[position]; if (cham==undefined || cham.owner!=idJoueur){return false}
    if (cham.name!="Champ"){return false}
    return (cham.getUnis())
}

getRevenuChamp(position,idJoueur){
    var cham = this.board[position]; if (cham==undefined || cham.owner!=idJoueur){return false}
    if (cham.name!="Champ"){return false}
    var revenu = 0
    for (var z of cham.workers){revenu+=z.fieldRevenu}
    return revenu
}



canOrder(idJoueur,posDépart){//Prend un IDJOUEUR et une position et dit si le joueur en question peut donner un ordre direct à l'unité se trouvant à cette position, false sinon et undefined si on ne sait pas
    if (idJoueur==undefined || posDépart==undefined || this.board[posDépart]==undefined || this.players[idJoueur]==undefined){return undefined}
    var joueur = this.players[idJoueur]; if (joueur==undefined){return undefined}
    for (var z of Object.keys(joueur.units)){
        if (this.board[z].name=="Stratege"){
            return (distance(z,posDépart,this.map.height)<=this.board[z].vision)
        }
    }

    return undefined
}


recruteMessager(idJoueur,posDépart,des){
    var coûtMessager = 5
   if (idJoueur==undefined || posDépart==undefined || this.board[posDépart]==undefined||  this.board[posDépart].tracked==false || this.players[idJoueur]==undefined){return undefined}
   var joueur = this.players[idJoueur]; if (joueur==undefined){return undefined}
   for (var z of Object.keys(joueur.units)){
    if (this.board[z].name=="Stratege"){
        for (var pos of casesAdjacentes(z,this.map.width,this.map.height)){
            if (this.board[pos]==undefined){
                if (joueur.gold<=coûtMessager){return false}
                var mes = new messager(pos,joueur)
                if (this.addUnit(mes,pos,joueur)){
                    joueur.gold-=coûtMessager
                    mes.targetUni = this.board[posDépart]
                    mes.destMessage=des

                return mes
                }
            }
        }
    }
}


    return false
}

testMessager(uni){//Teste si un messager est toujours utile et s'il a atteint sa destination
    if (uni==undefined || uni.name!="Messager" ){return}
    if (uni.targetUni==undefined|| uni.destMessage==undefined){
        delete this.board[uni.position]
        delete this.players[uni.owner].units[uni.position]
    }

    if (casesAdjacentes(uni.position,this.map.width,this.map.height).includes(uni.targetUni.position)){
        var tar = this.board[uni.targetUni.position]
        tar.destination=uni.destMessage
        delete this.board[uni.position]
        delete this.players[uni.owner].units[uni.position]
        return true
    }




}



}
module.exports = { game };

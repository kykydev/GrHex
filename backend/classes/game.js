const motsGrece = ["Acropole", "Athéna", "Aristote", "Hoplite", "Méduse", "Sparte", "Zeus", "Olympie", "Parthénon", "Delphes", "Poséidon", "Socrate", "Platon", "Léonidas", "Héraclès", "Troie", "Odyssée", "Agora", "Dionysos", "Hadès", "Archimède", "Pythagore", "Mycènes", "Déméter", "Thermopyles", "Thucydide", "Rhétorique", "Cheval de Troie", "Phalange", "Colosse", "Marathon", "Péloponnèse", "Épicure", "Périclès"];
const adjectifs = ["Bancal", "Rigolo", "Fou", "Chancelant", "Bizarre", "Dingue", "Louche", "Zigzagant", "Moelleux", "Farfelu", "Grinçant", "Pétillant", "Foufou", "Clownesque", "Dodu", "Sautillant", "Majestueux", "Légendaire", "Glorieux", "Héroïque", "Divin", "Redoutable", "Éternel", "Victorieux", "Puissant", "Imposant", "Intrépide", "Grandiose", "Immortel", "Inébranlable", "Formidable", "Valeureux", "Épique", "Mythique", "Titanesque", "Fulgurant", "Lumineux", "Énigmatique", "Merveilleux", "Mystérieux", "Chaleureux", "Étincelant", "Rêveur", "Apaisant", "Charmant", "Bucolique", "Rayonnant", "Aérien", "Coloré", "Féerique", "Paisible", "Onirique", "Chatoyant", "Doux", "Fantaisiste", "Éblouissant"];
const couleurs = ["rouge", "bleu", "vert", "jaune"]

const { v4: uuidv4 } = require('uuid');
const { casesAdjacentes, getX, getY, getCoords, offset_to_cube, distance, pathFind } = require('../modules/backendHex');
const { createMapFromName } = require('../modules/mapGeneration')
const { player } = require('./player');
const { visionDiff } = require('./visionDiff');
const { hexagon } = require('./hexagon');
const { turnAction, moveAction, newUnitAction, buildAction,neutralMoveAction,builderPickupAction,builderBuildAction} = require('./turnAction')
const { hoplite,stratege,archer,messager,paysanne,building,hdv,bucheron,mineur,maison,forge,tour,champ,loup,pierris,entrepôt,chantier,builder,pecheur,discipleathneutre,discipleath,mur,mine,chevaldetroie,caravaneCommerce,bateauCommerce} = require('./unit')
const {buildings} = require('../modules/buildingInfos')



class game {
    constructor(nbJoueurs, nbTours,nomMap) {
        this.nbJoueurs = nbJoueurs;
        this.nbTours = nbTours;
        this.tourCourant = 0
        this.id = uuidv4()
        this.players = {}
        this.actions = []
        this.map = createMapFromName(nomMap)
        this.board = {}
        this.positionsDepart = this.map.positionsDépart
        this.name = motsGrece[Math.floor(Math.random() * motsGrece.length)] + "-" + adjectifs[Math.floor(Math.random() * adjectifs.length)]
        this.actionsThisTurn = []
        this.trades = {}
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
            if (this.board[position].name=="Mine"){this.board[position].mineral = this.map.mines[position]}
            return true
        }
        else {
            return false
        }
    }


    initBeotie(joueur) {

        var hdvs = this.map.boards.hdvBeotie

        
        for (var z of hdvs) {
            this.map.infos[z] = new hexagon("plaine", "plaine_1", z)    
            this.map.terrain[z] = this.map.infos[z].pattern
            this.addUnit(new hdv(z,joueur), z, joueur)  
        }
        var boardBeotie = this.map.boards.beotie
      
            var mursBeotie = this.map.boards.mursBeotie;
            for (var wall of mursBeotie){boardBeotie[wall] = "mur"}


            for (var position of Object.keys(boardBeotie)) {
                this.map.infos[position] = new hexagon("plaine", "plaine_1", position)    
                this.map.terrain[position] = this.map.infos[position].pattern
                this.addUnit(new (eval(boardBeotie[position]))(position, joueur), position, joueur);
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


    //METTRE HDV D'ABORD POUR LES BASES
    //Ou alors hdv = [aeroazreazre] et ensuite comme murs  
    
        var hdvs = this.map.boards.hdvArgolide

        
        for (var z of hdvs) {
            this.map.infos[z] = new hexagon("plaine", "plaine_1", z)    
            this.map.terrain[z] = this.map.infos[z].pattern
            this.addUnit(new hdv(z,joueur), z, joueur)  
        }

        var boardArgolide = this.map.boards.argolide
  
        var mursArgolide = this.map.boards.mursArgolide;
        for (var wall of mursArgolide){boardArgolide[wall] = "mur"}



        for (var position of Object.keys(boardArgolide)) {
            this.map.infos[position] = new hexagon("plaine", "plaine_1", position)    
            this.map.terrain[position] = this.map.infos[position].pattern
            this.addUnit(new (eval(boardArgolide[position]))(position, joueur), position, joueur);
            for (var z of casesAdjacentes(position,this.map.width,this.map.height)){
                if (this.map.infos[z].type=="montagne"){
            this.map.infos[z] = new hexagon("plaine", "plaine_1", z)    
            this.map.terrain[z] = this.map.infos[z].pattern
            }
        }
        }
    }

    initAttique(joueur) {


        var hdvs = this.map.boards.hdvAttique

        
        for (var z of hdvs) {
            this.map.infos[z] = new hexagon("plaine", "plaine_1", z)    
            this.map.terrain[z] = this.map.infos[z].pattern
            this.addUnit(new hdv(z,joueur), z, joueur)  
        }

        var boardAttique = this.map.boards.attique
        
        var mursAttique = this.map.boards.mursAttique
        for (var wall of mursAttique){boardAttique[wall] = "mur"}



        for (var position of Object.keys(boardAttique)) {
            this.map.infos[position] = new hexagon("plaine", "plaine_1", position)    
            this.map.terrain[position] = this.map.infos[position].pattern
            this.addUnit(new (eval(boardAttique[position]))(position, joueur), position, joueur);
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

    initNeutre(){


        var boardNeutre = this.map.boards.boardNeutre
        if (boardNeutre==undefined){return false}
        for (var position of Object.keys(boardNeutre)) {
            if (this.board[position]==undefined){
            this.map.infos[position] = new hexagon("plaine", "plaine_1", position)    
            this.map.terrain[position] = this.map.infos[position].pattern
            var uni = new (eval(boardNeutre[position]))(position)
            if (uni.canGo(this.map.terrain[position])){this.board[position] = uni}
            }
            }
        }
        
    

    init() {//Fonction qui initialise la partie
        this.initCites()
        this.initNeutre()
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
            if ((unit.name=="Pêcheur") && this.map.infos[z].type=="eau" && unit.knownWater.includes(z)==false){unit.knownWater.push(z)}
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
                        retour.infos[vis.info.pos] = new hexagon("!"+vision.age+vis.info.type, "!"+vision.age+vis.info.pattern.pattern,vis.info.pos)
                        retour.terrain[vis.info.pos] = "!"+vision.age+vis.terrain
                        if (vis.board!=undefined && !(vis.board.tracked==true && vis.board.owner==player.id)){retour.board[vis.info.pos]=vis.board}
                        }
                    }
                }
               
                
            }
            player.visionsDiff = player.visionsDiff.filter(v => v.tours > 0);
            
            for (var z in player.visionsDiff){
                player.visionsDiff[z].tours--
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
            for (var espion of joueur.espions){
                var esp = [{ "info": this.map.infos[espion], "terrain": this.map.infos[espion].pattern, "board": this.board[espion] }]
                
                joueur.visionsDiff.push(new visionDiff(esp,1))
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
        let buffMontagneUni1=0;let buffMontagneUni2=0;
        if (this.map.infos[unit1.position].terrain=="Montagne"){buffMontagneUni1=0.2}
        if (this.map.infos[unit2.position].terrain=="Montagne"){buffMontagneUni2=0.2}
        if (buffMontagneUni1!=0 && buffMontagneUni2!=0){ buffMontagneUni1=0; buffMontagneUni2=0;}
        if (unit1.initiative*(1+buffMontagneUni1) >= unit2.initiative*(1+buffMontagneUni2)) {//L'unité 1 attaque avant
            damage = unit1.attack*(1+buffMontagneUni1) - unit2.defense
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
                damage = unit2.attack*(1+buffMontagneUni2) - unit1.defense
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

            case "Pêcheur":
                if (uni.canRécolte(this)==false){return}
                for (var z of casesAdjacentes(uni.position,this.map.width,this.map.height)){
                        if (this.map.infos[z].type=="eau"){
                            this.récoltePoisson(uni.position)
                            return
                        }
                }

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

        if (uni.stone !== undefined && uni.stone > 0) {
            if (receiver.stone === undefined) { receiver.stone = 0; }
            
            var deposited = uni.stone;
            if (receiver.stone + deposited > receiver.maxStone) {
                deposited = receiver.maxStone - receiver.stone;
            }
        
            receiver.stone += deposited;
            
            this.actionsThisTurn.push({ 
                "type": "poseHDV", 
                "position": receiver.position, 
                "ressource": "pierre", 
                "quantité": deposited 
            });
        
            uni.stone -= deposited;
        }
        
        if (uni.wood !== undefined && uni.wood > 0) {
            if (receiver.wood === undefined) { receiver.wood = 0; }
            
            var deposited = uni.wood;
            if (receiver.wood + deposited > receiver.maxWood) {
                deposited = receiver.maxWood - receiver.wood;
            }
        
            receiver.wood += deposited;
            
            this.actionsThisTurn.push({ 
                "type": "poseHDV", 
                "position": receiver.position, 
                "ressource": "bois", 
                "quantité": deposited 
            });
        
            uni.wood -= deposited;
        }
        
        if (uni.copper !== undefined && uni.copper > 0) {
            if (receiver.copper === undefined) { receiver.copper = 0; }
            
            var deposited = uni.copper;
            if (receiver.copper + deposited > receiver.maxCopper) {
                deposited = receiver.maxCopper - receiver.copper;
            }
        
            receiver.copper += deposited;
            
            this.actionsThisTurn.push({ 
                "type": "poseHDV", 
                "position": receiver.position, 
                "ressource": "cuivre", 
                "quantité": deposited 
            });
        
            uni.copper -= deposited;
        }
        
        if (uni.tin !== undefined && uni.tin > 0) {
            if (receiver.tin === undefined) { receiver.tin = 0; }
            
            var deposited = uni.tin;
            if (receiver.tin + deposited > receiver.maxTin) {
                deposited = receiver.maxTin - receiver.tin;
            }
        
            receiver.tin += deposited;
            
            this.actionsThisTurn.push({ 
                "type": "poseHDV", 
                "position": receiver.position, 
                "ressource": "étain", 
                "quantité": deposited 
            });
        
            uni.tin -= deposited;
        }
        

            if (uni.gold!=undefined){
                this.players[uni.owner].gold += uni.gold
                uni.gold = 0                
            }
            if (uni.fishValue!=undefined && uni.fishValue>0){
                this.players[uni.owner].gold+=uni.fishValue
                uni.fishValue=0
                uni.fish=0
            }

        }
    }


    testRécup(unité){//Prend la position d'un ouvrier en entrée. Teste si l'ouvrier peut récupérer les ressources nécessaires à son chantier
        if (unité==undefined){return}
        if (unité.phase!="getRessources"){return}
        
        if (unité.currentBuilding==undefined || this.board[unité.currentBuilding]==undefined || this.board[unité.currentBuilding].name!="Chantier"){unité.currentBuilding=undefined;return}
        
        

        for (var z of casesAdjacentes(unité.position,this.map.width,this.map.height)){
            if (this.board[z]!=undefined && (this.board[z].name=="Hôtel de ville" || this.board[z].name=="Entrepôt")){
                var réserve = this.board[z]
                var travail = this.board[unité.currentBuilding]//Si l'unité n'a pas les ressources elle tente de les prendre
                if (travail.buildingInfos.coûtBois<=unité.wood && travail.buildingInfos.coûtPierre<=unité.stone && travail.buildingInfos.coûtCuivre<=unité.copper && travail.buildingInfos.coûtEtain<=unité.tin){unité.phase="buildBuilding";return}
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
                if (travail.buildingInfos.coûtEtain>unité.tin){
                    //Après récupération des ressources avec un if pour voir si on en a besoin de plus qu'il y en a
                    var neededTin = travail.buildingInfos.coûtEtain-unité.tin
                    if (neededTin>réserve.tin){neededTin=réserve.tin}
                    réserve.tin-=neededTin
                    unité.tin+=neededTin

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
    if (travail.buildingInfos.coûtEtain!=0 && uni.tin!=undefined){
        var depositedtin = uni.tin;
        if (depositedtin>travail.buildingInfos.coûtEtain){depositedtin=travail.buildingInfos.coûtEtain}
        travail.buildingInfos.coûtEtain-=depositedtin;uni.tin-=depositedtin
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
            if (this.board[uni].name=="Mine"){this.tourMine(this.board[uni])}
            if (this.board[uni].destination == this.board[uni].position) { this.board[uni].destination = undefined }
            this.board[uni].destination = this.board[uni].findGoal(this)      
            if (this.board[uni].destination != undefined) {//Reset les path 
                if (this.board[uni].owner!="Système"){
                this.actions.push(new moveAction(this.board[uni].position, this.players[this.board[uni].owner]))
                }
                else{
                    this.actions.push(new neutralMoveAction(this.board[uni].position))                 
                }
            }
            
        //Récolte des ressources en début de tour
        if (this.board[uni].name=="Bûcheron" || this.board[uni].name=="Paysanne" || this.board[uni].name=="Mineur" || this.board[uni].name=="Pêcheur"){
            this.board[uni].updateBase(this)
            this.testRécolteRessources(this.board[uni])
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
                     if (uni.type != "building") { uni.path = this.pathfindToDestination(uni.position, uni.destination, uni.owner);
                        if (uni.path==false){uni.path=undefined}
                        else{uni.path.shift()}}
                    this.moveTurn(uni)
                    if (uni!=undefined && uni.owner!="Système"){this.testDéposeRessources(uni)}
                    if (uni!=undefined && uni.owner!="Système" && uni.name=="Messager"){this.testMessager(uni)}
                    if (uni!=undefined && uni.owner!="Système" && uni.name=="Caravane de commerce"){this.testCaravane(uni)}

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
        switch (uni.strategy){
            case "agression":
            for (var z in this.map.terrain){
                let zz = this.map.terrain[z]
                if (uni.canGo(zz)==false || (this.board[z] != undefined && this.board[z].owner == owner)) { rules.push("X") }
                else if (zz == "montagne") { rules.push(2) }
                else { rules.push(1) }
            }
            break

            case "modere":
                for (var z in this.map.terrain){
                    let zz = this.map.terrain[z]
                    if (uni.canGo(zz)==false || (this.board[z] != undefined && this.board[z].owner == owner) ||(this.board[z]!=undefined && this.board[z].diplomatic==true)) { rules.push("X") }
                    else if (zz == "montagne" || (this.board[z]!=undefined)) { rules.push(3) }
                    else { rules.push(1) }
                }
            break

            default:
                for (var z in this.map.terrain){
                    let zz = this.map.terrain[z]
                    if (uni.canGo(zz)==false || (this.board[z] != undefined||(this.board[z]!=undefined && this.board[z].diplomatic==true))) { rules.push("X") }
                    else if (zz == "montagne") { rules.push(2) }
                    else { rules.push(1) }
                }

            break


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

//Effectue le tour d'une mine: Génère des ressources pour les mineurs qui sont dedans
tourMine(unite){
    var joueur = this.players[unite.owner]
    if (joueur==undefined||unite.mineral==undefined){return false}
    for (var z of unite.workers){
        z[unite.mineral]+= Math.round(Math.random())+1
        if (z.copper>z.maxCopper){z.copper=z.maxCopper}
        if (z.tin>z.maxTin){z.tin=z.maxTin}
    }
}

unbuild(pos,idJoueur,socket){//Détruit un bâtiment
    var pos = parseInt(pos)
    if (pos==undefined || idJoueur==undefined){return false}
    var joueur = this.players[idJoueur]
    var bat = this.board[pos]
    if (joueur==undefined 
        || bat==undefined 
        || bat.owner!=joueur.id 
        || bat.type!="building"
        || bat.name=="Hôtel de ville"
        ||this.canOrder(joueur.id,pos)==false){return false}

    delete this.board[pos]
    delete joueur.units[pos]
    socket.emit("destructionBâtiment",pos)




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
    
    
    
    var assignedBuilder = undefined
    
    for (var z of Object.keys(joueur.units)){
        if (joueur.units[z].name=="Ouvrier" && joueur.units[z].currentBuilding==undefined){
            assignedBuilder=joueur.units[z]
        }
    }
    
    if (this.canOrder(joueur.idJoueur,pos)==false){return false}
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

addToChantier(départ,arrivée,idJoueur){
    if (this.board[départ]==undefined ||this.board[départ].name!="Ouvrier" || this.board[arrivée]==undefined ||this.board[arrivée].name!="Chantier" || this.board[départ].currentBuilding!=undefined || this.board[départ].owner!=idJoueur || this.board[arrivée].owner!=idJoueur){return false}
    this.board[départ].currentBuilding=arrivée
    return true
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
            if (z.gold==undefined || joueur.gold>=z.gold){
                if (evo=="Disciple d'Athéna"){evo="discipleath"}
                var newUni = new (eval(evo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")))(uniPos,joueur)
                newUni.origin = [{"nom":this.board[uniPos].name }]
                delete this.board[uniPos] 
                delete joueur.units[uniPos]
                if (this.addUnit(newUni,uniPos,joueur)){
                    if (z.gold!=undefined){joueur.gold-=z.gold}
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
if (rand<0.03){nbLoups=1}
if (rand>0.99){nbLoups=2}

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
    var or=0;var bois=0;var pierre=0;var cuivre=0;var etain = 0
    var joueur = this.players[idJoueur]; if (joueur==undefined){return false}
    or = joueur.gold;
    for (var z of Object.keys(joueur.units)){
        let uni = joueur.units[z]
        if (uni.name=="Hôtel de ville" || uni.name=="Entrepôt"){
            if (uni.wood!=undefined){bois+=uni.wood}
            if (uni.stone!=undefined){pierre+=uni.stone}
            if (uni.copper!=undefined){cuivre+=uni.copper}
            if (uni.tin!=undefined){etain+=uni.tin}
    }
}
return {"or":or,"bois":bois,"pierre":pierre,"cuivre":cuivre,"étain":etain, "tourCourant":this.tourCourant,"toursMax":this.nbTours}

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


getUnitesMine(position,idJoueur){
    var min = this.board[position]; if (min==undefined || min.owner!=idJoueur){return false}
    if (min.name!="Mine"){return false}
    var retour = {"minerai":min.mineral,"unites":[]}
    for (var z of min.workers){
        if (retour.minerai=="copper"){
            retour.unites.push({"minerai":z.copper})
        }
        if (retour.minerai=="tin"){
            retour.unites.push({"minerai":z.tin})
        }
    }
    return retour
}



getRevenuChamp(position,idJoueur){
    var cham = this.board[position]; if (cham==undefined || cham.owner!=idJoueur){return false}
    if (cham.name!="Champ"){return false}
    var revenu = 0
    for (var z of cham.workers){revenu+=z.fieldRevenu}
    return revenu
}



canOrder(idJoueur,posDépart){//Prend un IDJOUEUR et une position et dit si le joueur en question peut donner un ordre direct à l'unité se trouvant à cette position, false sinon et undefined si on ne sait pas
    if (idJoueur==undefined || posDépart==undefined || this.players[idJoueur]==undefined){return undefined}
    var joueur = this.players[idJoueur]; if (joueur==undefined){return undefined}
    var comps = {}; var posStratège=undefined
    for (var z of Object.keys(joueur.units)){//Trouver les tours et le stratège
        if (this.board[z].name=="Stratege" || this.board[z].name=="Tour"){
            comps[z] = z
            if (this.board[z].name=="Stratege"){posStratège=z}
        }
    }
    if (posStratège==undefined){return undefined}

    for (var z of Object.keys(comps)){//Mise à jour des composantes
        for (var zz of Object.keys(comps)){
            if (distance(z,zz,this.map.height)<=this.board[z].vision){
                var compyahou = comps[zz]
                for (var zzz of Object.keys(comps)){
                    if (comps[zzz]==compyahou){
                        comps[zzz]=comps[z]
                    }
                }
            }
        }
            
        for (var z of Object.keys(comps)){
            if (comps[z]==comps[posStratège]){
                if (distance(posDépart,z,this.map.height)<=this.board[z].vision){
                    return true
                }
            }
        }
            

    }

    return false
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
    if (uni==undefined || uni.name!="Messager"){return}
    if (uni.targetUni==undefined|| uni.destMessage==undefined || this.board[uni.targetUni.position] == undefined){
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

    
    
    
sortirChamp(unite,position,idJoueur,index){//A CONTINUER: ADAPTER POUR SORTIR L4UNITE D'INDEX CORRESPONDANT
    if (unite==undefined || position==undefined||index==undefined){return false}
    var joueur = this.players[idJoueur];if (joueur==undefined){return false}
    var cham = this.board[position]
    if (cham.name!="Champ"&&cham.name!="Mine"){return false}
    if (cham.workers==undefined){return false}
    if (index>cham.workers.length || cham.workers[index].name!=unite){return false}
    
    var uni = cham.workers[index]
    for (var zz of casesAdjacentes(position,this.map.width,this.map.height)){
        if (this.board[zz]==undefined && uni.canGo(this.map.terrain[zz])){
            if (this.addUnit(uni,zz,joueur)){
                cham.workers.splice(index,1)
                uni.position=zz
                return {"position":zz,"newUnit":uni.name}
            }
        }
    }

    return false
}

getHDV(idJoueur){//Revoie les HDV et entrepôts du joueur concerné
    var joueur = this.players[idJoueur]
    if (joueur==undefined){return false}

    var retour = []
    for (var z of joueur.hdv){
        retour.push({"type":this.board[z].name,"position":this.board[z].position})
    }

    if (retour!=undefined && retour.length>0){return retour}


return false
}


addLetter(objetMail,contenu,joueur,cite,){
    if (objetMail==undefined || contenu==undefined || cite==undefined){return false}
    var destinataire = undefined
    for (var z of Object.keys(this.players)){if (this.players[z].cite!=undefined && this.players[z].cite==cite){destinataire = this.players[z]}}
    if (destinataire==undefined){return false}
    //Calcul de la distance pour le nombre de tours qu'il faudra
    var dist = 0
   
    var stratege1 = undefined
    var stratege2 = undefined
    for (var z of Object.keys(joueur.units)){
        if (joueur.units[z].name=="Stratege"){stratege1=joueur.units[z].position}
    }
    for (var z of Object.keys(destinataire.units)){
        if (destinataire.units[z].name=="Stratege"){stratege2=destinataire.units[z].position}
    }
 
    if (stratege1==undefined || stratege2==undefined){return false}
    var distanceHex = distance(stratege1,stratege2,this.map.height)
    dist = Math.floor(distanceHex/8)



   
    destinataire.letters.push({"titre":objetMail,"texte":contenu,"expéditeur":joueur.name,"tours":dist,"type":"diplomatique"})
    return true
}

//Gère les lettres du joueur: baisse le nombre de tours d'attente de 1 et lorsque le tour est à 0, envoie la lettre
handleLetters(socket,idJoueur){
var joueur = this.players[idJoueur]

var index = 0
var nbLettres = joueur.letters.length
while (index<nbLettres){
    var lettre = joueur.letters[index]
    if (lettre.tours==0){
        if (lettre.type=="diplomatique"){socket.emit("notification",{"titre":lettre.titre,"texte":lettre.texte});}
        else{socket.emit("notification",lettre);}
        joueur.letters.splice(index,1)
        nbLettres--
    }
    else{
        lettre.tours--
        index++
    }
}

}


addEspion(idJoueur,positionEspion){
    var joueur = this.players[idJoueur] ; if (joueur==undefined){return false}
    if (joueur.gold<25){return false}
    if (joueur.espions.includes(positionEspion)){return false}
    joueur.gold-=25
    joueur.espions.push(positionEspion)
    return true
}


changeStrat(idJoueur,position,newStrat){
    var uni = this.board[position]
    if (uni==undefined){return false}
    if (uni.owner!=idJoueur){return false}
    if (!["prudence","agression","modere"].includes(newStrat)){return}


    uni.strategy=newStrat
    return true
}


récoltePoisson(position){
    var uni = this.board[position]
    if (uni.name!="Pêcheur"){return}
    var random = Math.random()*1000
    var valPoisson = 0
    var revenu = 0
   
    if (random > 400) {
        return;
    } else if (random > 200) {
        valPoisson = 1;
        revenu=1
    } else if (random > 70) {
        valPoisson = 2;
        revenu=4
    } else if (random > 11) {
        valPoisson = 3;
        revenu=7
    } else {
        valPoisson = 4;
        revenu=40

    }
    


    uni.fish++
    uni.fishValue+=revenu
    this.actionsThisTurn.push({ "type": "ressource", "position": uni.position, "ressource": "poisson"+valPoisson })

    return


}


//newTrade ajoute une demande d'échange
newTrade(data,idJoueur){
    var joueur = this.players[idJoueur]
    if (joueur==undefined){return false}
    if (data.mesRessources==undefined || data.ville==undefined || data.ressourcesEnnemies==undefined || data.mesQuantites==undefined || data.quantitesEnnemies==undefined){return false}
    
    if (data.mesRessources=="or"){
        if (joueur.gold<data.mesQuantites){return false}
        joueur.gold-=parseInt(data.mesQuantites)
    }
    else{
    if (joueur.units[data.hdvStock]==undefined ||joueur.units[data.hdvStock][data.mesRessources]==undefined ||joueur.units[data.hdvStock][data.mesRessources]<data.mesQuantites){return false}
    joueur.units[data.hdvStock][data.mesRessources]-=parseInt(data.mesQuantites)
}
    
    for (var zk of Object.keys(this.players)){
        var z = this.players[zk]
        if (z.cite==data.ville){

            var dist = 0
   
            var stratege1 = undefined
            var stratege2 = undefined
            for (var zz of Object.keys(joueur.units)){
                if (joueur.units[zz].name=="Stratege"){stratege1=joueur.units[zz].position}
            }
            for (var zz of Object.keys(z.units)){
                if (z.units[zz].name=="Stratege"){stratege2=z.units[zz].position}
            }

            dist = Math.floor(distance(stratege1,stratege2,this.map.height)/10)
         


            var trade = {
                "envoyeur":joueur.id,
                "ressourcesEnvoyées":data.mesRessources,
                "quantitéEnvoyée":parseInt(data.mesQuantites),
                "stockEnvoyeur":data.hdvStock,
                "receveur": z.id,
                "ressourceDemandée":data.ressourcesEnnemies,
                "quantitéDemandée":parseInt(data.quantitesEnnemies),
                "idRequête":uuidv4()
            }
            this.trades[trade.idRequête]=trade
            z.letters.push({"titre":"Demande d'échange de "+joueur.name,"expéditeur":joueur.name,"tours":dist,"échange":trade,"type":"commerce"})
          
            return true
        }
        
    }
     return false   
    


}


waterTradePossible(pos1,pos2){
    var eauDépart = []
    var eauArrivée = []

for (var z of casesAdjacentes(pos1,this.map.width,this.map.height)){
    if (this.map.infos[z].type=="eau"){
        eauDépart.push(z)
    }
}
for (var z of casesAdjacentes(pos2,this.map.width,this.map.height)){
    if (this.map.infos[z].type=="eau"){
        eauArrivée.push(z)
    }
}

var rules = []

for (var z in this.map.terrain){
    if (this.map.terrain[z] == "eau") { rules.push(1) }
    else { rules.push("X") }
}



for (var dep of eauDépart){
    for (var arr of eauArrivée){
        var route = pathFind(dep,arr,this.map.height,this.map.width,rules)
        if (route!=false&&route!=undefined){return {"dist":route.length,"depart":dep}}   
    }
}


return false


}


groundTradePossible(pos1,pos2){
    var solDépart = []
    var solArrivée = []

for (var z of casesAdjacentes(pos1,this.map.width,this.map.height)){
    if (this.map.infos[z].type!="montagne" && this.map.infos[z].type!="eau"){
        solDépart.push(z)
    }
}
for (var z of casesAdjacentes(pos2,this.map.width,this.map.height)){
    if (this.map.infos[z].type!="montagne" && this.map.infos[z].type!="eau"){
        solArrivée.push(z)
    }
}

var rules = []

for (var z in this.map.terrain){
    if (this.map.infos[z].type=="montagne" | this.map.infos[z].type=="eau"){ rules.push("X") }
    else { rules.push(1) }
}


for (var dep of solDépart){
    for (var arr of solArrivée){
        var route = pathFind(dep,arr,this.map.height,this.map.width,rules)
        if (route!=false&&route!=undefined){return {"dist":route.length,"depart":dep}}   
    }
}


return false


}






créerCaravaneCommerce(position,idRequête){
    var trade = this.trades[idRequête]
    var receveur = this.players[trade.receveur]

    var uni = new caravaneCommerce(position,receveur)
    uni.currentTrade = trade
    uni.phase="aller"
    uni.objectif = trade.stockEnvoyeur
    uni[trade.ressourceDemandée]=trade.quantitéDemandée
    if (this.addUnit(uni,position,receveur)==false){return false}



    return true
    }



    //Teste si une caravane est arrivée à destination et, si oui, en renvoie une
    testCaravane(uni){
        if (uni==undefined || uni.name!="Caravane de commerce"){return false}

        if (this.board[uni.objectif]==undefined){ delete this.board[uni.position];delete this.players[uni.owner].units[uni.position]}

        var arrivé = false ;for (var z of casesAdjacentes(uni.position,this.map.width,this.map.height)){if (z==uni.objectif){arrivé=true}}

        if (arrivé==false){return false}
        delete this.board[uni.position]
        delete this.players[uni.owner].units[uni.position]
        var hdv = this.board[uni.objectif]
        var trade = uni.currentTrade
        if (trade==undefined||hdv==undefined){return false}
        if (uni.phase=="aller"){
            var envoyeur = this.players[trade.envoyeur]; if (envoyeur==undefined){return false}
            if (trade.ressourceDemandée=="or"){envoyeur.gold+=trade.quantitéDemandée}
            else{hdv[trade.ressourceDemandée] += uni[trade.ressourceDemandée]}
            var unix = new caravaneCommerce(uni.position,envoyeur)
            //POSITION N'EST PAS DEFINI A L AIDE
            unix.currentTrade = trade
            unix.phase="retour"
            unix.objectif = trade.stockReceveur
            unix[trade.ressourcesEnvoyées]=trade.quantitéEnvoyée
            
            if (this.addUnit(unix,unix.position,envoyeur)==false){return false}
        }
        
        else{
            var receveur = this.players[trade.receveur]; if (receveur==undefined){return false}
            if (trade.ressourcesEnvoyées=="or"){receveur.gold+=trade.quantitéEnvoyée}
            else{hdv[trade.ressourcesEnvoyées] += uni[trade.ressourcesEnvoyées]}
          
        }

        return true


    }

/*
var trade = {
    "envoyeur":joueur.idJoueur,
    "ressourcesEnvoyées":data.mesRessources,
    "quantitéEnvoyée":data.mesQuantites,
    "stockEnvoyeur":data.hdvStock,
    "receveur": z.idJoueur,
    "ressourceDemandée":data.ressourcesEnnemies,
    "quantitéDemandée":data.quantitesEnnemies,
    "idRequête":uuidv4()
}
*/


canAcceptTrade(idRequête,hdv){
    var trade = this.trades[idRequête]
    var hotel = this.board[hdv]
    if (trade==undefined || hotel==undefined){return false}
    if (hotel[trade.ressourceDemandée]==undefined || hotel[trade.ressourceDemandée]<trade.quantitéDemandée){return false}


    return true

}

refuseTrade(idJoueur,idRequête){
    let joueur = this.players[idJoueur]
    let trade = this.trades[idRequête]
    if (joueur==undefined ||trade==undefined){return false}
    let envoyeur = this.players[trade.envoyeur];if(envoyeur==undefined){return false}
    if (trade.ressourcesEnvoyées=="or"){envoyeur.gold+=trade.quantitéEnvoyée}
    else{
        var hdv = this.board[trade.stockEnvoyeur]
        if (hdv==undefined){return false}
        hdv[trade.ressourcesEnvoyées] +=trade.quantitéEnvoyée}
    delete this.trades[idRequête]

    return true
}

//Fonction qui essaye de faire accepter un échange et renvoie la position de la caravane si acceptation possible
accepteTrade(idJoueur,idRequête,hdv){
    var trade = this.trades[idRequête]
    trade["stockReceveur"]=hdv
    console.log(trade)
    if (trade==undefined || idJoueur==undefined ||idJoueur!=trade.receveur){return false}
    var receveur = this.players[idJoueur]
    var envoyeur = this.players[trade.envoyeur]
    if (envoyeur==undefined || receveur==undefined){return false}
    //var hdvOrdre ==  this.board[hdv]
    var hdvOrdre = hdv
    if (this.canAcceptTrade(trade.idRequête,hdvOrdre))


    var waterCheck = this.waterTradePossible(hdvOrdre,trade.stockEnvoyeur)
    var groundCheck = this.groundTradePossible(hdvOrdre,trade.stockEnvoyeur)
    console.log("départ "+hdvOrdre+" arrivée: "+trade.stockEnvoyeur)
    //if (waterCheck!=undefined && waterCheck!=false){}    
    console.log("ROUTE MARITIME TROUVEE: ")
    console.log(waterCheck)
    console.log("ROUTE TERRESTRE TROUVEE: ")
    console.log(groundCheck)

    

    if (((groundCheck==undefined||groundCheck==false) && waterCheck!=undefined && waterCheck!=false )||( waterCheck!=undefined && waterCheck!=false&&(waterCheck.dist<groundCheck.dist))){
        createTradeBoat(waterCheck.depart,trade.idRequête)

        return {"position":waterCheck.depart,"newUnit":"Navire de commerce"}
    }

    if (groundCheck){
        this.créerCaravaneCommerce(groundCheck.depart,trade.idRequête)
        if (trade.ressourceDemandée=="or"){receveur.gold-=trade.quantitéDemandée}
        else{ this.board[hdvOrdre][trade.ressourceDemandée] -=trade.quantitéDemandée}

       
        return {"position":groundCheck.depart,"newUnit":"Caravane de commerce"}
    }
    
    return false



    //return {"position":zz,"newUnit":uni.name}

}



}
module.exports = { game };

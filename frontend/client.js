// ajoute la méthode qui supprime un prefix au String
String.prototype.supprimerPrefixId = function (prefix) {
    return this.startsWith(prefix) ? this.slice(prefix.length) : this.toString();
}

// dico des chemins de chaque unité du jeu
let dicoPathUnite = {};
//-------------------Fonction qui déplace vue damier selon boutons/touches-----------------


/**
 * créer les événement pour se déplacer sur la carte 
 * @param {string} id 
 */
function setupBoutonScroll(id) {
    let scrollAmount = 15;
    const plateaujeu = document.getElementById(id);

    let btnGaucheEnfonce = false;
    document.getElementById("btngauche").addEventListener("mousedown", function () {
        btnGaucheEnfonce = true;
        scrollEnfonce();
    });
    document.getElementById("btngauche").addEventListener("mouseup", function () {
        btnGaucheEnfonce = false;
    });

    let btnDroitEnfonce = false;
    document.getElementById("btndroite").addEventListener("mousedown", function () {
        btnDroitEnfonce = true;
        scrollEnfonce();
    });
    document.getElementById("btndroite").addEventListener("mouseup", function () {
        btnDroitEnfonce = false;
    });

    let btnHautEnfonce = false;
    document.getElementById("btnhaut").addEventListener("mousedown", function () {
        btnHautEnfonce = true;
        scrollEnfonce();
    });
    document.getElementById("btnhaut").addEventListener("mouseup", function () {
        btnHautEnfonce = false;
    });

    let btnBasEnfonce = false;
    document.getElementById("btnbas").addEventListener("mousedown", function () {
        btnBasEnfonce = true;
        scrollEnfonce();
    });
    document.getElementById("btnbas").addEventListener("mouseup", function () {
        btnBasEnfonce = false;
    });

    function scrollEnfonce() {
        if (btnHautEnfonce) {
            d3.select("#" + id).property("scrollTop", d3.select("#" + id).property("scrollTop") - scrollAmount);
            setTimeout(scrollEnfonce, 100);
        }
        if (btnBasEnfonce) {
            d3.select("#" + id).property("scrollTop", d3.select("#" + id).property("scrollTop") + scrollAmount);
            setTimeout(scrollEnfonce, 100);
        }
        if (btnGaucheEnfonce) {
            d3.select("#" + id).property("scrollLeft", d3.select("#" + id).property("scrollLeft") - scrollAmount);
            setTimeout(scrollEnfonce, 100);
        }
        if (btnDroitEnfonce) {
            d3.select("#" + id).property("scrollLeft", d3.select("#" + id).property("scrollLeft") + scrollAmount);
            setTimeout(scrollEnfonce, 100);
        }
    }

    document.addEventListener("keydown", function (e) {
        switch (e.key) {
            case "z":
                btnHautEnfonce = true;
                scrollEnfonce();
                break;
            case "s":
                btnBasEnfonce = true;
                scrollEnfonce();
                break;
            case "q":
                btnGaucheEnfonce = true;
                scrollEnfonce();
                break;
            case "d":
                btnDroitEnfonce = true;
                scrollEnfonce();
                break;
        }
    });

    document.addEventListener("keyup", function (e) {
        switch (e.key) {
            case "z":
                btnHautEnfonce = false;
                break;
            case "s":
                btnBasEnfonce = false;
                break;
            case "q":
                btnGaucheEnfonce = false;
                break;
            case "d":
                btnDroitEnfonce = false;
                break;
        }
    });
}


//------------------------------MAIN---------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {



    // attributs global
    let cite;
    let map;

    // attributs du joueur
    let idPartie;
    let nomPartie;
    let idJoueur;
    let maCite;
    let pseudo;

    const beotie = document.getElementById("beotie");
    const attique = document.getElementById("attique");
    const argolide = document.getElementById("argolide");

    const pseudoInput = document.getElementById("usernameInput")

    socket.emit("getListeParties", "")
    
    socket.on("getListeParties", data => {
        afficherListeParties(data);

    });

    /**
     * refraichie la liste des parties disponibles
     */
    function refreshGame() {
        console.log("je rafraichi")
        if (idPartie == undefined) {
            socket.emit("getListeParties", "")
            setTimeout(refreshGame, 1000);;
        }

    }
    refreshGame();



    // créer une partie
    document.getElementById("creerPartie").addEventListener("click", () => {
        const nbJoueurs = document.getElementById("nbJoueurs");
        const nbTours = document.getElementById("nbTours");
        socket.emit("creerPartie", { "nbJoueurs": parseInt(nbJoueurs.value), "nbTours": parseInt(nbTours.value) });

        document.querySelector('.accueil').style.display = 'none';
        document.querySelector('.rejoindrePartie').style.display = 'block';

    });

    // rejoindre le lobby
    document.getElementById("rejoindrePartie").addEventListener("click", () => {
        pseudo = pseudoInput.value;
        socket.emit("rejoindrePartie", { "idPartie": idPartie, "idJoueur": idJoueur, "maCite": maCite, nom: pseudoInput.value });
    });


    // séléction des citées dans le lobby d'une partie
    beotie.addEventListener("click", () => {
        maCite = "beotie";
        fill(cite.beotie, "red", "prev");
        fill(cite.attique, "url(#" + map.terrain[cite.attique] + "-pattern", "prev");
        fill(cite.argolide, "url(#" + map.terrain[cite.argolide] + "-pattern", "prev");
    });

    attique.addEventListener("click", () => {
        maCite = "attique"
        fill(cite.attique, "red", "prev");
        fill(cite.beotie, "url(#" + map.terrain[cite.beotie] + "-pattern", "prev");
        fill(cite.argolide, "url(#" + map.terrain[cite.argolide] + "-pattern", "prev");
    });

    argolide.addEventListener("click", () => {
        maCite = "argolide"
        fill(cite.argolide, "red", "prev");
        fill(cite.beotie, "url(#" + map.terrain[cite.beotie] + "-pattern", "prev");
        fill(cite.attique, "url(#" + map.terrain[cite.attique] + "-pattern", "prev");
    });


    // fini le tour du joueur
    document.getElementById("finTour").addEventListener("click", () => {
        socket.emit("finTour");
        socket.emit("ressources");
    });


    // quitter la partie
    document.getElementById("quitter1").addEventListener("click", () => {
        socket.emit("quitterPartie");
        document.getElementById('rejoindrePartie').style.display = 'none';
        document.getElementById('accueil').style.display = 'flex';
    });

    document.getElementById("quitter2").addEventListener("click", () => {
        socket.emit("quitterPartie");
        document.getElementById('partie').style.display = 'none';
        document.getElementById('accueil').style.display = 'flex';
    });

    socket.on("finTour", data => {
        // true si tout le monde à fini false sinon

        let index = 0;

        function jouerAnimationSuivante() {
            if (index < data.length) {
                const mouvement = data[index];
                console.log("data.length: "+data.length+" index: "+index)
                switch (data[index].type) {

                    case "mouvement":
                        if (document.getElementById("uni" + mouvement.départ)==undefined){
                            index++;
                            jouerAnimationSuivante();
                        }
                        else{
                            console.log("anim")
                            deplacerUnitesAnim(mouvement.départ, mouvement.arrivée, () => {
                                index++;
                                jouerAnimationSuivante();
                            });
                        }
                        break;
                    case "mort":
                        if (document.getElementById("uni" + mouvement.position)==undefined){
                            index++;
                            jouerAnimationSuivante();
                        }
                        else{
                        tuerUniteAnim(mouvement.position)
                        index++;
                        jouerAnimationSuivante();
                        }
                        break


                        case "ressource":
                            if (document.getElementById("uni" + mouvement.position)==undefined){
                                index++;
                                jouerAnimationSuivante();
                            }
                            else{
                        recolteAnim(mouvement.ressource,mouvement.position)
                        index++;
                        jouerAnimationSuivante();
                            }
                    break

                        case "combat":
                            if (document.getElementById("uni" + mouvement.départ)==undefined || document.getElementById("uni" + mouvement.arrivée)==undefined){
                                index++;
                                jouerAnimationSuivante();
                            }
                            else{
                        attaqueAnim(mouvement.départ,mouvement.arrivée,mouvement.dégâts)
                        index++;
                        jouerAnimationSuivante();
                            }
                    break


                    default:
                        index++;
                        jouerAnimationSuivante();
                }

            } else {
                socket.emit("demandeDamier", idJoueur);
            }
        }
        if(data){
            d3.select("#finTourData").selectAll("*").remove();
            d3.select(".bouton1").selectAll("p").remove();

            d3.select("#vueBatiments").style("display","flex");
            d3.select("#statsUnite").style("display","flex");
            d3.select("#finTour").style("display","block");
            jouerAnimationSuivante();
        }else{
            d3.select(".bouton1").selectAll("p").remove();
            d3.select(".bouton1").append("p").text("En attente des autres joueurs");
            //d3.select("#vueBatiments").style("display","none");
            //d3.select("#statsUnite").style("display","block");
            d3.select("#finTour").style("display","none");
        }

        

    });

    socket.on("ressources", data => {

        const ressources =
        `<p>Or: ${data.or}</p>
        <p>Cuivre: ${data.cuivre}</p>
        <p>Bois: ${data.bois}</p>
        <p>Pierre: ${data.pierre}</p>`;

    document.querySelector('.ressources').innerHTML = ressources;

    });

    socket.on("lobbyPartie", (data) => {
        //{"terrain":la map,"width":int,"height":int,"positionsCites":{"béotie":215,"attique":1072,"argolide":297},"idPartie":int,"idJoueur":int}


        document.querySelector('.accueil').style.display = 'none';
        document.querySelector('.rejoindrePartie').style.display = 'block';


        créerDamier(data.map.height, data.map.width, 32, "jeuprev", "prev");
        appelsAjoutTextures("jeuprev")
        actualiserDamier(data.map.width, data.map.height, data.map.terrain, "prev");

        cite = data.positionCites;
        map = data.map;
        idPartie = data.idPartie;
        nomPartie = data.nom
        idJoueur = data.idJoueur;

        setupBoutonScroll("damierPrev");
        afficherNomPartie(nomPartie);
    });

    socket.on("erreurRejoindreLobby", () => {
        console.log("peut pas rejoindre aaa")
    });

    socket.on("rejoindrePartie", data => {
        if (data) {
            document.getElementById("droiteAll").innerHTML = "";
            d3.select("#droiteAll").append("div").text("Connecté en tant que " + pseudo);

            switch (maCite) {
                case "beotie":
                    fill(cite.beotie, "green", "prev");
                    break;
                default:
                    fill(cite[maCite], "green", "prev");
            }
        }
    });



    socket.on("commencerPartie", data => {
        document.querySelector('.rejoindrePartie').innerHTML = ""
        document.querySelector('.rejoindrePartie').style.display = 'none';
        document.querySelector('.partie').style.display = 'block';

        socket.emit("demandeBâtiments");
        socket.emit("demandeDamier", idJoueur);
        socket.emit('ressources');


        
    })

    //----------------Pour test, faudra faire ça mieux plus tard-------------------
    /*socket.on("finTour",data=>{
        if (data){socket.emit("demandeDamier", idJoueur)
        }
    })*/



    // ajoute un chemin dans le dico des déplacements
    socket.on("mouvement", data => {
        dicoPathUnite[data[0]] = data
    });

    // termine une partie 
    socket.on("PARTIEFINIE", data => {
        console.log(data);
        let vueFin = d3.select("#vueFin");
        vueFin.style("display", (vueFin.style("display") == "none" ? "block" : "none"));

        vueFin.html("");
        if (Array.isArray(data)) {
            vueFin.append("p").text("Les cités gagnantes sont :");
            data.forEach(gagnant => {vueFin.append("p").text(gagnant.cite);});} 
        else {
            vueFin.append("p").text(`La cité gagnante est : ${data.cite}`);}
    });


    //-----------------------------------------------------------------------
    // demande le damier
    socket.on("demandeDamier", data => {
        // data {board,height,infos,terrain,width}

        terrain = data.terrain
        board = terrain.board
        créerDamier(data.height, data.width, 32, "jeu", "h") 
        actualiserDamier(data.width, data.height, data.terrain, "h") 
        appelsAjoutTextures("jeu");
        setupBoutonScroll("damierjeu");
        ajouterUnites(data.board, "jeu");

        // document.getElementById("recolteButton").addEventListener("click", function() {
        //     attaqueAnim(185, 215, "-9");
        // });

        map.infos=data.infos
        map.terrain=data.terrain

        // déplacement des unités
        let unites = document.getElementsByClassName("unite");
        let hexagones = document.getElementsByClassName("hexagones");
        let batiments = document.getElementsByClassName("batiments");

        d3.selectAll(".batTemp").remove();


        let vueInfoHdv = d3.select("#vueInfoHdv");

        let uniteSelectionnee = "";
        let hexagoneSelectionnee = "";

        let batimentSelectionne = "";


        Array.from(hexagones).forEach(element => {
            element.addEventListener("mouseover", (event) => {
                d3.select("#uniteTemp").remove();

                if (uniteSelectionnee && data.board[uniteSelectionnee].movement > 0) {
                    hexagoneSelectionnee = event.target.id.supprimerPrefixId("h");

                    let bbox = element.getBBox();

                    // ajoute la prévisualisation, si une unité est séléctionnée
                    d3.select("#jeu")
                        .append("image")
                        .attr("id", "uniteTemp")
                        .attr("xlink:href", d3.select("#uni" + uniteSelectionnee).attr("href"))
                        .attr("x", `${bbox.x - 10}`)
                        .attr("y", `${bbox.y - 15}`)
                        .attr("width", "70")
                        .attr("height", "80")
                        .style("opacity", 0.4)


                    document.getElementById("uniteTemp").addEventListener("click", () => {
                        if (uniteSelectionnee) {
                            // bouge l'unité
                            socket.emit("mouvement", { départ: uniteSelectionnee, arrivée: hexagoneSelectionnee });
                            uniteSelectionnee = "";
                            hexagoneSelectionnee = "";
                            d3.select("#uniteTemp").remove();
                        }
                    });


                }
            });

            element.addEventListener("click", (event) => {
                hexagoneSelectionnee = event.target.id.supprimerPrefixId("h");

                if (uniteSelectionnee && hexagoneSelectionnee) {
                    socket.emit("mouvement", { départ: uniteSelectionnee, arrivée: hexagoneSelectionnee });
                    uniteSelectionnee = "";
                    hexagoneSelectionnee = "";

                }else if (batimentSelectionne){
                    console.log(batimentSelectionne,hexagoneSelectionnee);
                    socket.emit("construireBâtiment",{nomBat:batimentSelectionne,position:hexagoneSelectionnee});
                    batimentSelectionne="";
                    hexagoneSelectionnee="";
                }
            });
        });


        Array.from(batiments).forEach(element => {
            // permet de placer un batiment
            element.addEventListener("click", (event) => {
                batimentSelectionne = event.target.id;
            });
        });

        Array.from(unites).forEach(element => {
            element.addEventListener("mouseover", (event) => {
                d3.select("#uniteTemp").remove();

                if (uniteSelectionnee != event.target.id.supprimerPrefixId("uni") && !event.target.id.startsWith("uniteTemp")) {
                    hexagoneSelectionnee = event.target.id.supprimerPrefixId("uni");
                }

                let path = dicoPathUnite[event.target.id.supprimerPrefixId("uni")];
                let pathBoard = data.board[event.target.id.supprimerPrefixId("uni")];

                pathBoard = pathBoard.path ? pathBoard.path : "";
                path = path ? path :  pathBoard;

                // ajouter un chemin en surbrillance
                if (path && data.board[event.target.id.supprimerPrefixId("uni")].type != "building") {

                    d3.select("#h" + event.target.id.supprimerPrefixId("uni")).style("filter", "brightness(1.2) sepia(0.5) saturate(5) opacity(0.5)");

                    for (let i = 0; i < path.length; ++i) {
                        d3.select("#h" + path[i]).style("filter", "brightness(1.2) sepia(0.5) saturate(5) opacity(0.5)");
                        }
                    
                }

            });

            element.addEventListener("mouseleave", (event) => {
                let path = dicoPathUnite[event.target.id.supprimerPrefixId("uni")];
                path = path ? path : data.board[event.target.id.supprimerPrefixId("uni")].path;

                // supprimer le path en surbrillance

                if (path ) {

                    d3.select("#h" + event.target.id.supprimerPrefixId("uni")).style("filter", null);

                    for (let i = 0; i < path.length; ++i) {
                        d3.select("#h" + path[i]).style("filter", null);
                        if (map.terrain[path[i]][0]=='?'){
                            d3.select("#h"+path[i]).style("filter", "brightness(0.3")
                        }
                    }
                }
            });
            element.addEventListener("click", (event) => {

                if (data.board[event.target.id.supprimerPrefixId("uni")].name == "Hôtel de ville" && !uniteSelectionnee) {
                    vueInfoHdv.style("display", (vueInfoHdv.style("display") == "none" ? "block" : "none"));
                    // vueInfoHdv variable D3

                }else if(data.board[event.target.id.supprimerPrefixId("uni")].name == "Forge" && uniteSelectionnee){
                    // l'enrôlement
                    hexagoneSelectionnee=event.target.id.supprimerPrefixId("uni");
                    socket.emit("mouvement",{départ:uniteSelectionnee,arrivée:hexagoneSelectionnee});
                    
                }else if(uniteSelectionnee && uniteSelectionnee==event.target.id.supprimerPrefixId("uni")){
                    uniteSelectionnee="";
                }else if(uniteSelectionnee && data.board[event.target.id.supprimerPrefixId("uni")].owner !== data.board[uniteSelectionnee].owner){
                    hexagoneSelectionnee=event.target.id.supprimerPrefixId("uni");
                    socket.emit("mouvement",{départ:uniteSelectionnee,arrivée:hexagoneSelectionnee});

                }else if(uniteSelectionnee){
                    uniteSelectionnee=event.target.id.supprimerPrefixId("uni");
                    //socket.emit("mouvement",{départ:uniteSelectionnee,arrivée:hexagoneSelectionnee});
                } else if (data.board[event.target.id.supprimerPrefixId("uni")].movement > 0) {
                    uniteSelectionnee = event.target.id.supprimerPrefixId("uni");

                }

            });
        });
    });


    // batiments
    socket.on("demandeBâtiments", data => {

        d3.select("#vueBatiments").selectAll("img").remove();
        d3.select("#vueBatiments").append("img").attr("src", "/img/autre/"+"croix.png").attr("width", "100").attr("height", "100").attr("id","croix").attr("class", "batiments");

        //console.log(data);

        data.forEach(bat => {
            d3.select("#vueBatiments").append("img").attr("src", "/img/personnages/rouge/"+(bat.url).toLowerCase()+".png").attr("width", "100").attr("height", "100").attr("id",bat.nom).attr("class", "batiments");
        });
    });

    socket.on("construireBâtiment",data=>{

        console.log(data);
        //nom position
        let bbox = document.getElementById("h"+data.position).getBBox();
        let pos = document.getElementById("h"+data.position);

        d3.select("#jeu")
        .append("image")
        .attr("class", "batTemp")
        .attr("xlink:href","/img/personnages/rouge/"+data.nom.toLowerCase()+".png")
        .attr("x", `${bbox.x - 10}`)
        .attr("y", `${bbox.y - 15}`)
        .attr("width", "70")
        .attr("height", "80")
        .style("opacity", 0.4)
        .on("mouseover", () => {
            d3.select(pos)
                .attr("stroke", "orange")
                .style("stroke-width", 2);
        })
        .on("mouseout", () => {
            d3.select(pos)
                .attr("stroke", "transparent")
                .style("stroke-width", 0)
            });
    });


});




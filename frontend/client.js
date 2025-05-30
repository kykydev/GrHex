// ajoute la méthode qui supprime un prefix au String
String.prototype.supprimerPrefixId = function (prefix) {
    return this.startsWith(prefix) ? this.slice(prefix.length) : this.toString();
}

// dico des chemins de chaque unité du jeu
let dicoPathUnite = {};

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
    let dieuSelectionne;

    let hdvSelectionne;
    let portSelectionne; 
    let entrepotSelectionne;

    const beotie = document.getElementById("beotie");
    const attique = document.getElementById("attique");
    const argolide = document.getElementById("argolide");

    const pseudoInput = document.getElementById("usernameInput");

    let localisationMines;

    socket.emit("getListeParties", "");
    socket.emit("askMaps","a");

    socket.on("getListeParties", data => {
        afficherListeParties(data);

    });

    /**
     * refraichie la liste des parties disponibles
     */
    function refreshGame() {
        //console.log("je rafraichi")
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
        let choisirMap = document.getElementById("choisirMap").value;


        if(!choisirMap){
            choisirMap="peloponnese.json";
        }

        console.log("map",choisirMap);
        socket.emit("creerPartie", { "nbJoueurs": parseInt(nbJoueurs.value), "nbTours": parseInt(nbTours.value),map: choisirMap});

        document.querySelector('.accueil').style.display = 'none';
        document.querySelector('.rejoindrePartie').style.display = 'block';
        d3.select("#vueEchange").style("display", "none");

    });

    // rejoindre le lobby
    document.getElementById("choixdialogue").addEventListener("click", () => {
        socket.emit("rejoindrePartie", { "idPartie": idPartie, "idJoueur": idJoueur, "maCite": maCite, "nom": pseudoInput.value,  "dieu" : dieuSelectionne });
        console.log("rejoindrePartie", { "idPartie": idPartie, "idJoueur": idJoueur, "maCite": maCite, "nom": pseudoInput.value, "dieu" : dieuSelectionne });
    });

    document.getElementById("envoyerPseudo").addEventListener("click", () => {
        pseudo = pseudoInput.value;
        d3.select("#vueChoixPseudo").style("display", "none");
        dialogue("Ici, chaque stratège vénère un dieu. Choisissez le vôtre pour la partie.", "pierris", "rouge");
    });

    document.querySelectorAll("#vueChoixDieu img").forEach(img => {
        img.addEventListener("click", () => {
            dieuSelectionne = img.id;
            d3.select("#vueChoixDieu").style("display", "none");
            dialogue(`Tu as fait le bon choix, quelle cité vas-tu diriger en mon honneur ?`, dieuSelectionne.toLowerCase(), "rouge");
            console.log(dieuSelectionne);
        });
    });

    // séléction des citées dans le lobby d'une partie
    beotie.addEventListener("click", () => {
        console.log("selection beoti");
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
        window.location.reload();
    });

    document.getElementById("quitter2").addEventListener("click", () => {
        window.location.reload();
    });

    //afficher vue stats unite
    let statsUnite = document.getElementById("statsUnite");

    let statsUniteBouton = document.getElementById("afficherVueUnite");
    statsUniteBouton.addEventListener("click", () => {
        statsUnite.style.display = (statsUnite.style.display == "none" ? "flex" : "none");
    });

    // afficher vue batiments
    let vueBatiments = document.getElementById("vueBatiments");
    let vueBatimentsBouton = document.getElementById("afficherVueBatiment");
    vueBatimentsBouton.addEventListener("click", () => {
        vueBatiments.style.display = (vueBatiments.style.display == "none" ? "flex" : "none");
    });

    // tutoriel (emit seulement si json pas encore reçu)
    let boutonTuto = d3.select("#afficherTutoriel");
    let booltuto = false;
    boutonTuto.on("click", () => {
        if(!booltuto){
        booltuto = true;
        socket.emit("demandeTuto");
        socket.on("demandeTuto", data => {
            tutorielJSON(data);
        });
        d3.select("#tuto").style("display", (d3.select("#tuto").style("display") == "flex" ? "none" : "flex"));
        }
        else{
            d3.select("#tuto").style("display", (d3.select("#tuto").style("display") == "flex" ? "none" : "flex"));
        }
    });

    // notifications

    let boutonNotif = d3.select("#afficherNotifs");
    let vueNotifications = d3.select("#vueNotifications");

    let notifDetail = d3.select("#vueNotificationMessage");

    let notificationsSauvegarder = {};
    let position = 0;

    boutonNotif.on("click", () => {
        position = 0;

        vueNotifications.style("display", (vueNotifications.style("display") == "flex" ? "none" : "flex"));

        if (vueNotifications.style("display") == "none") {
            notifDetail.selectAll("*").remove();
        }

        notifDetail.style("display", "none");
    });


    let notifications = document.getElementsByClassName("notifications");


    // changer de vue HDV (ouvrier ou diplomatie)

    let bouttonOuvrier = document.getElementById("bouttonOuvrier");
    let bouttonDiplomatie = document.getElementById("bouttonDiplomatie");
    let bouttonTransfert = document.getElementById("bouttonVueTransfert");
    

    bouttonOuvrier.addEventListener("click", (event) => {
        d3.select("#vueDiplomatie").style("display", "none");
        d3.select("#vueOuvrier").style("display", "flex");
        d3.select("#vueEchange").style("display", "none");
        d3.select("#vueEspionnage").style("display", "none");
        d3.select("#vueHdvChangerEntrepot").style("display","none");
    });

    bouttonDiplomatie.addEventListener("click", (event) => {
        d3.select("#vueOuvrier").style("display", "none");
        d3.select("#vueDiplomatie").style("display", "flex");
        d3.select("#vueEchange").style("display", "none");
        d3.select("#vueEspionnage").style("display", "none");
        d3.select("#vueHdvChangerEntrepot").style("display","none");
    });

    bouttonTransfert.addEventListener("click", (event) => {
        d3.select("#vueDiplomatie").style("display", "none");
        d3.select("#vueOuvrier").style("display", "none");
        d3.select("#vueEchange").style("display", "none");
        d3.select("#vueEspionnage").style("display", "none");
        d3.select("#vueHdvChangerEntrepot").style("display","flex");

    });


    // let envoyerMail = document.getElementById("envoyerMail");



    // document.getElementById("objetMail").addEventListener("click", (event) => {
    //     event.stopImmediatePropagation();
    // });

    // document.getElementById("contenuMail").addEventListener("click", (event) => {
    //     event.stopImmediatePropagation();
    // });


    // vue Espionnage

    let selectionPositionEspion = false;
    let hdvSelectionnePourEspion;


    // d3.select("#bouttonEspionnage")
    //     .on("click", () => {
    //         d3.select("#vueOuvrier").style("display", "none");
    //         d3.select("#vueDiplomatie").style("display", "none");
    //         d3.select("#vueEchange").style("display", "none");
    //         d3.select("#vueEspionnage").style("display", "block");
    //     });

    d3.select("#bouttonRecruter")
        .on("click", () => {
            d3.select("#vueInfoHdv").style("display", "none");
            selectionPositionEspion = true;

            // d3.select("#placeUnEspionStp").text("Places un Espion sur le damier");
            
            dialogue("Placez un Espion sur le damier","espionne","rouge")
        });

    d3.select("#bouttonVueEchange")
        .on("click", () => {
            d3.select("#vueOuvrier").style("display", "none");
            d3.select("#vueDiplomatie").style("display", "none");
            d3.select("#vueEspionnage").style("display", "none");
            d3.select("#vueEchange").style("display", "flex");
        });

    let imgOuvrier = document.getElementById("imgOuvrier");
    imgOuvrier.addEventListener("click", () => {
        // console.log("recruterOuvrier");
        socket.emit('recruterOuvrier', hdvSelectionne);
    });

    
    let imgTroie = document.getElementById("imgTroie");
 

    imgTroie.addEventListener("click", () => {
 

        // console.log("recruterOuvrier");
 

        socket.emit('recruteChevalDeTroie', hdvSelectionne);
 

    });

    let bouttonEchange = document.getElementById("bouttonEchange");

    bouttonEchange.addEventListener("click", () => {
        let mesRessources = document.getElementById("mesRessources").value;

        let ville = document.querySelector("input[name='ville']:checked").value;

        let ressourcesEnnemies = document.getElementById("ressourcesEnnemies").value;


        let mesQuantites = document.getElementById("mesQuantites").value;
        let quantitesEnnemies = document.getElementById("quantitesEnnemies").value;


        let entrepot = document.querySelector("input[name='mesEntrepots']:checked").value;


        console.log({
            mesRessources: mesRessources,
            ville: ville,
            ressourcesEnnemies: ressourcesEnnemies,
            mesQuantites: mesQuantites,
            quantitesEnnemies: quantitesEnnemies,
            hdv: hdvSelectionne,
            hdvStock: entrepot
        });

        socket.emit("echangeRessources", {
            mesRessources: mesRessources,
            ville: ville,
            ressourcesEnnemies: ressourcesEnnemies,
            mesQuantites: mesQuantites,
            quantitesEnnemies: quantitesEnnemies,
            hdv: hdvSelectionne,
            hdvStock: entrepot
        });
    });


    let bouttonEnvoyerTransfert = document.getElementById("bouttonEnvoyerTransfert");

    bouttonEnvoyerTransfert.addEventListener("click",()=>{
        let ressourcesTransfert = document.getElementById("ressourcesTransfertHdv").value;
        let quantiteTransfert = document.getElementById("quantiteTransfertHdv").value;

        let entrepotDepart = document.querySelector("input[name='entrepotDepart']:checked").value;
        let entrepotArrive = document.querySelector("input[name='entrepotArrive']:checked").value;

        console.log({
            ressourcesTransfert: ressourcesTransfert,
            quantiteTransfert: quantiteTransfert,
            entrepotDepart: entrepotDepart,
            entrepotArrive: entrepotArrive
        });

        socket.emit("transfertRessources",{
            ressourcesTransfert: ressourcesTransfert,
            quantiteTransfert: quantiteTransfert,
            entrepotDepart: entrepotDepart,
            entrepotArrive: entrepotArrive,
            hdv:hdvSelectionne
        });
    });


    let boutonEnvoyerTransfertEntrepot = document.getElementById("boutonEnvoyerTransfertEntrepot");
    boutonEnvoyerTransfertEntrepot.addEventListener("click", () => {
        let ressourcesTransfert = document.getElementById("ressourcesTransfertEntrepot").value;
        let quantiteTransfert = document.getElementById("quantiteTransfertEntrepot").value;

        let entrepotDepart = entrepotSelectionne;
        let entrepotArrive = document.querySelector("input[name='entrepotArriveEntrepot']:checked").value;

        console.log({
            ressourcesTransfert: ressourcesTransfert,
            quantiteTransfert: quantiteTransfert,
            entrepotDepart: entrepotDepart,
            entrepotArrive: entrepotArrive
        });

        socket.emit("transfertRessources", {
            ressourcesTransfert: ressourcesTransfert,
            quantiteTransfert: quantiteTransfert,
            entrepotDepart: entrepotDepart,
            entrepotArrive: entrepotArrive,
        });
    });

    let boutonCreerBateau = document.getElementById("boutonCreerBateau");
    boutonCreerBateau.addEventListener("click",()=>{
        console.log("port",portSelectionne);
        socket.emit("créerBateau",portSelectionne);
    })

    socket.on("finTour", data => {
        //console.log(data);
        // true si tout le monde à fini false sinon

        let index = 0;

        function jouerAnimationSuivante() {
            if (index < data.length) {
                const mouvement = data[index];
                switch (data[index].type) {
                    case "mouvement":
                        if ((document.getElementById("uni" + mouvement.départ) == undefined) || (map.terrain[[mouvement.départ]][0] == '!')) {
                            index++;
                            jouerAnimationSuivante();
                        }
                        else {
                            deplacerUnitesAnim(mouvement.départ, mouvement.arrivée, () => {
                                index++;
                                jouerAnimationSuivante();
                            });
                        }
                        break;
                    case "mort":
                        if ((document.getElementById("uni" + mouvement.position) == undefined) || (map.terrain[[mouvement.position]][0] == '!')) {
                            index++;
                            jouerAnimationSuivante();
                        }
                        else {
                            tuerUniteAnim(mouvement.position, () => {
                                index++;
                                jouerAnimationSuivante();
                            })
                        }
                        break;


                    case "ressource":
                        if ((document.getElementById("uni" + mouvement.position) == undefined) || (map.terrain[[mouvement.position]][0] == '!')) {
                            index++;
                            jouerAnimationSuivante();
                        }
                        else {
                            recolteAnim(mouvement.ressource, mouvement.position)
                            index++;
                            jouerAnimationSuivante();
                        }
                        break;

                    case "combat":
                        if (document.getElementById("uni" + mouvement.départ) == undefined || document.getElementById("uni" + mouvement.arrivée) == undefined || (map.terrain[[mouvement.départ]][0] == '!')) {
                            index++;
                            jouerAnimationSuivante();
                        }
                        else {
                            attaqueAnim(mouvement.départ, mouvement.arrivée, mouvement.dégâts, () => {
                                index++;
                                jouerAnimationSuivante();
                            })
                        }
                        break;


                    default:
                        index++;
                        jouerAnimationSuivante();
                }

            } else {
                socket.emit("demandeDamier", idJoueur);
            }
        }
        if (data) {
            d3.select("#finTourData").selectAll("*").remove();
            d3.select(".txtfintour").selectAll("p").remove();

            d3.select("#vueBatiments").style("display", "flex");
            d3.select("#statsUnite").style("display", "flex");
            // d3.select("#finTour").style("display", "block");
            jouerAnimationSuivante();
        } else {
            d3.select(".txtfintour").selectAll("p").remove();
            d3.select(".txtfintour").append("p").text("En attente des autres joueurs");
            //d3.select("#vueBatiments").style("display","none");
            //d3.select("#statsUnite").style("display","block");
            // d3.select("#finTour").style("display", "none");
        }




    });

    socket.on("ressources", data => {

        const ressources =
            `<p>${data.or} <img src="/img/autre/or.png"/></p>
            <p>${data.bois} <img src="/img/autre/bois.png"/></p>
            <p>${data.pierre} <img src="/img/autre/pierre.png"/></p>
            <p>${data.cuivre} <img src="/img/autre/cuivre.png"/></p>
            <p>${data.étain} <img src="/img/autre/etain.png"/></p>
            <p>${data.tourCourant} / ${data.toursMax} <img src="/img/autre/sablier.png"/></p>
            <p><img src="/img/personnages/dieux/${data.dieu.toLowerCase()}.png"/></p>`

        document.querySelector('.ressources').innerHTML = ressources;

    });

    socket.on("lobbyPartie", (data) => {
        //{"terrain":la map,"width":int,"height":int,"positionsCites":{"béotie":215,"attique":1072,"argolide":297},"idPartie":int,"idJoueur":int}


        document.querySelector('.accueil').style.display = 'none';
        document.querySelector('.rejoindrePartie').style.display = 'block';


        créerDamier(data.map.height, data.map.width, 32, "jeuprev", "prev");
        appelsAjoutTextures("jeuprev")
        actualiserDamier(data.map.width, data.map.height, data.map.terrain, "prev");
        dialogue("Bienvenue dans le Péloponnèse ! Par quel nom devrions nous vous appeler?", "pierris", "rouge");

        cite = data.positionCites;
        map = data.map;
        idPartie = data.idPartie;
        nomPartie = data.nom
        idJoueur = data.idJoueur;
        socket.idJoueur = data.idJoueur;
        socket.idPartie = data.idPartie;

        setupBoutonScroll("damierPrev");
        afficherNomPartie(nomPartie);
    });

    socket.on("erreurRejoindreLobby", () => {
        console.log("peut pas rejoindre aaa")
    });

    socket.on("rejoindrePartie", data => {
        if (data) {
            // document.getElementById("whoami").innerHTML = "";
            // d3.select("#whoami").append("p").text("Connecté en tant que " + pseudo);

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
        document.querySelector('.rejoindrePartie').style.display = 'none';
        document.querySelector('.partie').style.display = 'block';
        document.getElementById("jeuprev").innerHTML = "";


        socket.emit("demandeBâtiments");
        socket.emit("demandeDamier", idJoueur);
        socket.emit('ressources');
        socket.emit("demandeMines");
        socket.emit("citesPrésentes","");
        socket.emit("messageDieu");


        dicoPathUnite = {};

    });

    socket.on("citesPrésentes",data=>{
        console.log(data);
    
        data.forEach((nom) => {

            if (maCite != nom) {

                d3.select("#selectionnerCitePourMail").append("label")
                    .text(nom.charAt(0).toUpperCase() + nom.slice(1))
                    .append("input")
                    .attr("type", "radio").attr("name", "choixCiteMail").attr("value", nom);


                d3.select("#selectionnerVille").append("label")
                    .text(nom.charAt(0).toUpperCase() + nom.slice(1))
                    .append("input")
                    .attr("type","radio").attr("name","ville").attr("value",nom).attr("id",nom);
            }
        });
    });

    //----------------Pour test, faudra faire ça mieux plus tard-------------------
    /*socket.on("finTour",data=>{
        if (data){socket.emit("demandeDamier", idJoueur)
        }
    })*/



    // ajoute un chemin dans le dico des déplacements
    socket.on("mouvement", data => {
        dicoPathUnite[data[0]] = data

        // afficher la data reçu 
        for (let i = 0; i < data.length; ++i) {
            if(!map.terrain[data[i]].startsWith("?"))
                d3.select("#h" + data[i]).style("filter", "brightness(1.2) sepia(0.5) saturate(5) opacity(0.5)");
        }

        // destination
        d3.select("#h" + data[data.length-1]).style("filter", "brightness(1.2) sepia(0.5) saturate(5) opacity(0.5)");

        let blinkCount = 1;
        let interval = setInterval(() => {

            if(blinkCount % 2 === 0){
                for (let i = 0; i < data.length; ++i) {
                    if(!map.terrain[data[i]].startsWith("?"))
                        d3.select("#h" + data[i]).style("filter",  "brightness(1.2) sepia(0.5) saturate(5) opacity(0.5)" );
                }
            }else{
                resetFiltreDamier(map.terrain,data);
            }
            blinkCount++;
            if (blinkCount >= 2) {
                clearInterval(interval);
            }
        }, 175);

    });

    // termine une partie 
    socket.on("PARTIEFINIE", data => {
        let msg = "MOUAHAHAHAHAH, la cité " + data.cite + " a écrasé la concurrence, j'en attendais pas moins de leur part!"
        dialogue(msg, "pierris pompidoris", "blanc");
    });

    socket.on("dialogue",data=>{dialogue
        dialogue(data.message, data.unite, data.couleur);
    })


    //-----------------------------------------------------------------------
    // demande le damier
    socket.on("demandeDamier", data => {
        // data {board,height,infos,terrain,width}

        terrain = data.terrain
        board = terrain.board
        créerDamier(data.height, data.width, 32, "jeu", "h");
        actualiserDamier(data.width, data.height, data.terrain, "h");
        appelsAjoutTextures("jeu");
        setupBoutonScroll("damierjeu");
        ajouterUnites(data.board, "jeu", data.width, data.height);

        const vueBatiments = document.getElementById('vueBatiments');
        const damierjeu = document.getElementById('damierjeu');
        const vueMine = document.getElementById("vueMine");
        const vueTour = document.getElementById("vueTour");
        const vuePortD = document.getElementById("vuePort");

        rendreDeplacable(vueBatiments, damierjeu);
        rendreDeplacable(statsUnite, damierjeu);
        rendreDeplacable(vueMine, damierjeu);
        rendreDeplacable(vueTour, damierjeu);
        rendreDeplacable(vuePortD,damierjeu);
        rendreDeplacable(document.getElementById("vueEntrepot"),damierjeu);

        // document.getElementById("recolteButton").addEventListener("click", function() {
        //     attaqueAnim(185, 215, "-9");
        // });

        map.infos = data.infos
        map.terrain = data.terrain

        // déplacement des unités
        let unites = document.getElementsByClassName("unite");
        let hexagones = document.getElementsByClassName("hexagones");
        let batiments = document.getElementsByClassName("batiments");

        d3.selectAll(".batTemp").remove();


        let vueInfoHdv = d3.select("#vueInfoHdv");
        let vueInfoForge = d3.select("#vueForge");
        let vueChamp = d3.select("#vueChamp");

        let vuePort = d3.select("#vuePort");

        // [vueInfoForge, vueInfoHdv, vueChamp].forEach(vue => rendreDeplacable(vue.node(), damierjeu));

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


                }else if (batimentSelectionne) {
                    // console.log(batimentSelectionne, hexagoneSelectionnee);

                    afficherUnites({
                        couleur:"rouge",
                        name:batimentSelectionne,
                        position: event.target.id.supprimerPrefixId("h"),
                        type:"building"}, 
                        "jeu",
                        0.5,
                        ()=>{
                            console.log("Construction du bâtiment:", { nomBat: batimentSelectionne, position: event.target.id.supprimerPrefixId("h") });
                            socket.emit("construireBâtiment", { nomBat: batimentSelectionne, position: event.target.id.supprimerPrefixId("h") });
                            batimentSelectionne = "";
                            hexagoneSelectionnee = "";
                        },
                        ()=>{
                            d3.select("#uni"+event.target.id.supprimerPrefixId("h")).remove();
                        }
                        
                    );
                }
            });
            element.addEventListener("click", (event) => {
                hexagoneSelectionnee = event.target.id.supprimerPrefixId("h");

                if (selectionPositionEspion && hdvSelectionnePourEspion) {

                    // console.log("espion", { hdv: hdvSelectionnePourEspion, positionEspion: event.target.id.supprimerPrefixId("h") });
                    socket.emit("nouveauEspion", { hdv: hdvSelectionnePourEspion, positionEspion: event.target.id.supprimerPrefixId("h") });
                    

                    afficherUnites({
                        couleur:"rouge",
                        name:"messager",
                        position: event.target.id.supprimerPrefixId("h")}
                    , "jeu",0.5);

                    d3.select("#placeUnEspionStp").text("");

                    selectionPositionEspion="";
                    

                } else if (uniteSelectionnee && hexagoneSelectionnee) {
                    socket.emit("mouvement", { départ: uniteSelectionnee, arrivée: hexagoneSelectionnee });
                    uniteSelectionnee = "";
                    hexagoneSelectionnee = "";

                } else if (batimentSelectionne) {
                    // console.log(batimentSelectionne, hexagoneSelectionnee);

                    socket.emit("construireBâtiment", { nomBat: batimentSelectionne, position: hexagoneSelectionnee });
                    batimentSelectionne = "";
                    hexagoneSelectionnee = "";
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
                path = path ? path : pathBoard;

                // ajouter un chemin en surbrillance
                if (path && data.board[event.target.id.supprimerPrefixId("uni")].type != "building") {

                    d3.select("#h" + event.target.id.supprimerPrefixId("uni")).style("filter", "brightness(1.2) sepia(0.5) saturate(5) opacity(0.5)");

                    for (let i = 0; i < path.length; ++i) {
                        if(!map.terrain[path[i]].startsWith("?"))
                            d3.select("#h" + path[i]).style("filter", "brightness(1.2) sepia(0.5) saturate(5) opacity(0.5)");
                    }

                    // destination
                    d3.select("#h" + path[path.length-1]).style("filter", "brightness(1.2) sepia(0.5) saturate(5) opacity(0.5)");

                }

            });

            element.addEventListener("mouseleave", (event) => {
                let path = dicoPathUnite[event.target.id.supprimerPrefixId("uni")];
                path = path ? path : data.board[event.target.id.supprimerPrefixId("uni")].path;

                // supprimer le path en surbrillance

                if (path) {

                    d3.select("#h" + event.target.id.supprimerPrefixId("uni")).style("filter", null);

                    resetFiltreDamier(map.terrain,path);

                    
                }
            });
            element.addEventListener("click", (event) => {

                 if (data.board[event.target.id.supprimerPrefixId("uni")].name == "Hôtel de ville" && !uniteSelectionnee) {

                    vueInfoHdv.style("display", (vueInfoHdv.style("display") == "none" ? "block" : "none"));

                    socket.emit("demandeHDV", "ze");


                    // pour ouvrier
                    hdvSelectionne = event.target.id.supprimerPrefixId("uni");

                    // vueInfoHdv variable D3


                    // socket mail 
                    envoyerMail.addEventListener("click", () => {
                        const cite = document.querySelector('input[name="choixCiteMail"]:checked');

                        let objetMail = document.getElementById("objetMail");
                        let contenuMail = document.getElementById("contenuMail");


                        // console.log("position hdv : " , event.target.id.supprimerPrefixId("uni"));

                        socket.emit("mail", { objet: objetMail.value, contenu: contenuMail.value, cite: cite.value, hdv: event.target.id.supprimerPrefixId("uni") });

                        objetMail.value="";
                        contenuMail.value="";

                    });

                    // socket espion
                    hdvSelectionnePourEspion = event.target.id.supprimerPrefixId("uni");
                    socket.emit("demandeEspions");



                }
                else if (batimentSelectionne == "croix") {
                    socket.emit("croix", event.target.id.supprimerPrefixId("uni"));
                    batimentSelectionne = ""
                }
                else if ((data.board[event.target.id.supprimerPrefixId("uni")].name == "Forge" && !uniteSelectionnee)) {
                    // l'enrôlement
                    // hexagoneSelectionnee = event.target.id.supprimerPrefixId("uni");
                    // socket.emit("mouvement", { départ: uniteSelectionnee, arrivée: hexagoneSelectionnee });
                    socket.emit("demandeUnitesForge", event.target.id.supprimerPrefixId("uni"));
                    vueInfoForge.style("display", (vueInfoForge.style("display") == "none" ? "block" : "none"));


                }else if((data.board[event.target.id.supprimerPrefixId("uni")].name == "Port" && !uniteSelectionnee)){
                    vuePort.style("display", (vuePort.style("display") == "none" ? "block" : "none"));

                    socket.emit("demandeBateaux",event.target.id.supprimerPrefixId("uni"));

                    portSelectionne = event.target.id.supprimerPrefixId("uni");

                }else if((data.board[event.target.id.supprimerPrefixId("uni")].name == "Entrepôt" && !uniteSelectionnee)){
                    let vueEntrepot = d3.select("#vueEntrepot");

                    vueEntrepot.style("display", (vueEntrepot.style("display") == "none" ? "block" : "none"));


                    entrepotSelectionne = event.target.id.supprimerPrefixId("uni");
                }
                else if (((data.board[event.target.id.supprimerPrefixId("uni")].name == "Hôtel de ville" || (data.board[event.target.id.supprimerPrefixId("uni")].name == "Entrepôt")) && uniteSelectionnee)) {
                    // le changement de base
                    socket.emit("mouvement", { départ: uniteSelectionnee, arrivée: hexagoneSelectionnee });


                }
                else if ((data.board[event.target.id.supprimerPrefixId("uni")].name == "Champ" || (data.board[event.target.id.supprimerPrefixId("uni")].name == "Mine")||data.board[event.target.id.supprimerPrefixId("uni")].name == "Tour"||data.board[event.target.id.supprimerPrefixId("uni")].name == "Tour d'archer") && uniteSelectionnee) {

                    hexagoneSelectionnee = event.target.id.supprimerPrefixId("uni");
                    socket.emit("mouvement", { départ: uniteSelectionnee, arrivée: hexagoneSelectionnee });
                    uniteSelectionnee=""


                }
                else if (data.board[event.target.id.supprimerPrefixId("uni")].name == "Chantier" && uniteSelectionnee) {

                    hexagoneSelectionnee = event.target.id.supprimerPrefixId("uni");
                    socket.emit("mouvement", { départ: uniteSelectionnee, arrivée: hexagoneSelectionnee });


                }
                else if (data.board[event.target.id.supprimerPrefixId("uni")].name == "Champ" && !uniteSelectionnee) {
                    socket.emit("demandeUnitesChamp", event.target.id.supprimerPrefixId("uni"));
                    // console.log("test vueChamp");
                    //A FAIRE VUE CHAMP

                    let vueChamp = d3.select("#vueChamp");
                    //console.log(vueChamp);
                    vueChamp.style("display", (vueChamp.style("display") == "none" ? "block" : "none"))
                        .attr("class", event.target.id.supprimerPrefixId("uni"));



                } else if (data.board[event.target.id.supprimerPrefixId("uni")].name == "Mine" && !uniteSelectionnee) {
                    socket.emit("demandeUnitesMine", event.target.id.supprimerPrefixId("uni"));

                    let vueMine = d3.select("#vueMine");
                    vueMine.style("display", (vueMine.style("display") == "none" ? "block" : "none"))
                        .attr("class", event.target.id.supprimerPrefixId("uni"));
                }
                else if (data.board[event.target.id.supprimerPrefixId("uni")].name == "Tour d'archer" && !uniteSelectionnee) {
                    socket.emit("demandeUnitesTour", event.target.id.supprimerPrefixId("uni"));
                    let vueTour = d3.select("#vueTour");
                    vueTour.style("display", (vueTour.style("display") == "none" ? "block" : "none"))
                        .attr("class", event.target.id.supprimerPrefixId("uni"));
                }
                else if (uniteSelectionnee && uniteSelectionnee == event.target.id.supprimerPrefixId("uni")) {
                    uniteSelectionnee = "";
                } else if (uniteSelectionnee && data.board[event.target.id.supprimerPrefixId("uni")].owner !== data.board[uniteSelectionnee].owner) {
                    hexagoneSelectionnee = event.target.id.supprimerPrefixId("uni");
                    socket.emit("mouvement", { départ: uniteSelectionnee, arrivée: hexagoneSelectionnee });

                } else if (uniteSelectionnee) {
                    uniteSelectionnee = event.target.id.supprimerPrefixId("uni");
                    batimentSelectionne="";

                    //socket.emit("mouvement",{départ:uniteSelectionnee,arrivée:hexagoneSelectionnee});
                } else if (data.board[event.target.id.supprimerPrefixId("uni")].movement > 0) {
                    uniteSelectionnee = event.target.id.supprimerPrefixId("uni");
                    batimentSelectionne="";

                }

            });
        });

    });


    // batiments
    socket.on("demandeBâtiments", data => {

        d3.select("#BatimentsContainerID").selectAll("img").remove();
        d3.select("#BatimentsContainerID").append("img").attr("src", "/img/autre/" + "croix.png").attr("width", "100").attr("height", "100").attr("id", "croix").attr("class", "batiments");

        // console.log(data);

        data.forEach(bat => {
            d3.select("#BatimentsContainerID").append("img").attr("src", "/img/personnages/rouge/" + (bat.url).toLowerCase() + ".png").attr("width", "100").attr("height", "100").attr("id", bat.nom).attr("class", "batiments")
                .on("mouseover", () => {
                    fstatsBatiment(bat);

                    if (bat.nom == "Mine") {
                        Object.keys(localisationMines).forEach((cle) => {

                            switch (localisationMines[cle]) {



                                case "tin":
                                    d3.select("#h" + cle).style("filter", " opacity(0.6) grayscale(100%) brightness(85%) contrast(110%) sepia(20%) saturate(80%)");
                                    break;

                                case "copper":
                                    d3.select("#h" + cle).style("filter", " opacity(0.6) sepia(100%) saturate(500%) hue-rotate(-20deg) brightness(90%) contrast(120%)");
                                    break;

                                case "argent":
                                    d3.select("#h" + cle).style("filter", "opacity(0.6) brightness(0.8) sepia(1) saturate(5) hue-rotate(90deg)");
                                    break;

                            }
                        });
                    }

                })
                .on("mouseleave", () => {
                    Object.keys(localisationMines).forEach((cle) => {


                        if (map.terrain[cle][0] == "!") {
                            switch (map.terrain[cle][1]) {
                                case "1":
                                    d3.select("#h" + cle).style("filter", "brightness(0.9) sepia(1) saturate(5) hue-rotate(30deg)");
                                    break
                                case "2":
                                    d3.select("#h" + cle).style("filter", "brightness(0.6) sepia(1) saturate(5) hue-rotate(30deg)");
                                    break
                                case "3":
                                    d3.select("#h" + cle).style("filter", "brightness(0.3) sepia(1) saturate(5) hue-rotate(30deg)");
                            }
                        } else if (map.terrain[cle][0] == "?") {
                            d3.select("#h" + cle).style("filter", "brightness(0.3")
                        } else {
                            d3.select("#h" + cle).style("filter", "");
                        }

                    });
                });
        });
    });

    socket.on("construireBâtiment", data => {

        //console.log(data);
        //nom position
        let bbox = document.getElementById("h" + data.position).getBBox();
        let pos = document.getElementById("h" + data.position);

        d3.select("#jeu")
            .append("image")
            .attr("class", "batTemp")
            .attr("xlink:href", "/img/personnages/rouge/" + data.nom.toLowerCase() + ".png")
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

    socket.on("destructionBâtiment", data => {
        d3.select("#uni" + data).remove();
    })

    socket.on("recruterOuvrier", data => {
        // console.log("recruter ouvrier : ",data);

        let bbox = document.getElementById("h" + data).getBBox();
        d3.select("#jeu")
            .append("image")
            .attr("class", "batTemp")
            .attr("xlink:href", "/img/personnages/rouge/" + "ouvrier" + ".png")
            .attr("x", `${bbox.x - 10}`)
            .attr("y", `${bbox.y - 15}`)
            .attr("width", "70")
            .attr("height", "80")
            .style("opacity", 0.4)
    });


    socket.on("désafficherUnité", position => {
        if (document.getElementById("uni" + position)) {
            d3.select("#uni" + position).remove();
        }
    });

    socket.on("spawnMessager", data => {
        console.log(data);
        afficherUnites(data, "jeu");
    })

    socket.on("demandeUnitesForge", data => {
        console.log(data);
        d3.select("#vueForge").selectAll("*:not(.hautvue):not(#bouttonChamp):not(#txthautvue)").remove();

        data.forEach(uni => {
            d3.select("#vueForge").append("img").attr("src", "/img/personnages/rouge/" + (uni.name).toLowerCase() + ".png").attr("width", "125").attr("height", "150").attr("id", "forge" + uni.name);
            d3.select("#vueForge").append("img").attr("src", "/img/autre/fleche.png").attr("width", "125").attr("height", "150");

            uni.evolutions.forEach((evo) => {
                const container = d3.select("#vueForge").append("div").style("position", "relative").style("display", "inline-block").style("text-align", "center").style("margin", "0 auto");
                container.append("img").attr("src", "/img/personnages/rouge/" + (evo.nom).toLowerCase() + ".png").attr("width", "125").attr("height", "150").attr("id", "forge" + evo.nom);
                container.append("p").html(`${evo.gold !== undefined ? evo.gold : 0} <img src="/img/autre/or.png" style="height: 50px; margin-right: 10px; vertical-align: middle;" />`).style("position", "absolute").style("top", "0").style("right", "0").style("margin", "0");

                container.select("img").on("click", () => {
                    socket.emit("evolution", { avant: uni.name, apres: evo.nom, position: uni.position });
                });
            });
            d3.select("#vueForge").append("br");
        });
    });

    socket.on("demandeUnitesChamp", data => {


        let vueChamp = d3.select("#vueChamp");

        vueChamp.selectAll("*:not(.hautvue):not(#bouttonChamp):not(#txthautvue)").remove();

        vueChamp.select(".txtchamp").remove();
        vueChamp.append("p").attr("class", "txtchamp").html(`Revenu du jour : ${data.revenu} <img src="/img/autre/or.png" style="height: 50px; margin-right: 10px; vertical-align: middle;" />`);

        data.unites.forEach((uni, index) => {
            vueChamp.append("img").attr("src", "/img/personnages/rouge/" + (uni).toLowerCase() + ".png")
                .attr("width", "125").attr("height", "150")
                .on("click", () => {
                    socket.emit("sortirChamp", { unite: uni, position: vueChamp.attr("class"), index: index });
                });
        });

    });

    socket.on("demandeUnitesMine", data => {
        let vueMine = d3.select("#vueMine");
        vueMine.selectAll("*:not(.hautvue):not(#bouttonMine):not(#txthautvue):not(#titreVueMine):not(#txthauvue)").remove();

        let titreMine = d3.select("#titreVueMine");

        switch (data.minerai) {
            case "copper":

                titreMine.append("p").text("Mine de cuivre");

                titreMine.append("img").attr("src", "/img/autre/cuivre.png")
                    .attr("width", "50").attr("height", "50");
                break;

            case "tin":
                titreMine.append("p").text("Mine d'étain");

                titreMine.append("img").attr("src", "/img/autre/etain.png")
                    .attr("width", "50").attr("height", "50");
                break;
        }

        data.unites.forEach((uni, index) => {
            vueMine.append("img").attr("src", "/img/personnages/rouge/mineur.png")
                .attr("width", "125").attr("height", "150")
                .on("click", () => {
                    socket.emit("sortirChamp", { unite: "Mineur", position: vueMine.attr("class"), index: index });
                });
            vueMine.append("p").text(uni.minerai);
        });

    });


    socket.on("demandeUnitesTour", data => {
        let vueMine = d3.select("#vueTour");
        vueMine.selectAll("*:not(.hautvue):not(#boutonTour):not(#txthautvue):not(#titreVueTour):not(#txthauvue)").remove();

        let titreMine = d3.select("#titreVueTour");

        data.unites.forEach((uni, index) => {
            vueMine.append("img").attr("src", "/img/personnages/"+data.couleur+"/archer.png")
                .attr("width", "125").attr("height", "150")
                .on("click", () => {
                    socket.emit("sortirChamp", { unite: "Archer", position: vueMine.attr("class"), index: index });
                });
            vueMine.append("p").text(uni.minerai);
        });

    });




    socket.on("evolution", data => {
        let bbox = document.getElementById("h" + data.position).getBBox();
        let pos = document.getElementById("h" + data.position);

        d3.select("#uni" + data.position).remove();

        d3.select("#jeu")
            .append("image")
            .attr("class", "batTemp")
            .attr("xlink:href", "/img/personnages/rouge/" + data.newUnit.toLowerCase() + ".png")
            .attr("x", `${bbox.x - 10}`)
            .attr("y", `${bbox.y - 15}`)
            .attr("width", "70")
            .attr("height", "80")
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

    let numeroNotif = 0;

    let aNotif = {}
    socket.on("mail",data=>{
        dialogue("J'y vais de ce pas !", "messager", "rouge");
    })

    socket.on("notification", (notif) => {
        console.log(notif);

        dialogue("Général, un message vous a été adressé !", "messager", "rouge");


            notificationsSauvegarder[(notif.échange ? notif.échange.idRequête : "notif"+numeroNotif)] = notif;
            d3.select("#vueNotifications").append("p").text(notif.titre).attr("id", (notif.échange ? notif.échange.idRequête : "notif"+numeroNotif)).attr("class", "notifications");

        
        ++numeroNotif;

        Array.from(notifications).forEach((element) => {

            if (!aNotif[element.id]) {

                element.addEventListener("click", (event) => {

                    let notifDetail = d3.select("#vueNotificationMessage");

                    notifDetail.selectAll("*").remove();

                    let notifTraite = notificationsSauvegarder[element.id];

                    if (notifDetail.style("display") == "none"){
                        notifDetail.append("p").text(notifTraite.texte);
                        if(notifTraite.type == "commerce"){

                            socket.emit("demandeHDV","");

                            let echange = notifTraite.échange;

                            switch (echange.ressourceDemandée) {
                                case "gold":
                                    echange.ressourceDemandée = "or";
                                    break;
                                case "wood":
                                    echange.ressourceDemandée = "bois";
                                    break;
                                case "stone":
                                    echange.ressourceDemandée = "pierre";
                                    break;
                                case "copper":
                                    echange.ressourceDemandée = "cuivre";
                                    break;
                                case "tin":
                                    echange.ressourceDemandée = "étain";
                                    break;
                            }

                            switch (echange.ressourcesEnvoyées) {
                                case "gold":
                                    echange.ressourcesEnvoyées = "or";
                                    break;
                                case "wood":
                                    echange.ressourcesEnvoyées = "bois";
                                    break;
                                case "stone":
                                    echange.ressourcesEnvoyées = "pierre";
                                    break;
                                case "copper":
                                    echange.ressourcesEnvoyées = "cuivre";
                                    break;
                                case "tin":
                                    echange.ressourcesEnvoyées = "étain";
                                    break;
                            }

                            notifDetail.append("p").text("ressource demandées : " + echange.quantitéDemandée +" "+echange.ressourceDemandée
                                +", ressource reçu : "+echange.quantitéEnvoyée +" " +echange.ressourcesEnvoyées);

                            notifDetail.append("button").text("accepter").on("click",()=>{
                                let entrepot = document.querySelector("input[name='entrepotsNotif']:checked").value;
                                socket.emit("retourTrade",{idRequête:echange.idRequête,accepte:true,hdv:entrepot});
                                // console.log("entrepot : "+entrepot);

                                dialogue("Échange accepté","messager","rouge");

                                notifDetail.style("display","none");
                                
                            });

                            notifDetail.append("button").text("refuser").on("click",()=>{
                                let entrepot = document.querySelector("input[name='entrepotsNotif']:checked").value;
                                socket.emit("retourTrade",{idRequête:echange.idRequête,accepte:false,hdv:entrepot});
                                // console.log("entrepot : "+entrepot);

                                dialogue("Échange refusé","messager","rouge");
                                notifDetail.style("display","none");
                            });
                        }

                        notifDetail.style("display", "block");
                        notifDetail.selectAll("*").style("display", "block");
                    } else {
                        notifDetail.style("display", "none");
                    }

                    ++position;
                });

                aNotif[element.id] = true;
            }
        });
    });


    socket.on("demandeEspions", (data) => {
        console.log("espions")
        d3.select("#nbEspions").text(data.nombre);

        d3.select("#positions").selectAll("*").remove();

        data.positions.forEach((p) => {
            d3.select("#positions").append("p").text(p);
        })
    });

    socket.on("demandeMines", (data) => {

        localisationMines = data;

    });

    socket.on("demandeHDV", (data) => { 

        let choisirEntrepot = d3.select("#choisirEntrepot");
        let notifDetail = d3.select("#vueNotificationMessage");
        
        let entrepotDepart = d3.select("#entrepotDepartSelect");
        let entrepotArrive = d3.select("#entrepotArriveSelect");
        
        let entrepotArriveEntrepot = d3.select("#entrepotArriveSelectEntrepot");


        choisirEntrepot.selectAll("*").remove();
        // notifDetail.selectAll("*").remove();


        entrepotArrive.selectAll("*:not(p)").remove();
        entrepotDepart.selectAll("*:not(p)").remove();
        entrepotArriveEntrepot.selectAll("*:not(p)").remove();
        


        data.forEach((entrepot) => {
            choisirEntrepot.append("label").attr("for", entrepot.position).text(entrepot.type+" : " +entrepot.position).append("input").attr("type", "radio").attr("name", "mesEntrepots")
                .attr("value", entrepot.position).attr("id", "e" + entrepot.position);


            notifDetail.append("label").attr("for", entrepot.position).text(entrepot.type + " : " + entrepot.position);
            notifDetail.append("input").attr("type", "radio").attr("name", "entrepotsNotif")
                .attr("value", entrepot.position).attr("id", "notif" + entrepot.position);
            notifDetail.append("br");

            entrepotArrive.append("label").attr("for", entrepot.position).text(entrepot.type+" : " +entrepot.position).append("input").attr("type", "radio")
            .attr("name", "entrepotArrive")
            .attr("value", entrepot.position).attr("id", "e" + entrepot.position);

            entrepotDepart.append("label").attr("for", entrepot.position).text(entrepot.type+" : " +entrepot.position).append("input").attr("type", "radio")
            .attr("name", "entrepotDepart")
            .attr("value", entrepot.position).attr("id", "e" + entrepot.position);

            entrepotArriveEntrepot.append("label").attr("for", entrepot.position).text(entrepot.type+" : " +entrepot.position).append("input").attr("type", "radio")
            .attr("name", "entrepotArriveEntrepot")
            .attr("value", entrepot.position).attr("id", "e" + entrepot.position);

        });

    });

    socket.on("askMaps",data=>{
        
        let choisirMap = d3.select("#choisirMap");

        data.forEach((nom)=>{
            choisirMap.append("option").attr("value",nom).text(nom);
        });

    });

    socket.on("demandeBateaux",data=>{
        let nbBateaux = d3.select("#nbBateaux");

        nbBateaux.text(data);

    });

});
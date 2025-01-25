
String.prototype.supprimerPrefixId = function (prefix) {
    return this.startsWith(prefix) ? this.slice(prefix.length) : this.toString();
}


let dicoPathUnite = {};
//-------------------Fonction qui déplace vue damier selon boutons/touches-----------------

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
        fill(cite.argolide,"red","prev");
        fill(cite.beotie,"url(#"+map.terrain[cite.beotie]+"-pattern","prev");
        fill(cite.attique,"url(#"+map.terrain[cite.attique]+"-pattern","prev");
    }); 

   

    document.getElementById("finTour").addEventListener("click",()=>{
        socket.emit("finTour");
    })

    socket.on("finTour",data=>{
        // true si tout le monde à fini false sino

        let index = 0;

        function jouerAnimationSuivante() {
            if (index < data.length) {
                const mouvement = data[index];
                deplacerUnitesAnim(mouvement.départ, mouvement.arrivée, () => {
                    index++; // Passe au mouvement suivant
                    jouerAnimationSuivante(); // Lance la prochaine animation
                });
            } else {
                // Une fois que toutes les animations sont terminées
                socket.emit("demandeDamier", idJoueur);
            }
        }

        // Lancer la première animation
        jouerAnimationSuivante();
        
    });


   socket.on("lobbyPartie",(data)=>{
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

        socket.emit("demandeDamier", idJoueur)
    })

    //----------------Pour test, faudra faire ça mieux plus tard-------------------
    /*socket.on("finTour",data=>{
        if (data){socket.emit("demandeDamier", idJoueur)
        }
    })*/



    // muovement
    socket.on("mouvement",data=>{
        dicoPathUnite[data[0]]=data
    })

        //-----------------------------------------------------------------------

    socket.on("demandeDamier", data => {
        terrain = data.terrain
        board = terrain.board
        créerDamier(data.height, data.width, 32, "jeu", "h") // damier de jeu
        actualiserDamier(data.width, data.height, data.terrain, "h")
        appelsAjoutTextures("jeu");
        setupBoutonScroll("damierjeu"); 
        ajouterUnites(data.board, "jeu");

        // mouvement
        let unites = document.getElementsByClassName("unite");
        let hexagones = document.getElementsByClassName("hexagones");

        let vueInfoHdv = d3.select("#vueInfoHdv");

        let uniteSelectionnee = "";
        let hexagoneSelectionnee = "";



        Array.from(hexagones).forEach(element => {
            element.addEventListener("mouseover", (event) => {
                d3.select("#uniteTemp").remove();

                if (uniteSelectionnee && data.board[uniteSelectionnee].movement>0) {
                    hexagoneSelectionnee = event.target.id.supprimerPrefixId("h");

                    let bbox = element.getBBox();

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
                        if (uniteSelectionnee ) {
                            // console.log("mouvement",uniteSelectionnee,hexagoneSelectionnee);
                            socket.emit("mouvement", { départ: uniteSelectionnee, arrivée: hexagoneSelectionnee });
                            uniteSelectionnee = "";
                            hexagoneSelectionnee = "";
                            d3.select("#uniteTemp").remove();
                        }
                    });


                }
            });

            element.addEventListener("click",(event)=>{
                hexagoneSelectionnee = event.target.id.supprimerPrefixId("h");
            
                if(uniteSelectionnee && hexagoneSelectionnee){
                    socket.emit("mouvement",{départ:uniteSelectionnee,arrivée:hexagoneSelectionnee});
                    uniteSelectionnee="";
                    hexagoneSelectionnee="";
                }
            });
        });


        Array.from(unites).forEach(element=>{
            element.addEventListener("mouseover",(event)=>{
                d3.select("#uniteTemp").remove();

                if (uniteSelectionnee != event.target.id.supprimerPrefixId("uni") && !event.target.id.startsWith("uniteTemp")) {
                    hexagoneSelectionnee = event.target.id.supprimerPrefixId("uni");
                }

                let path=dicoPathUnite[event.target.id.supprimerPrefixId("uni")] ;
                path = path ? path : data.board[event.target.id.supprimerPrefixId("uni")].path;


                if(path){
                    
                    d3.select("#h"+event.target.id.supprimerPrefixId("uni")).style("filter", "brightness(1.2) sepia(0.5) saturate(5) opacity(0.5)");

                    for(let i=0;i<path.length;++i){
                        d3.select("#h"+path[i]).style("filter", "brightness(1.2) sepia(0.5) saturate(5) opacity(0.5)");
                    }
                }
             
            });

            element.addEventListener("mouseleave",(event)=>{
                let path=dicoPathUnite[event.target.id.supprimerPrefixId("uni")];
                path = path ? path : data.board[event.target.id.supprimerPrefixId("uni")].path;

                if(path){

                    d3.select("#h"+event.target.id.supprimerPrefixId("uni")).style("filter",null);

                    for(let i=0;i<path.length;++i){
                        d3.select("#h"+path[i]).style("filter",null);
                    }
                }
            });
            element.addEventListener("click",(event)=>{

                if(data.board[event.target.id.supprimerPrefixId("uni")].name=="Hôtel de ville"){
                    vueInfoHdv.style("display",(vueInfoHdv.style("display")=="none" ? "block" : "none"));
                    // vueInfoHdv variable D3

                }else if(uniteSelectionnee==event.target.id.supprimerPrefixId("uni")){
                    uniteSelectionnee="";
                }else if(uniteSelectionnee){
                    uniteSelectionnee=event.target.id.supprimerPrefixId("uni");
                    //socket.emit("mouvement",{départ:uniteSelectionnee,arrivée:hexagoneSelectionnee});
                }else if(data.board[event.target.id.supprimerPrefixId("uni")].movement>0){
                    uniteSelectionnee=event.target.id.supprimerPrefixId("uni");
                    
                }

            });
        });
    });


});


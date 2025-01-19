const socket = io('http://localhost:8888');

//-------------------Création d'hexagone sous forme de tableau de points----------------------------------------
/**
 * creer une liste des points des hexagones
 * @param {Number} rayon 
 * @returns {Array} - la liste des points 
 */
function creerHexagone(rayon) { 
    var points = new Array();
    for (var i = 0; i < 6; i++) {
        var angle = i * Math.PI / 3;
        var x = Math.sin(angle) * rayon + 40;
        var y = -Math.cos(angle) * rayon + 40;
        points.push([Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
    }
    return points;
}

//-------------------Création du damier d'hexagones----------------------------------------


/** 
 * créer un damier dans une div donnée
 * @param {number} nbColumns - nombre de colonnes
 * @param {number} nbLines - nombre de lignes
 * @param {number} rayon - rayon des hexagones
 * @param {number} idDamier - identifiant du damier
 * @param {number} idHexa - identifiant des hexagones
*/
function créerDamier(nbColumns, nbLines, rayon,idDamier,idHexa) {
    document.getElementById(idDamier).style.visibility="visible";
    document.getElementById(idDamier).innerHTML = "";
    Hexagone = creerHexagone(rayon);

    for (var l = 0; l < nbLines; l++) {
        for (var c = 0; c < nbColumns; c++) {
            var d = "";
            var x, y;

            for (var i = 0; i < 6; i++) {
                h = Hexagone[i];
                x = h[0] + (Hexagone[1][0] - Hexagone[0][0]) * l * 2;
                if (c % 2 == 1) {
                    x += (Hexagone[1][0] - Hexagone[0][0]);
                }
                y = h[1] + (Hexagone[1][1] - Hexagone[0][1]) * c * 3;

                if (i == 0) {
                    d += "M" + x + "," + y + " L";
                } else {
                    d += x + "," + y + " ";
                }
            }
            d += "Z";



            d3.select("#"+idDamier)
                .append("path")
                .attr("d", d)
                .attr("stroke", "transparent")
                .attr("shape-rendering", "crispEdges")
                .attr("id", idHexa + (l * nbColumns + c))

                .on("mouseover", function() {
                    d3.select(this)
                    .attr("stroke", "orange")
                    .style("stroke-width", 2);
                })

                .on("mouseout", function() {
                    d3.select(this)
                        .attr("stroke", "transparent")
                });
        }
    }
}

function créerMiniMap(nbColumns, nbLines, rayon) {
    document.getElementById("mini").style.visibility="visible";
    document.getElementById("mini").innerHTML = "";
    Hexagone = creerHexagone(rayon);

    for (var l = 0; l < nbLines; l++) {
        for (var c = 0; c < nbColumns; c++) {
            var d = "";
            var x, y;

            for (var i = 0; i < 6; i++) {
                h = Hexagone[i];
                x = h[0] + (Hexagone[1][0] - Hexagone[0][0]) * l * 2;
                if (c % 2 == 1) {
                    x += (Hexagone[1][0] - Hexagone[0][0]);
                }
                y = h[1] + (Hexagone[1][1] - Hexagone[0][1]) * c * 3;

                if (i == 0) {
                    d += "M" + x + "," + y + " L";
                } else {
                    d += x + "," + y + " ";
                }
            }
            d += "Z";



            d3.select("#mini")
                .append("path")
                .attr("d", d)
                .attr("stroke", "transparent")
                .attr("shape-rendering", "crispEdges")
                .attr("id", "m" + (l * nbColumns + c))
        }
    }
}

//-------------------Coloriage d'un hexagone----------------------------------------
/**
 * actualise la texture/couleur d'un hexagone
 * @param {String} id - id de l'hexagone (position)
 * @param {String} couleur 
 * @param {String} idHexa - type d'hexagone (mini, h, prev)
 */
function fill(id,couleur,idHexa){
    d3.select(("#"+idHexa+id)).attr("fill", couleur);
}

function fillMini(id,couleur){
    d3.select(("#m"+id)).attr("fill", couleur);
}
//-------------------Fonction d'actualisation des textures du damier-----------------
/**
 * actualise les textures des hexagones
 * @param {Number} longueur 
 * @param {Number} largeur 
 * @param {Array} jeu - liste des terrains  
 * @param {String} idHexa - type d'Hexagone
 */
function actualiserDamier(longueur, largeur, jeu,idHexa) {
    for (i = 0; i < longueur * largeur; i++) {
        if (jeu[i]=="?"){fill(i, "gray",idHexa)
        }
    else{
        fill(i, "url(#"+jeu[i]+"-pattern)",idHexa)
    }
    }
}

function actualiserMini(longueur, largeur, jeu) {
    for (i = 0; i < longueur * largeur; i++) {
        fillMini(i, "url(#"+jeu[i]+"-pattern)")
    }
}


/**
 * ajoute une texture à un hexagone 
 * @param {String} id - id de l'hexagone
 * @param {String} url - lien vers la texture
 * @param {String} selected - id de la div du damier 
 */
function ajouterTextures(id, url,selected) {
    let defs = d3.select("#"+selected).append("defs");

    // Plaines
    defs.append("pattern")
        .attr("id", id)
        .attr("width", 1)
        .attr("height", 1)
        .attr("patternContentUnits", "objectBoundingBox")
        .append("image")
        .attr("xlink:href", url)
        .attr("width", 1)
        .attr("height", 1)
        .attr("preserveAspectRatio", "none");
}
/**
 * ajoute les textures d'un damier
 * @param {String} selected - div où les textures doivent être ajouté
 */
function appelsAjoutTextures(selected){
    
    var images = [
        
        //Plaines
        {id : "plaine_1-pattern", url : "/img/textures/plaines/plaine_1.jpg"},
        {id : "plaine_2-pattern", url : "/img/textures/plaines/plaine_2.jpg"},
        {id : "plaine_3-pattern", url : "/img/textures/plaines/plaine_3.jpg"},
        {id : "plaine_4-pattern", url : "/img/textures/plaines/plaine_4.jpg"},

        //Forets
        //1 arbres
        {id : "foret1_1-pattern", url : "/img/textures/forets/foret1_1.jpg"},
        {id : "foret1_2-pattern", url : "/img/textures/forets/foret1_2.jpg"},
        {id : "foret1_3-pattern", url : "/img/textures/forets/foret1_3.jpg"},
        {id : "foret1_4-pattern", url : "/img/textures/forets/foret1_4.jpg"},

        //2 arbres
        {id : "foret2_1-pattern", url : "/img/textures/forets/foret2_1.jpg"},
        {id : "foret2_2-pattern", url : "/img/textures/forets/foret2_2.jpg"},
        {id : "foret2_3-pattern", url : "/img/textures/forets/foret2_3.jpg"},
        {id : "foret2_4-pattern", url : "/img/textures/forets/foret2_4.jpg"},

        //3 arbres
        {id : "foret3_1-pattern", url : "/img/textures/forets/foret3_1.jpg"},
        {id : "foret3_2-pattern", url : "/img/textures/forets/foret3_2.jpg"},
        {id : "foret3_3-pattern", url : "/img/textures/forets/foret3_3.jpg"},
        {id : "foret3_4-pattern", url : "/img/textures/forets/foret3_4.jpg"},
        
        //Montagnes
        {id : "montagne-pattern", url : "/img/textures/montagnes/montagne.jpg"},

        //Eau
        {id : "eau-pattern", url : "/img/textures/eaux/eau.jpg"},

        //Sables
        {id : "sable-pattern", url : "/img/textures/sables/sable.jpg"},

        //Carrieres
        {id : "carriere_1-pattern", url : "/img/textures/carrieres/carriere_1.jpg"},
        {id : "carriere_2-pattern", url : "/img/textures/carrieres/carriere_2.jpg"},
        {id : "carriere_3-pattern", url : "/img/textures/carrieres/carriere_3.jpg"}
    ]

    for(let terrain of images){
        ajouterTextures(terrain.id,terrain.url,selected);
    }
    
}

//-------------------Fonctions pour afficher les unités-----------------


/**
 * affiche une unitée sur le damier
 * @param {Object} unite - Object ayant les attributs name, couleur, position, etc
 * @param {String} dam - id du damier sur lequel mettre l'unité 
 */
function afficherUnites(unite,dam) {
    let hexagone = document.getElementById("h" + unite.position);

    console.log(unite.position)

    let anciennepostion = unite.position;
    if (hexagone) {
        let bbox = hexagone.getBBox();

        

        let xdebut = 0;
        let ydebut = 0;


        let xfin = 0;
        let yfin = 0;
        let mousedrag = false


        d3.select("#"+dam)
            .append("image")
            .attr("class","unite")
            .attr("xlink:href",`/img/personnages/${unite.couleur}/${unite.name}.png`)
            .attr("x",`${bbox.x -10}`)
            .attr("y",`${bbox.y -15}`)
            .attr("width","70")
            .attr("height","80")
            .attr("id","uni"+unite.position)
            

        d3.select("#uni"+unite.position)
            .on("mouseover",function(event){
                statsUnite(unite)

                // mise à jour de la distance parcouru par la souris
                if(mousedrag){
                    console.log("slaut")
                    xfin = event.x-xdebut;
                    yfin = event.y -ydebut;
                }
            })
            .on("mousedown",function(event){

                // position initial de la souris quand tu commences le drag
                mousedrag = true;
                console.log(event);
                
                xdebut = event.x;
                ydebut = event.y;

            })
            .on("mouseup",function(event){
                console.log("x:"+xfin)
                console.log("y:"+yfin)

                mousedrag = false


                // si la distance parcouru sur x est > à y alors je décalle l'unite à droite ou à gauche
                if(xfin> yfin){
                    if (xfin>0)
                        unite.position = unite.position+30
                    else
                        unite.position = unite.position-30


                }else if(xfin< yfin){ // sinon
                    if(yfin>0){
                        // en fonction du x je déplace sur la diagonale droite ou gauche
                        // bas
                        if(xfin>0)
                            unite.position = unite.position+31
                        else
                            unite.position = unite.position-1
                    }else{
                        // haut
                        if(xfin>0)
                            unite.position = unite.position-31
                        else
                            unite.position = unite.position+1
                    }
                }
                
                d3.select("#uni"+anciennepostion).remove();
                afficherUnites(unite,dam);
                socket("unitedeplacer",{avant:anciennepostion,apres:unite.position});
                
                
            });



    } else {
        console.log("L'élément avec l'ID h" + unite.position + " n'existe pas.");
    }
}

/**
 * affiche les stats d'une unité lors d'un mouseover sur la div à droite
 * @param {Object} unite - Object ayant les attributs name, attack, hp, defense
 */
function statsUnite(unite){
    let stats = d3.select("#statsUnite");
    stats.selectAll("*").remove();
    stats.append("div").attr("id","position").text("unitePos : "+unite.position);
    stats.append("div").attr("id","uniteName").text("uniteName : "+unite.name);
    stats.append("div").attr("id","uniteAttack").text("uniteAttack : "+unite.attack);
    stats.append("div").attr("id","uniteHp").text("uniteHp : "+unite.hp);
    stats.append("div").attr("id","uniteDefence").text("uniteDefence : "+unite.defense);

}

/**
 * ajoute les unités sur le damier avec la fonction afficherUnites
 * @param {Object} board - une liste d'unité
 * @param {String} dam - le nom de la div du damier
 */
function ajouterUnites(board,dam){
    for (let position of Object.keys(board)){
        afficherUnites(board[position],dam);
    }
}




/**
 * affiche la liste des parties sur le menu principal
 * @param {Array} data - liste de parties
 */
function afficherListeParties(data){
    document.getElementById("listeJoueurs").innerHTML="<tr><th>nom partie</th><th>nombre de tours</th><th>nombre de joueurs</th><th>Rejoindre</th></tr>";

    for(partie of data){
        d3.select("#listeJoueurs").append("tr").attr("id","tr"+partie.idPartie).append("td").text(partie.nom);
        d3.select("#tr"+partie.idPartie).append("td").text(partie.nbTours);
        d3.select("#tr"+partie.idPartie).append("td").text(partie.currentPlayers +"/"+partie.nbJoueurs);
        d3.select("#tr"+partie.idPartie)
        .append("td")
        .append("button")
        .attr("class","btn-rejoindre")
        .text("Rejoindre")
        .on("click",()=>{
            socket.emit("rejoindreLobby",partie.idPartie);
        });
    }
    
    
}

/**
 * affiche le nom de la partie haut de la page
 * @param {String} nom 
 */
function afficherNomPartie(nom){
    d3.select("#nomPartie").text(nom)

}
//-------------------Création d'hexagone sous forme de tableau de points----------------------------------------

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
 * créer un damier
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

function fill(id,couleur,idHexa){
    d3.select(("#"+idHexa+id)).attr("fill", couleur);
}

function fillMini(id,couleur){
    d3.select(("#m"+id)).attr("fill", couleur);
}
//-------------------Fonction d'actualisation des textures du damier-----------------

function actualiserDamier(longueur, largeur, jeu,idHexa) {
    for (i = 0; i < longueur * largeur; i++) {
        fill(i, "url(#"+jeu[i]+"-pattern)",idHexa)
    }
}

function actualiserMini(longueur, largeur, jeu) {
    for (i = 0; i < longueur * largeur; i++) {
        fillMini(i, "url(#"+jeu[i]+"-pattern)")
    }
}



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

function afficherUnites(unite, couleur, pos) {
    let hexagone = document.getElementById("h" + pos);
    if (hexagone) {
        let bbox = hexagone.getBBox();
        let damier = document.getElementById("jeu");

        damier.innerHTML += `
            <image class="unite"
                xlink:href="/img/personnages/${couleur}/${unite}.png"
                x="${bbox.x -10}"  
                y="${bbox.y -15}"  
                width="70"         
                height="80"
            />
        `;
    } else {
        console.log("L'élément avec l'ID h" + pos + " n'existe pas.");
    }
}


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

// afficher le nom de la partie
function afficherNomPartie(nom){
    d3.select("#nomPartie").text(nom)

}
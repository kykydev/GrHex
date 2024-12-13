
const socket = io('http://localhost:8888');


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

function créerDamier(nbColumns, nbLines, rayon) {
    document.getElementById("jeu").style.visibility="visible";
    document.getElementById("jeu").innerHTML = "";
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



            d3.select("#jeu")
                .append("path")
                .attr("d", d)
                .attr("stroke", "transparent")
                .attr("shape-rendering", "crispEdges")
                .attr("id", "h" + (l * nbColumns + c))

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

function créerDamierPrev(nbColumns, nbLines, rayon) {
    
    document.getElementById("jeuprev").style.visibility="visible";
    document.getElementById("jeuprev").innerHTML = "";
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



            d3.select("#jeuprev")
                .append("path")
                .attr("d", d)
                .attr("stroke", "transparent")
                .attr("shape-rendering", "crispEdges")
                .attr("id", "prev" + (l * nbColumns + c))
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

function fill(id,couleur){
    d3.select(("#h"+id)).attr("fill", couleur);
}

function fillMini(id,couleur){
    d3.select(("#m"+id)).attr("fill", couleur);
}
function fillPrev(id,couleur){
    d3.select(("#prev"+id)).attr("fill", couleur);
}

//-------------------Fonction d'actualisation des textures du damier-----------------

function actualiserDamier(longueur, largeur, jeu) {
    for (i = 0; i < longueur * largeur; i++) {
        fill(i, "url(#"+jeu[i]+"-pattern)")
    }
}

function actualiserDamierPrev(longueur, largeur, jeu) {
    for (i = 0; i < longueur * largeur; i++) {
        fillPrev(i, "url(#"+jeu[i]+"-pattern)")
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

//-------------------Fonction qui déplace vue damier selon la position de la souris-----------------

function setupScroll(id){
    var x ;
    var y ;
    document.addEventListener("mousemove",(event)=>{
        x = event.clientX
        y = event.clientY
    })

    
    const plateaujeu = document.getElementById(id);
    function scroll() {
        let threshold = 150;
        let scrollAmount = 15;
        const rect = plateaujeu.getBoundingClientRect();

            // x <= rect.left + threshold ||
            // x >= rect.right - threshold ||
            // y <= rect.top + threshold ||
            // y >= rect.bottom - threshold


            if(x >= rect.right - threshold && x<rect.right){ 
                d3.select("#"+id).property("scrollLeft", d3.select("#"+id).property("scrollLeft") +scrollAmount);
            }else if(x <= rect.left + threshold && x>rect.left){
                d3.select("#"+id).property("scrollLeft", d3.select("#"+id).property("scrollLeft") -scrollAmount);
            }

            if(y <= rect.top + threshold && y>rect.top){
                d3.select("#"+id).property("scrollTop", d3.select("#"+id).property("scrollTop") -scrollAmount);
            }else  if(y >= rect.bottom - threshold  && y<rect.bottom){
                d3.select("#"+id).property("scrollTop", d3.select("#"+id).property("scrollTop") +scrollAmount);
            }


    }   
    setInterval(scroll, 30);
}

//-------------------Fonctions pour afficher les unités-----------------

function afficherUnites(unite, couleur, pos) {
    let hexagone = document.getElementById("h" + pos);
    if (hexagone) {
        let bbox = hexagone.getBBox();
        let damier = document.getElementById("jeu");

        damier.innerHTML += `
            <image class="unite"
                xlink:href="http://localhost:8888/img/personnages/${couleur}/${unite}.png"
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




//------------------------------TESTS---------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("creerPartie").addEventListener("click",()=>{
        const nbJoueurs = document.getElementById("nbJoueurs");
        const nbTours = document.getElementById("nbTours");
        socket.emit("creerPartie",{"nbJoueurs":parseInt(nbJoueurs.value),"nbTours":parseInt(nbTours.value)});

        document.querySelector('.accueil').style.display = 'none';
        document.querySelector('.rejoindrePartie').style.display = 'block';

    });

   socket.on("lobbyPartie",(data)=>{
        //{"terrain":la map,"width":int,"height":int,"positionsCites":{"béotie":215,"attique":1072,"argolide":297},"idPartie":int,"idJoueur":int}

        
        document.querySelector('.accueil').style.display = 'none';
        document.querySelector('.rejoindrePartie').style.display = 'block';

        console.log(data)

        créerDamierPrev(data.map.height,data.map.width,32);
        appelsAjoutTextures("jeuprev")
        actualiserDamierPrev(data.map.width,data.map.height,data.map.terrain);

        let cite = data.positionCites;

        
        fillPrev(cite.béotie,"red");
        fillPrev(cite.attique,"red");
        fillPrev(cite.argolide,"red");
        setupScroll("damierPrev");
   });

    socket.on("map",data=>{
        console.log(data)

        créerDamier(data.height,data.width,32)
        //créerMiniMap(data.height, data.width, 2)
        
        appelsAjoutTextures();
        actualiserDamier(data.width,data.height,data.terrain)
        //actualiserMini(data.width,data.height,data.terrain)
        setupScroll("damier")
        afficherUnites("epeeiste", "rouge", 343);

    });//---------------fin du socket
    
});
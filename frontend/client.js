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
                // .attr("stroke", "rgba(0, 0, 0, 0.2)")
                .attr("stroke", "transparent")  // Bordure transparente
                .attr("shape-rendering", "crispEdges")
                .attr("fill", "url(./HEX/prairie_1.jpg)")
                .attr("id", "h" + (l * nbColumns + c));



        }
    }
}

//-------------------Coloriage d'un hexagone----------------------------------------

function fill(id,couleur){
    d3.select(("#h"+id)).attr("fill", couleur);
}

//-------------------Fonction d'actualisation du damier----------------------------------------

function actualiserDamier(longueur, largeur, jeu) {
    for (i = 0; i < longueur * largeur; i++) {
        fill(i, "url(#"+jeu[i]+"-pattern)")
    }
}

//-------------------Fonction d'actualisation du damier----------------------------------------

function ajouterTextures(id, url) {
    let defs = d3.select("svg").append("defs");

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

function appelsAjoutTextures(){
    
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
        ajouterTextures(terrain.id,terrain.url);
    }
    
}





//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------
//------------------------------TESTS--------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {

    width=25
    height=25
    créerDamier(height,width,40)
    

    var terrain = []

    const probPrairie = 0.6;   // 40% de chances pour une prairie
    const probForet = 0.3;     // 30% de chances pour une forêt
    const probCarriere = 0.1;  // 10% de chances pour une carrière
    const probMontagne = 0.05;  // 10% de chances pour une montagne
    const probEau = 0.1;       // 10% de chances pour de l'eau

    // Tableau de textures pour chaque terrain
    const texturesPrairie = ["plaine_1", "plaine_2", "plaine_3", "plaine_4"];
    const texturesForet = ["foret1_1", "foret1_2", "foret1_3", "foret1_4","foret2_1", "foret2_2", "foret2_3", "foret2_4","foret3_1", "foret3_2", "foret3_3", "foret3_4"];
    const texturesCarriere = ["carriere_1", "carriere_2", "carriere_3"];
    const texturesMontagne = ["montagne"];
    const texturesEau = ["eau"];

    // Remplir le tableau de terrains avec des valeurs aléatoires et des textures variées
    for (var i = 0; i < width * height; i++) {
        const rand = Math.random();  // Nombre aléatoire entre 0 et 1

        if (rand < probPrairie) {
            terrain.push(texturesPrairie[Math.floor(Math.random() * texturesPrairie.length)]);  // Prairie avec texture aléatoire
        } else if (rand < probPrairie + probForet) {
            terrain.push(texturesForet[Math.floor(Math.random() * texturesForet.length)]);  // Forêt avec texture aléatoire
        } else if (rand < probPrairie + probForet + probCarriere) {
            terrain.push(texturesCarriere[Math.floor(Math.random() * texturesCarriere.length)]);  // Carrière avec texture aléatoire
        } else if (rand < probPrairie + probForet + probCarriere + probMontagne) {
            terrain.push(texturesMontagne[Math.floor(Math.random() * texturesMontagne.length)]);  // Montagne
        } else {
            terrain.push(texturesEau[Math.floor(Math.random() * texturesEau.length)]);  // Eau
        }
    }

    appelsAjoutTextures();

    actualiserDamier(width,height,terrain)
    
    
    /*
    posi = 1
    fill(posi,"green")


    posdest = 47
    fill(posdest,"cyan")
    regles = []
    for (j of terrain){
        if (j=="montagne" || j=="eau"){
            regles.push("X")
        }
        else{
            regles.push("O")
        }
    }



    console.log(regles)
    pathFind(posi,posdest,height,width,regles)
*/

});
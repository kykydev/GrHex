
const socket = io('http://localhost:8888');


var width;var height

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


function casesAdjacentes(pos, width, height) {
    pos = parseInt(pos, 10);
    width = parseInt(width,10)
    height = parseInt(height,10)
    var adj = [];
    var row = pos%height;
    var col = Math.floor(pos / height)  ;
    if (col > 0) { // not left
        adj.push(pos - height); // left
    }
    if (col < width - 1) { // not right
        adj.push(pos + height); // right
    }
   
    if (col%2==0){//even col

        if (row%2==0){//even row
            if (row>0){
                if (col>0){adj.push(pos-height-1)}
                adj.push(pos-1)
            }
            if (row<height-1){
                if (col>0){adj.push(pos-height+1)}
                adj.push(pos+1)


            }
        }
        if (row%2!=0){
            if (row<width-1){
                if (col<width-1){adj.push(pos+height+1)}
                adj.push(pos-1)
            }
            if (row>0){
                if (col>0){adj.push(pos+height-1)}
                adj.push(pos-1)


            }
        }
    }
    if (col%2!=0){//odd column

        if (row%2==0){//even row
            if (row>0){
                if (col>0){adj.push(pos-height-1)}
                adj.push(pos-1)
            }
            if (row<height-1){
                if (col>0){adj.push(pos-height+1)}
                adj.push(pos+1)
            }
        }
        if (row%2!=0){//odd row
            if (row>0){
                if (col<width-1){adj.push(pos+height-1)}
                adj.push(pos-1)
            }
            if (row<width-1){
                if (col>0){adj.push(pos+height+1)}
                adj.push(pos+1)


            }
        }
    }

    adj = adj.filter(j => j >= 0 && j < height * width);
    

    return adj; 
}

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
                .on("click",function(){
                    const id = d3.select(this).attr("id").substring(1); 
                    if (mode=="fill"){
                        remplirSceau(id)
                    }
                    if (mode=="paint"){
                        peindre(id)
                    }
                })
                .on("mouseover", function() {
                    d3.select(this)
                    .attr("stroke", "orange")
                    .style("stroke-width", 2)

                    if (isDown==false || mode!="paint"){return}
                    const id = d3.select(this).attr("id").substring(1); 
                    peindre(id)
                })

                .on("mouseout", function() {
                    d3.select(this)
                        .attr("stroke", "transparent")
                })
        }
    }
}

document.addEventListener("mousedown", function(event) {
    isDown=true
});

document.addEventListener("mouseup", function(event) {
isDown=false
});



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

//-------------------Fonction d'actualisation des textures du damier----------------------------------------

function actualiserDamier(longueur, largeur, jeu) {
    for (i = 0; i < longueur * largeur; i++) {
        fill(i, "url(#"+jeu[i]+"-pattern)")
    }
}

function actualiserMini(longueur, largeur, jeu) {
    for (i = 0; i < longueur * largeur; i++) {
        fillMini(i, "url(#"+jeu[i]+"-pattern)")
    }
}

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

var outil = "plaine"
var isDown = false
var mode = "paint"

function mapprint(){
    console.log(map)
    socket.emit("saveçastp",map)
}

function plaine(){
    console.log("choisi plaine")
    outil= "plaine"
}

function carriere(){
    console.log("choisi carriere")
    outil= "carriere"
}

function montagne(){
    console.log("choisi montagne")
    outil= "montagne"
}

function foret(){
    console.log("choisi foret")
    outil="foret"    
}

function eau(){
    console.log("choisi eau")
    outil= "eau"
}

function paint(){
    mode="paint"
}

function fillmode(){
    mode = "fill"
}

function peindre(id){

                    
    let patterne = "plaine_1-pattern";
    let terrain = "plaine";
    switch (outil) {
        case "plaine":
            patterne = "plaine_1-pattern";
            terrain = "plaine";
            break;

        case "eau":
            patterne = "eau-pattern";
            terrain = "eau";
            break;

        case "montagne":
            patterne = "montagne-pattern";
            terrain = "montagne";
            break;

        case "foret":
            patterne = "foret1_1-pattern";
            terrain = "foret1";
            break;

        case "carriere":
            patterne = "carriere_1-pattern";
            terrain = "carriere";
            break;

        default:
            console.warn("Unknown tool selected:", outil);
            return; 
    } 
    fill(id, `url(#${patterne})`);                
    if (map.length > id) {
        map[id] = terrain;
    }
}



function remplirSceau(id){
    console.log("a")
    var patternebase = map[id]
    var atester = [id]
    var testees = []
    while (atester.length>0){
        var test = atester.shift()
        console.log(test)
        if (map[test]==patternebase){
            testees.push(test)
            for (var z of casesAdjacentes(test,width,height)){
                if (!testees.includes(z) && !atester.includes(z)){
                atester.push(z)
                }
            }
        }
    }
    
    console.log(testees)

    for (var z of testees){

    let patterne = "plaine_1-pattern";
    let terrain = "plaine";
    switch (outil) {
        case "plaine":
            patterne = "plaine_1-pattern";
            terrain = "plaine";
            break;

        case "eau":
            patterne = "eau-pattern";
            terrain = "eau";
            break;

        case "montagne":
            patterne = "montagne-pattern";
            terrain = "montagne";
            break;

        case "foret":
            patterne = "foret1_1-pattern";
            terrain = "foret1";
            break;

        case "carriere":
            patterne = "carriere_1-pattern";
            terrain = "carriere";
            break;

        default:
    } 
    fill(z, `url(#${patterne})`);                
    if (map.length > z) {
        map[z] = terrain;
    }
    }
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
//------------------------------TESTS---------------------------------------------------------------
//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------

var map = []
board = []

document.addEventListener("DOMContentLoaded", function () {

    document.querySelector('.accueil').style.display = 'none';
    document.querySelector('.partie').style.display = 'block';
    socket.on("map",data=>{
        console.log(data)
        width = data.width;height = data.height
        créerDamier(data.height,data.width,16)
        créerMiniMap(data.height, data.width, 2)
        
        appelsAjoutTextures();
        actualiserDamier(data.width,data.height,data.terrain)
        actualiserMini(data.width,data.height,data.terrain)
        
        map = []
        for (z of data.infos){map.push(z.type)}
    })
});
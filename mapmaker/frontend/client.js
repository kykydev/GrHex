
const socket = io('http://localhost:8888');


var width;var height
const unites = ["hoplite","archer","paysanne","mineur","bûcheron","tour","forge","mur","hôtel de ville","champ","mine","maison"]
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

var positionsDépart = {
    "beotie": 243,
    "attique": 923,
    "argolide": 137
}
//-------------------Création du damier d'hexagones----------------------------------------

function mursAdjacentes(pos,board) {
    pos = parseInt(pos, 10);

    var retour = [];
    if (board[pos] == undefined || board[pos] != "mur") { return retour }
    var row = pos % height;
    var col = Math.floor(pos / height);
    if (col > 0) { // not left
        if (!retour.includes("gauche") && board[pos - height] != undefined && board[pos - height] == "mur") { retour.push("gauche") }; // left
    }
    if (col < width - 1) { // not right
        if (!retour.includes("droite") && board[pos + height] != undefined && board[pos + height] == "mur") { retour.push("droite") }; // right
    }


    if (col % 2 == 0) {//even col   

        if (row % 2 == 0) {//even row
            if (row > 0) {
                if (col > 0) { if (!retour.includes("hautgauche") && board[pos - height - 1] != undefined && board[pos - height - 1] == "mur") { retour.push("hautgauche") }; }
                if (!retour.includes("hautdroite") && board[pos - 1] != undefined && board[pos - 1] == "mur") { retour.push("hautdroite") }; // left

            }
            if (row < height - 1) {
                if (col > 0) { if (!retour.includes("basgauche") && board[pos - height + 1] != undefined && board[pos - height + 1] == "mur") { retour.push("basgauche") }; }
                if (!retour.includes("basdroite") && board[pos + 1] != undefined && board[pos + 1] == "mur") { retour.push("basdroite") }; // left



            }
        }
        if (row % 2 != 0) {
            if (row > 0) {
                if (col > 0) {
                    if (!retour.includes("hautdroite") && board[pos + height - 1] != undefined && board[pos + height - 1] == "mur") { retour.push("hautdroite") }; // left
                }
                if (!retour.includes("hautgauche") && board[pos - 1] != undefined && board[pos - 1] == "mur") { retour.push("hautgauche") };

            }
            if (row < height - 1) {
                if (col < width - 1) {
                    if (!retour.includes("basdroite") && board[pos + height + 1] != undefined && board[pos + height + 1] == "mur") { retour.push("basdroite") }; // left
                }
                if (!retour.includes("basgauche") && board[pos + 1] != undefined && board[pos + 1] == "mur") { retour.push("basgauche") }
            }
        }
    }
    if (col % 2 != 0) {//odd column

        if (row % 2 == 0) {//even row
            if (row > 0) {
                if (col > 0) {
                    if (!retour.includes("hautgauche") && board[pos - height - 1] != undefined && board[pos - height - 1] == "mur") { retour.push("hautgauche") };
                }
                if (!retour.includes("hautdroite") && board[pos - 1] != undefined && board[pos - 1] == "mur") { retour.push("hautdroite") }
            }

            if (row < height - 1) {
                if (col > 0) { if (!retour.includes("basgauche") && board[pos - height + 1] != undefined && board[pos - height + 1] == "mur") { retour.push("basgauche") } }
                if (!retour.includes("basdroite") && board[pos + 1] != undefined && board[pos + 1] == "mur") { retour.push("basdroite") }
            }
        }
        if (row % 2 != 0) {//odd row

            if (row > 0) {
                if (col < width - 1) {
                    if (!retour.includes("hautdroite") && board[pos + height - 1] != undefined && board[pos + height - 1] == "mur") { retour.push("hautdroite") }
                }
                if (!retour.includes("hautgauche") && board[pos - 1] != undefined && board[pos - 1] == "mur") { retour.push("hautgauche") }
            }
            if (row < height - 1) {
                if (col > 0) { if (!retour.includes("basdroite") && board[pos + height + 1] != undefined && board[pos + height + 1] == "mur") { retour.push("basdroite") } }
                if (!retour.includes("basgauche") && board[pos + 1] != undefined && board[pos + 1] == "mur") { retour.push("basgauche") }


            }
        }
    }


    var retouryahou = []
    if (retour.length == 0) { retouryahou = ["centre"] } else { retouryahou.push("centre") }
    if (retour.includes("hautdroite")) { retouryahou.push("hautdroite") }
    if (retour.includes("hautgauche")) { retouryahou.push("hautgauche") }
    if (retour.includes("droite")) { retouryahou.push("droite") }
    if (retour.includes("gauche")) { retouryahou.push("gauche") }
    if (retour.includes("basdroite")) { retouryahou.push("basdroite") }
    if (retour.includes("basgauche")) { retouryahou.push("basgauche") }

    return retouryahou;




}

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
            if (row<height-1){
                if (col<width-1){adj.push(pos+height+1)}
                adj.push(pos+1)
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
            if (row<height-1){
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
                    clique(id)


                })
                .on("mouseover", function() {
                    d3.select(this)
                    .attr("stroke", "orange")
                    .style("stroke-width", 2)
                    const id = d3.select(this).attr("id").substring(1); 

                   hoveur(id)
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


    function clique(id){
        if (mode=="fill"){
            remplirSceau(id)
        }
        if (mode=="paint"){
            peindre(id)
        }
        if (mode=="placeUnit"){
            addUnit(document.getElementById("uniSelec").value,id,document.getElementById("citeSelec").value)
        }
   
             
        if (mode=="posArgolide"){
            positionsDépart["argolide"]=id
            document.getElementById("posArgolide").innerText=("Argolide: "+positionsDépart["argolide"])
        }     
        if (mode=="posBeotie"){
            positionsDépart["beotie"]=id
            document.getElementById("posBeotie").innerText=("Beotie: "+positionsDépart["beotie"])
        }
        if (mode=="posAttique"){
            positionsDépart["attique"]=id
            document.getElementById("posAttique").innerText=("Attique: "+positionsDépart["attique"])
        }

    }


function hoveur(id){
        if (isDown==false){return}
        if (mode=="paint"){        peindre(id)}
        if (mode=="placeUnit"){addUnit(document.getElementById("uniSelec").value,id,document.getElementById("citeSelec").value)
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
function dessineMur(pos,board, type) {
    let directions = mursAdjacentes(pos,board);
    let hexagone = document.getElementById("h" + pos);
    let bbox = hexagone.getBBox();

    const murs = {
        "hautgauche": "murhautgauche.png",
        "hautdroite": "murhautdroite.png",
        "gauche": "murgauche.png",
        "droite": "murdroite.png",
        "basgauche": "murbasgauche.png",
        "basdroite": "murbasdroite.png",
        "centre": "mur.png",
    };

    directions.forEach(direction => {
        if (murs[direction]) {
            let image = d3.select("#jeu")
                .append("image")
                .attr("class", "unite")
                .attr("xlink:href", `/img/murs/${murs[direction]}`)
                .attr("x", `${bbox.x - 5}`)
                .attr("y", `${bbox.y - 7}`)
                .attr("width", "35")
                .attr("height", "40")
                .attr("id", "uni" + pos)
                .on("mouseover", () => {
                  
                    d3.select(hexagone)
                        .attr("stroke", `orange`)
                        .style("stroke-width", 2);
                })
                .on("mouseout", () => {
                    d3.select(hexagone)
                        .attr("stroke", "transparent")
                        .style("stroke-width", 0);
                });

        }
    });
}


function afficherUnites(pos,nom,couleu,opacity = 1) {
    let hexagone = document.getElementById("h" + pos);

    var dam = "jeu"
    if (hexagone) {
        let bbox = hexagone.getBBox();
        var couleur = "rouge"
        switch (couleu) {
            case "rouge":
                couleur = "darkred";
                break;
            case "vert":
                couleur = "green";
                break;
            case "bleu":
                couleur = "blue";
                break;
            case "jaune":
                couleur = "yellow";
                break;
            case "blanc":
                couleur = "aliceblue"
                break
        }

        let image = d3.select("#" + dam)
            .append("image")
            .attr("class", "unite")
            .attr("xlink:href", `/img/personnages/${couleu}/${nom.toLowerCase()}.png`)
            .attr("x", `${bbox.x - 5}`)
            .attr("y", `${bbox.y - 7}`)
            .attr("width", "35")
            .attr("height", "40")
            .attr("id", "uni" + pos)
            .on("mouseover", () => {
              
                d3.select(hexagone)
                    .attr("stroke", `${couleur}`)
                    .style("stroke-width", 2);
            })
            .on("mouseout", () => {
                d3.select(hexagone)
                    .attr("stroke", "transparent")
                    .style("stroke-width", 0)
            })
            .style("opacity", opacity) // opacité c'est entre 0 et 1
            .on("click",function(){
                const id = d3.select(this).attr("id").substring(3); 
                clique(id)


            })
        }
       

}

function supprUni() {
    d3.selectAll(".unite").remove();
}



function ajouterUnites(board,couleur) {
    for (let position of Object.keys(board)) {

        if (board[position] == "mur") {
            // console.log("mur"+position)
            dessineMur(position,board, "bois")
        }
        else {
            afficherUnites(position,board[position],couleur);
        }
    }
}

function dessinUnis(){
    supprUni()
    ajouterUnites(boardBeotie,"rouge")
    ajouterUnites(boardArgolide,"bleu")
    ajouterUnites(boardAttique,"vert")
    
}

function addUnit(name,position,cite){
    switch (cite){
        case "beotie":
            boardBeotie[position]=name
            break
        case "argolide":
            boardArgolide[position]=name
            break
        case "attique":
            boardAttique[position]=name
            break

        }


        dessinUnis()


    
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
    socket.emit("saveçastp",{
        "nom":document.getElementById("nomMap").value,
        "height":height,
        "width":width,
        "clustersMiniers": {
            "copper": [
                582
            ],
            "tin": [
                615
            ]
        },
        "positionsDépart": positionsDépart,
        "boards": {
            "boardNeutre": {},
            "beotie":boardBeotie,
            "hdvBeotie":[],
            "mursBeotie":[],
            "argolide":boardArgolide,
            "hdvArgolide":[],
            "mursArgolide":[],
            "attique":boardAttique,
            "hdvAttique":[],
            "mursAttique":[],
            
        },
        "map":map
        })
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

function placeunit() {
    mode="placeUnit"
}

function fillmode(){
    mode = "fill"
}

function posBeotie(){
    mode="posBeotie"
    console.log("mode beotie")
}

function posArgolide(){
    mode="posArgolide"
}
function posAttique(){
    mode="posAttique"
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
    
    var patternebase = map[id]
    var atester = [id]
    var testees = []
    while (atester.length>0){
        var test = atester.shift()
        if (map[test]==patternebase){
            testees.push(test)
            for (var z of casesAdjacentes(test,width,height)){
                if (!testees.includes(z) && !atester.includes(z)){
                atester.push(z)
                }
            }
        }
    }
    

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

function reloadMap(){
    console.log("reloading map")
    width = parseInt(document.getElementById("height").value)
    height = parseInt(document.getElementById("width").value)
    map = []
    document.getElementById("jeu").innerHTML=""
    créerDamier(width,height,16)
    appelsAjoutTextures()
    
    for (var z=0;z<width*height;z++){
        map.push("plaine")
        fill(z,"url(plaine_1-pattern)")
    }
    remplirSceau(0)


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
boardNeutree = {}
boardBeotie = {}
boardArgolide = {}
boardAttique = {}

document.addEventListener("DOMContentLoaded", function () {

    document.querySelector('.accueil').style.display = 'none';
    document.querySelector('.partie').style.display = 'block';
    socket.on("map",data=>{
        console.log(data)
        width = data.width;height = data.height
        créerDamier(data.height,data.width,16)
        
        appelsAjoutTextures();
        actualiserDamier(data.width,data.height,data.terrain)
        
        map = []
        for (z of data.infos){map.push(z.type)}
    })



    var select = document.getElementById("uniSelec");
    unites.forEach(uni => {
        const option = document.createElement("option");
        option.value = uni;
        option.textContent = uni.charAt(0).toUpperCase() + uni.slice(1); 
        select.appendChild(option);
      });






});
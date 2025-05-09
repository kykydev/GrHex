
const socket = io();



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
    "beotie": 1,
    "attique": 2,
    "argolide": 3
}
var clustersMiniers = {
    copper:[],
    tin:[]
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
        if (mode=="removeuni"){enleverUnit(id)}
        if (mode=="paint"){
            peindre(id)
        }
        if (mode=="placeUnit"){
            addUnit(document.getElementById("uniSelec").value,id,document.getElementById("citeSelec").value)
        }
        if (mode=="copper"){ajoutCopper(id)}
        if (mode=="tin"){ajoutTin(id)}
        if (mode=="removeMinerai"){enleverMinerai(id)}
   
             
        if (mode=="posArgolide"){
            positionsDépart["argolide"]=id
            document.getElementById("posArgolide").innerText=("Argolide: "+positionsDépart["argolide"])
            addUnit("stratege",id,"argolide")
            
        }     
        if (mode=="posBeotie"){
            positionsDépart["beotie"]=id
            document.getElementById("posBeotie").innerText=("Beotie: "+positionsDépart["beotie"])
            addUnit("stratege",id,"beotie")
        }
        if (mode=="posAttique"){
            positionsDépart["attique"]=id
            document.getElementById("posAttique").innerText=("Attique: "+positionsDépart["attique"])
            addUnit("stratege",id,"attique")
        }

    }


function hoveur(id){
        if (isDown==false){return}
        if (mode=="paint"){peindre(id)}
        if (mode=="copper"){ajoutCopper(id)}
        if (mode=="tin"){ajoutTin(id)}
        if (mode=="removeMinerai"){enleverMinerai(id)}
        if (mode=="placeUnit"){addUnit(document.getElementById("uniSelec").value,id,document.getElementById("citeSelec").value)
        if (mode=="removeuni"){enleverUnit(id)}
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
    var dataenvoi = {
        "nom":document.getElementById("nomMap").value,
        "height":height,
        "width":width,
        "clustersMiniers": clustersMiniers,
        "positionsDépart": positionsDépart,
        "boards": {
            "boardNeutre": boardNeutre,
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
        }
    //socket.emit("saveçastp",dataenvoi)
    sauvegarder(dataenvoi)
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
function X(){
    console.log("choisi x")
    outil= "X"
}

function paint(){
    mode="paint"
}
function copper(){
    mode="copper"
}
function tin(){
    mode="tin"
}
function removeMinerai(){
    mode="removeMinerai"
}
function removeUni(){
    mode="removeuni"
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

function peindreMine(id){
        if (clustersMiniers.tin.includes(id)){d3.select("#h" + id).style("filter", " opacity(0.6) grayscale(100%) brightness(85%) contrast(110%) sepia(20%) saturate(80%)");}
        else{if (clustersMiniers.copper.includes(id)){d3.select("#h" + id).style("filter", " opacity(0.6) sepia(100%) saturate(500%) hue-rotate(-20deg) brightness(90%) contrast(120%)");}
        else{d3.select("#h" + id).style("filter", "");console.log("azer")
        }}
    }
function enleverMinerai(id){
    console.log(id)
    for (var z in clustersMiniers.copper){
        if (clustersMiniers.copper[z]==id){clustersMiniers.copper.splice(z,1);console.log("a");}
    }
    for (var z in clustersMiniers.tin){
        if (clustersMiniers.tin[z]==id){clustersMiniers.tin.splice(z,1);console.log("b");}
    }
    peindreMine(id)
}

function enleverUnit(id){
    delete boardNeutre[id]
    delete boardArgolide[id]
    delete boardBeotie[id]
    delete boardAttique[id]
    dessinUnis()
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
        case "X":
            patterne = "";
            terrain = "X";
            break;

        default:
            console.warn("Unknown tool selected:", outil);
            return; 
    } 
    fill(id, `url(#${patterne})`);                
    if (map.length > id) {
        map[id] = terrain;
    }
    peindreMine(id)
}

function ajoutCopper(id){
    if (clustersMiniers.copper.includes(id)){return}
    clustersMiniers.copper.push(id)
    peindreMine(id)
}


function ajoutTin(id){
    if (clustersMiniers.tin.includes(id)){return}
    clustersMiniers.tin.push(id)
    peindreMine(id)
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
    créerDamier(height,width,16)
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

function dataToMap(data){
    var saved = data
    for (var z of Object.keys(saved.boards.beotie)){
      if (saved.boards.beotie[z]=="mur"){
        delete saved.boards.beotie[z]
        saved.boards.mursBeotie.push(z)
      }
      if (saved.boards.beotie[z]=="hôtel de ville"){
        delete saved.boards.beotie[z]
        saved.boards.hdvBeotie.push(z)
      }
      if (saved.boards.beotie[z]=="bûcheron"){saved.boards.beotie[z]="bucheron"}
    }
      
      
      for (var z of Object.keys(saved.boards.argolide)) {
        if (saved.boards.argolide[z] == "mur") {
          delete saved.boards.argolide[z];
          saved.boards.mursArgolide.push(z);
        }
        if (saved.boards.argolide[z] == "hôtel de ville") {
          console.log("aaaaa")
          delete saved.boards.argolide[z];
          saved.boards.hdvArgolide.push(z);
        }
        if (saved.boards.argolide[z]=="bûcheron"){saved.boards.argolide[z]="bucheron"}
      }

      for (var z of Object.keys(saved.boards.attique)) {
        if (saved.boards.attique[z] == "mur") {
          delete saved.boards.attique[z];
          saved.boards.mursAttique.push(z);
        }
        if (saved.boards.attique[z] == "hôtel de ville") {
          delete saved.boards.attique[z];
          saved.boards.hdvAttique.push(z);
        }
        if (saved.boards.attique[z]=="bûcheron"){saved.boards.attique[z]="bucheron"}

      }

    



    saved.map[saved.positionsDépart["beotie"]]="plaine"
    saved.boards.beotie[saved.positionsDépart["beotie"]]="stratege"
    
    saved.map[saved.positionsDépart["argolide"]]="plaine"
    saved.boards.argolide[saved.positionsDépart["argolide"]]="stratege"
    
    saved.map[saved.positionsDépart["attique"]]="plaine"
    saved.boards.attique[saved.positionsDépart["attique"]]="stratege"
    return saved
}

function sauvegarder(data){
  var saved = dataToMap(data)




var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(saved,null,2));
var dlAnchorElem = document.getElementById('downloadAnchorElem');
dlAnchorElem.setAttribute("href",     dataStr     );
dlAnchorElem.setAttribute("download", data.nom+".json");
dlAnchorElem.click();
}

//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------
//------------------------------TESTS---------------------------------------------------------------
//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------

var map = []
boardNeutre = {}
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
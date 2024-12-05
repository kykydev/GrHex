const bod = document.body

document.addEventListener("DOMContentLoaded", function () {

    width=15
    height=10
    créerDamier(height,width,20)
    

    var terrain = []

    for (var i=0;i<width*height;i++){
        terrain.push("plaine")
    }

    console.log(terrain)
    actualiserDamier(width,height,terrain)




    
    function casesAdjacentes(pos, width, height) {
        var adj = [pos];
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



        return adj; 
    }
    



 



    console.log(casesAdjacentes(33,width,height))













});


//-------------------Création Hexagone sous forme de tableau de points----------------------------------------
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
                .attr("stroke", "black")
                .attr("fill", "url(./HEX/prairie_1.jpg)")
                .attr("id", "h" + (l * nbColumns + c));



        }
    }
}




//Coloriage d'un hexagone
function fill(id,couleur){
    d3.select(("#h"+id)).attr("fill", couleur);
}
//Coloriage du damier

function actualiserDamier(longueur,largeur,jeu){


for (i=0;i<longueur*largeur;i++){
    var color="aliceblue";
if (jeu[i]=="eau"){color="DodgerBlue";}
if (jeu[i]=="rocher"){color="darkgray"}
if (jeu[i]=="montagne"){color="brown"}
if (jeu[i]=="plaine"){color="lightgreen";}//lightgreen
if (jeu[i]=="pasteque"){color ="lightcoral"}

fill(i,color)
}
}

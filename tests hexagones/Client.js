
const bod = document.body


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








function casesAdjacentes(pos, width, height) {
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



    return adj; 
}


//The following functions respectively return the X and Y coordinates and [X,Y] as a table with pos being the number of the hexagon (id) and height the height of a column
function getX(pos,height){return Math.floor(pos/height);}
function getY(pos,height){return pos%height}
function getCoords(pos,height){return [getX(pos,height),getY(pos,height)]}

function canCross(pos,jeu){//Basis for the function that will tell whether an hexagon can be crossed by another or not. Will have variants for certain units
    if (jeu[pos]=="montagne"){return false}
    if (jeu[pos]=="eau"){return false}
    return true
}   


function offset_to_cube(pos,height){//This function will convert our hexagon's coordinates from the X-Y ones to cube ones, allowing for more complex algorithms to be used
    var q = getX(pos,height) - (getY(pos,height) - (getY(pos,height)&1)) / 2
    var r = getY(pos,height)
    return [q, r, -q-r]
}

function distance(pos1,pos2,height){
    var cube1 = offset_to_cube(pos1,height)
    var cube2 = offset_to_cube(pos2,height)
    vec = [cube1[0]-cube2[0],cube1[1]-cube2[1],cube1[2]-cube2[2]]
    return Math.max(Math.abs(vec[0]),Math.abs(vec[1]),Math.abs(vec[2]))
}

/*
function pathFind(pos1,pos2,height,width,rules){//pos1 and pos2 are hexagon ID's, height and width are the grid's dimensions, rules is a table of "O"'s and "X"'s where the X's represent obstacles
path = []//Return path, will be composed of hexagons identified by indexes

var open = [[pos1,0,distance(pos1,pos2,height),distance(pos1,pos2,height)]]//Hexagons will be represented as follows: [index,g,h,f], with g the distance to start, h the distance to destination and f=g+h
var closed = []
while (open.length>0){
console.log(closed)
    current = open[0]
    fill(open[0][0],"red")
    open.splice(0,1)
    for (test of casesAdjacentes(current[0],width,height)){
        //CREATION DU TABLEAU DE L HEXAGONE PUIS JE CHECK SI IL EST DEDANS POUR ECONOMISER DES RESSOURCES
        let g = current[1];let h=distance(test,pos2,height);let f=g+h
        let ajouted = [test,g,h,f]
        if (test==pos2){console.log("aaa")}
        if (rules[test]!="O"){
            if (!closed.includes(ajouted)){
                console.log(ajouted)
                var inopen = false
                for (j of open){
                    if (j[0]==ajouted[0]){
                        if (j[1]<ajouted[1]+1){
                            j[1]=ajouted[1]+1                     
                            inopen=true
                        }
                    }
                    if (!inopen){
                    open.push(ajouted)
                    fill(ajouted[0],"green")
                }

            }
        }
        
    }
    
    
}
closed.push(current)
}
return false//Case where the path to the target does't exist
}
*/







//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------
//------------------------------TESTS--------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {

    width=15
    height=10
    créerDamier(height,width,25)
    

    var terrain = []

    for (var i=0;i<width*height;i++){
        terrain.push("plaine")
    }

    console.log(terrain)
    actualiserDamier(width,height,terrain)
 

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

});
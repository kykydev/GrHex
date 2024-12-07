


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


function pathFind(pos1,pos2,height,width,rules){//pos1 and pos2 are hexagon ID's, height and width are the grid's dimensions, rules is a table of "O"'s and "X"'s where the X's represent obstacles
path = []//Return path, will be composed of hexagons identified by indexes

var open = [[pos1,0,distance(pos1,pos2,height),distance(pos1,pos2,height)]]//Hexagons will be represented as follows: [index,g,h,f], with g the distance to start, h the distance to destination and f=g+h
var closed = []
while (open.length>0){
    current = open[0]//Take the first open case
    closed.push(current)
    open.splice(0,1)

    for (test of casesAdjacentes(current[0],width,height)){
        
        //CREATION DU TABLEAU DE L HEXAGONE PUIS JE CHECK SI IL EST DEDANS POUR ECONOMISER DES RESSOURCES
        let g = current[1]+1;let h=distance(test,pos2,height);let f=g+h
        let ajouted = [test,g,h,f]

                    if (test==pos2){//End of algorithm, calculation of solution
                        var path = [test]
                        lastTile = ajouted
                        while (path[path.length-1]!=pos1){
                            aj = casesAdjacentes(lastTile[0],width,height)
                            for (j of closed){
                                if (j[1]==lastTile[1]-1 && aj.includes(j[0])){
                                    path.push(j[0])
                                    lastTile = j
                            }
                        }
                    }
                    return path.reverse()
                }
        
        let inclosed = false
        for (j of closed){
            if (j[0]==test){
                inclosed = true
            }
        }

        if (!inclosed){//If case is already closed, we ignore it
        if (rules[test]=="O"){
                var inopen = false
                for (j of open){//checking if it's already in open and, if so, updating the values
                    if (j[0] == ajouted[0]) {
                        if (j[1] < ajouted[1] + 1) {
                            j[1] = ajouted[1] + 1
                            j[3]=j[1]+j[2]
                            inopen = true
                        }
                    }
                }
                    if (!inopen){
                    open.push(ajouted)
                }
        
    }
}
}
open.sort((a, b) => {if (a[3] !== b[3]) {return a[3] - b[3];} else{return a[2] - b[2];}});
  
}
return false//Case where the path to the target does't exist
}





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


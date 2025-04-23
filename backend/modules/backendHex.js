const {MinHeap} = require("../classes/MinHeap")



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



function getX(pos,height){return Math.floor(pos/height);}
function getY(pos,height){return pos%height}
function getCoords(pos,height){return [getX(pos,height),getY(pos,height)]}




function offset_to_cube(pos,height){
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





function pathFind(pos1, pos2, height, width, rules) {
    let open = new MinHeap((a, b) => a.f - b.f); 
    let closed = new Set(); 
    let vientDe = {};

    open.insert({ pos: pos1, g: 0, h: distance(pos1, pos2, height), f: distance(pos1, pos2, height) });

    while (!open.isEmpty()) {
        let current = open.extractMin(); 
        let { pos, g } = current;

        if (pos === pos2) {

            let path = [];
            let currentPos = pos2;
            while (currentPos !== undefined) {
                path.push(currentPos);
                currentPos = vientDe[currentPos];
            }
            return path.reverse(); 
        }

        closed.add(pos);

        for (let neighbor of casesAdjacentes(pos, width, height)) {
            if (closed.has(neighbor) || rules[neighbor] == "X") {
                continue; 
            }

            let tentativeG = g + rules[neighbor];
            let h = distance(neighbor, pos2, height);
            let f = tentativeG + h;

            let existing = open.find(n => n.pos === neighbor);
            if (existing && tentativeG >= existing.g) {
                continue;
            }

            vientDe[neighbor] = pos; 
            open.insert({ pos: neighbor, g: tentativeG, h, f });
        }
    }

    return false; //Pire des cas: pas de route
}





module.exports = {
    casesAdjacentes,getX,getY,getCoords,offset_to_cube,distance,pathFind
  };
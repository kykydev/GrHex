const {hexagon,forestHexagon,clairiereHexagon} = require("../classes/hexagon")
const { casesAdjacentes, getX, getY, getCoords, offset_to_cube, distance, pathFind } = require('./backendHex');


const plainvariants = 4//Number of different plains, for randomization
const forestvariants = 4
const nbclairiere = 3
const maxTrees = 3

function baseGreenMap(width,height){
    map = []
for (var j=0;j<width*height;j++){
    variant = Math.floor(Math.random()*plainvariants+1)
    map.push(new hexagon("plaine","plaine_"+variant,j))
}
    return map
}

function addMontagne(width,height){

    var soldeMontagnes = Math.floor(random()*((width*height)/15))

    while (soldeMontagnes>0){
        var pos =  Math.floor(random()*((width*height)))
        var soldeExtension = Math.floor(random()*10+1)
        replacing = [pos]
        while (soldeExtension>0 ){
           for (z of replacing){
                for (zz of casesAdjacentes(z,width,height)){
                    if (random()<0.3){
                        soldeExtension-=1
                        replacing.push(zz)
                    }
                }
           }
        }

        for (z in replacing){
            if (map[z].type=="plaine"){
                map[z] = new hexagon("montagne","montagne",pos)
                soldeMontagnes=soldeMontagnes-1
            }
        }



    }




    }


function addForest(width,height){
return
}

function addRivers(width,height){//Adds rivers using pathfinding
return
}

function simplifyMap(map){
    retour = []
    for (j of map){
        retour.push(j.pattern)
    }
    return retour
}


function createMap(width,height){
map = baseGreenMap(width,height)
map = addMontagne(width,height,map)



return {"infos":map,"terrain":simplifyMap(map),"height":height,"width":width}

}


module.exports = {
    createMap: createMap,
}




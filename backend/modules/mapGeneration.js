const {hexagon,forestHexagon,carriereHexagon} = require("../classes/hexagon")
const { casesAdjacentes, getX, getY, getCoords, offset_to_cube, distance, pathFind } = require('./backendHex');


const plainvariants = 4//Number of different plains, for randomization
const forestvariants = 4
const nbcarriere = 3
const maxTrees = 3

function baseGreenMap(width,height){
    map = []
for (var j=0;j<width*height;j++){
    variant = Math.floor(Math.random()*plainvariants+1)
    map.push(new hexagon("plaine","plaine_"+variant,j))
}
    return map
}

function addMontagne(width,height,cart){
    map = []
    for (j of cart){map.push(j)}

    var soldeMontagnes = Math.floor(Math.random()*((width*height)*0.02)+(width*height)*0.05)
    while (soldeMontagnes>0){
        var pos =  Math.floor(Math.random()*((width*height)))
        var soldeExtension = Math.floor(Math.random()*((width*height)*0.01)+1)
        replacing = [pos]
        //create a clutter
        while (soldeExtension>0){
            let selectcase = replacing[Math.floor(Math.random()*(replacing.length))]
            let potcases = casesAdjacentes(selectcase,width,height)
        let added=potcases[Math.floor(Math.random()*(potcases.length))]
        if (!replacing.includes(added)){
            replacing.push(added)
            soldeExtension-=1
        }
        }
        
       for (z of replacing){
            if (soldeMontagnes<1){break}
            if (map[z].type=="plaine"){
                map[z] = new hexagon("montagne","montagne",z)
                soldeMontagnes=soldeMontagnes-1
            }
        }
        
    }

    
    for (z in map){
        if (map[z].type=="montagne"){
           gargl = casesAdjacentes(z,width,height)
            for (zz of gargl){
                if (map[zz].type=="plaine"){
                    map[zz] = new carriereHexagon(pos)
                }
                }
            }
        }
    


    return map

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




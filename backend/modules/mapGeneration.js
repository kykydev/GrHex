const {hexagon,forestHexagon,carriereHexagon} = require("../classes/hexagon")
const { casesAdjacentes, getX, getY, getCoords, offset_to_cube, distance, pathFind } = require('./backendHex');

const mapBase = ['plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','plaine','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','plaine','plaine','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','plaine','plaine','plaine','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','eau','plaine','plaine','plaine','plaine','plaine','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','eau','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','plaine','eau','plaine','plaine','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','eau','eau','eau','eau','plaine','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','eau','eau','eau','eau','plaine','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','plaine','eau','eau','plaine','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','plaine','plaine','eau','plaine','plaine','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','plaine','eau','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','plaine','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','eau','eau','eau','eau','eau','eau','eau','eau','eau','eau','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine','plaine',]
const mapWidth = 40 //width of the current mal
const mapHeight = 30 //height of the current map

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

    var soldeMontagnes = Math.floor(Math.random()*((width*height)*0.013)+(width*height)*0.05)
    while (soldeMontagnes>0){
        var pos =  Math.floor(Math.random()*((width*height)))
        var soldeExtension = Math.floor(Math.random()*((width*height)*0.005)+1)
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
                    if (Math.random()<0.3){
                    map[zz] = new carriereHexagon(zz)
                    }
                }
                }
            }
        }
    


    return map

    }


function addForest(width,height,cart){

    map = []
    for (j of cart){map.push(j)}

    var soldeForet = Math.floor(Math.random()*((width*height)*0.02)+(width*height)*0.20)
    while (soldeForet>0){
        var pos =  Math.floor(Math.random()*((width*height)))
        var soldeExtension = Math.floor(Math.random()*((width*height)*0.02)+2)
        replacing = [pos]
        //create a clutter
        while (soldeExtension>0){
            let selectcase = replacing[Math.floor(Math.random()*(replacing.length))]
            let potcases = casesAdjacentes(selectcase,width,height)
        let added=potcases[Math.floor(Math.random()*(potcases.length))]
        if (!replacing.includes(added)){
            replacing.push(added)
        }
        soldeExtension-=1
        }
        
       for (z of replacing){
            if (map[z].type=="plaine"){
                map[z] = new forestHexagon(z)
                soldeForet--
            }
        }
        
    }


return map



}

function addWater(width,height,cart){//Adds rivers using pathfinding

    riverCount = 6

    merStarts = [0,height,width*(height-1)-1,width*height-1]

    merPos = []
    map = []
    for (j of cart){map.push(j)}

        var pos =  merStarts[Math.floor(Math.random()*merStarts.length+1)]
        var soldeMer = Math.floor(((width*height)*0.2)+2)
        replacing = [pos]
        while (soldeMer>0){
            let selectcase = replacing[Math.floor(Math.random()*(replacing.length))]
            let potcases = casesAdjacentes(selectcase,width,height)
        let added=potcases[Math.floor(Math.random()*(potcases.length))]
        if (!replacing.includes(added)){
            replacing.push(added)
        }
        soldeMer-=1
        }
        
       for (z of replacing){
                map[z] = new hexagon("eau","eau",z)
                merPos.push(z)
        }
        
    
        fausseCarte = []
        for (z in map){
            if (map[z].type=="montagne"||map[z].type=="carriere"||map[z].type=="foret"){
                fausseCarte.push(["X"])
        }
        else{
            fausseCarte.push("O")
        }
    }

    var possibleGoals = []//Will contain all of the lake hexagons and border hexagons. This table is the possible destinations for a river

//---------------------Creating lakes

var soldeLac = Math.floor((width*height)*0.06)
while (soldeLac>0){
    var pos =  Math.floor(Math.random()*((width*height)))
    if (map[pos].type!="eau"){
    var soldeExtension = Math.floor(Math.random()*((width*height)*0.01)+((width*height)*0.01))
    replacing = [pos]
    //create a clutter
    while (soldeExtension>0){
        let selectcase = replacing[Math.floor(Math.random()*(replacing.length))]
        let potcases = casesAdjacentes(selectcase,width,height)
    let added=potcases[Math.floor(Math.random()*(potcases.length))]
    if (!replacing.includes(added)){
        replacing.push(added)
    }
    soldeExtension-=1
    }
    
   for (z of replacing){
        if (map[z].type!="montagne"){
            map[z] = new hexagon("eau","eau",z)
            possibleGoals.push(z)
            merPos.push(z)
            soldeLac--
        }
    }
    }
}




//--------------Adding fake mountains

    for (var z=0;z<8;z++){
        var pos =  Math.floor(Math.random()*map.length+1)
        var solde = Math.floor(((width*height)*0.04)+2)
        replacing = [pos]
        while (solde>0){
            let selectcase = replacing[Math.floor(Math.random()*(replacing.length))]
            let potcases = casesAdjacentes(selectcase,width,height)
        let added=potcases[Math.floor(Math.random()*(potcases.length))]
        if (!replacing.includes(added)){
            replacing.push(added)
            solde-=1
        }
        }
        
       for (z of replacing){
            fausseCarte[z]="X"
            }
    }


    while (riverCount>0){
        let depart = merPos[Math.floor(Math.random()*merPos.length+1)]
        let arrive = possibleGoals[Math.floor(Math.random()*possibleGoals.length+1)]
        if (distance(depart,arrive,height)>0 &&(distance(depart,arrive,height)<height/1.3)){
            let route = pathFind(depart,arrive,height,width,fausseCarte)
            if (route!=false){
                for (z of route){
                    map[z] = new hexagon("eau","eau",z)
                    merPos.push(z)
                }
                riverCount--
            }
        }
        
        
    }
    
    
    
    
    



return map
}

function simplifyMap(map){
    retour = []
    for (j of map){
        retour.push(j.pattern)
    }
    return retour
}


function createMap(){
map = []
index = 0
for (z of mapBase){
    let hex
    switch (z){
        case "plaine":
            hex = new hexagon("plaine","plaine_"+Math.floor(Math.random()*plainvariants+1),index)
        break
        case "montagne":
            hex = new hexagon("montagne","montagne",index)
        break
        case "eau":
            hex = new hexagon("eau","eau",index)
        break
        case "carriere":
            hex = new carriereHexagon(index)
        break
        case "foret":
            hex = new forestHexagon(index)
        break



    }
    map.push(hex)
    index++
}

map = addMontagne(mapWidth,mapHeight,map)
map = addForest(mapWidth,mapHeight,map)
/*
map = baseGreenMap(width,height)
map = addWater(width,height,map)
*/
return {"infos":map,"terrain":simplifyMap(map),"height":mapHeight,"width":mapWidth}

}


module.exports = {
    createMap: createMap,
}




const plainvariants = 4//Number of different plains, for randomization
const forestvariants = 4
const carrierevariants = 3
const maxTrees = 3


class hexagon {
    constructor(type,pattern,pos) {
    this.type=type;
    this.pos=pos;
    this.pattern=pattern
    }
}


class forestHexagon extends hexagon{

constructor(pos){
    let arbres = Math.floor(Math.random()*maxTrees+1)
    super("foret","foret"+arbres+"_"+Math.floor(Math.random()*forestvariants+1),pos)
    this.nbTrees=arbres
}
}
class carriereHexagon extends hexagon{

    constructor(pos){
        super("carriere","carriere_"+Math.floor(Math.random()*carrierevariants+1),pos)
        this.nbstone=Math.floor(Math.random(5)+2)
    }
    
}



module.exports = { hexagon,forestHexagon,carriereHexagon };

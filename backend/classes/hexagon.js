class hexagon {
    constructor(type,pattern,pos) {
    this.type=type;
    this.pos=pos;
    this.pattern=pattern
    }
}


class forestHexagon extends hexagon{

constructor(type,pattern,nbTrees,pos){
    super(type,pattern,pos)
    this.nbTrees=nbTrees
}
}
class clairiereHexagon extends hexagon{

    constructor(type,pattern,nbstone,pos){
        super(type,pattern,pos)
        this.nbstone=nbstone
    }
    
}



module.exports = { hexagon,forestHexagon,clairiereHexagon };

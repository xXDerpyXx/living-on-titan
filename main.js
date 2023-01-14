var settings = {
    groundLevel:40,
    width:80,
    height:80,
    depth:80,
    tileSize:8,
    smoothness:3,
    variation:10,
    offset:-1
}

var c = document.getElementById("mainCanvas");
var ctx = c.getContext("2d");

class tile{
    constructor(_x,_y,_z){
        this.texture = null;
        this.stopDraw = true;
        this.x = _x;
        this.y = _y;
        this.z = _z;
    }

    draw(darkness){
        if(this.texture == null){
            return;
        }
        if(darkness == null){
            darkness = 0;
        }
        var img = document.getElementById(this.texture);
        ctx.drawImage(img,this.x*settings.tileSize,this.y*settings.tileSize,settings.tileSize,settings.tileSize);
        ctx.fillStyle = "rgba(0,0,0,"+darkness+")";
        ctx.fillRect(this.x*settings.tileSize,this.y*settings.tileSize,settings.tileSize,settings.tileSize);
    }
}

function oob(x,y){
    if(x > settings.width-1 || x < 0 || y < 0 || y > settings.height-1){
        return true;
    }
    return false;
}

function generateMap(width,height,depth){
    var gen = [];
    for(var x = 0; x < width; x++){
        gen[x] = [];
        for(var y = 0; y < height; y++){
            gen[x][y] = (settings.groundLevel+((Math.random()*(settings.variation*2))-settings.variation))+settings.offset;
        }
    }
    for(var k = 0; k < settings.smoothness; k++){
        for(var x = 0; x < width; x++){
            for(var y = 0; y < height; y++){
                total = 0;
                countedTiles = 0;
                for(var ix = -1; ix < 2; ix++){
                    for(var iy = -1; iy < 2; iy++){
                        if(!oob(x+ix,y+iy)){
                            countedTiles++;
                            total+=gen[x+ix][y+iy]
                        }
                    }
                }
                gen[x][y] = (gen[x][y]+(total/countedTiles))/2;
            }
        }
    }
    

    var m = [];
    for(var x = 0; x < width; x++){
        m[x] = [];
        for(var y = 0; y < height; y++){
            m[x][y] = [];
            for(var z = 0; z < depth; z++){
                m[x][y][z] = new tile(x,y,z);
                if(z > gen[x][y]){
                    m[x][y][z].texture = "organic-sand";
                }else if(z > settings.groundLevel){
                    m[x][y][z].texture = "liquid-methane";
                    m[x][y][z].stopDraw = false;
                }
                
                if(z > depth-2){
                    m[x][y][z].texture = "basalt";
                }
            }
        }
    }
    return m;
}

var cameraDepth = settings.groundLevel-5

function drawAll(){
    for(var x = 0; x < settings.width; x++){
        for(var y = 0; y < settings.height; y++){
            var z = 0;
            for(z = 0; z < settings.height; z++){
                if(map[x][y][z].texture != null){
                    if(map[x][y][z].stopDraw)
                        break;
                }
            }

            for(z = z; z > cameraDepth; z--){
                if(map[x][y][z].texture != null){
                    map[x][y][z].draw((z-cameraDepth)/20);
                }
            }
        }
    }
}

function updateAll(){
    newMap = map;
    for(var x = 0; x < settings.width; x++){
        for(var y = 0; y < settings.height; y++){
            for(var z = 0; z < settings.depth; z++){
                
            }
        }
    }
    map = newMap;
}

var map = generateMap(settings.width,settings.height,settings.depth)

document.addEventListener("wheel", (event) => {
    console.log(event.deltaY);
    cameraDepth += event.deltaY/100

});

setInterval(drawAll,200);
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

class astronaut{
    constructor(_x,_y,_z){
        this.x = _x;
        this.y = _y;
        this.z = _z;
        this.dx = _x; 
        this.dy = _y;
        this.dz = _z;
        this.progress = 0;
    }
    
    draw(){
        var img = document.getElementById("astronaut");
        ctx.drawImage(img,(((this.x*(this.progress/100))+(this.dx*(1-(this.progress/100)))))*settings.tileSize,(((this.y*(this.progress/100))+(this.dy*(1-(this.progress/100)))))*settings.tileSize,settings.tileSize,settings.tileSize);
    }

    update(){
        if(this.progress > 0){
            this.progress-=10;
            if(this.progress <= 0){
                this.x = this.dx;
                this.y = this.dy;
                this.z = this.dz;
                this.progress = 0;
            }
        }else{
            var nx = 0;
            var ny = 0;
            var nz = 0;
            if(map[this.x][this.y][this.z+1].texture == null){
                nz++;
            }else{
                var r = Math.random();
                if(r < 0.25){
                    nx = 1;
                }else if(r < 0.5){
                    ny = 1;
                }else if(r < 0.75){
                    nx = -1;
                }else{
                    ny = -1;
                }

            }
            if(!oob(this.x+nx,this.y+ny)){
                if(map[this.x+nx][this.y+ny][this.z].texture == null){
                    this.dx += nx;
                    this.dy += ny;
                    this.dz += nz;
                    this.progress = 100;
                }else{
                    if(map[this.x+nx][this.y+ny][this.z-1].texture == null){
                        nz--;
                        this.dx += nx;
                        this.dy += ny;
                        this.dz += nz;
                        this.progress = 100;
                    }
                }
            }
        }
        
    }
}

var waterupdate = function(){

}

class tile{
    constructor(_x,_y,_z){
        this.texture = null;
        this.stopDraw = true;
        this.x = _x;
        this.y = _y;
        this.z = _z;
    }

    update(){
        return;
    }

    draw(darkness){
        if(this.texture == null){
            return;
        }
        if(darkness == null){
            darkness = 0;
        }
        var hidden = false;
        if(this.z > 0){
            if(map[this.x][this.y][this.z-1].texture != null){
                if(map[this.x][this.y][this.z-1].stopDraw){
                    ctx.fillStyle = "rgb(0,0,0)";
                    ctx.fillRect(this.x*settings.tileSize,this.y*settings.tileSize,settings.tileSize,settings.tileSize);
                    hidden = true;
                }
            }
        }
        if(!hidden){
            var img = document.getElementById(this.texture);
            ctx.drawImage(img,this.x*settings.tileSize,this.y*settings.tileSize,settings.tileSize,settings.tileSize);
            ctx.fillStyle = "rgba(0,0,0,"+darkness+")";
            ctx.fillRect(this.x*settings.tileSize,this.y*settings.tileSize,settings.tileSize,settings.tileSize);
        }
        
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

            if(z <= cameraDepth){
                xnudge = 0;
                xmargin = 0;
                ynudge = 0;
                ymargin = 0;
                wallThickness = 2;
                if(z == cameraDepth){
                    map[x][y][z].draw();
                    if(!oob(x+1,y)){
                        if(map[x+1][y][z].texture == null){
                            xnudge -= wallThickness;
                        }
                    }
                    if(!oob(x-1,y)){
                        if(map[x-1][y][z].texture == null){
                            xnudge -= wallThickness;
                            xmargin += wallThickness;
                        }
                    }

                    if(!oob(x,y+1)){
                        if(map[x][y+1][z].texture == null){
                            ynudge -= wallThickness;
                        }
                    }
                    if(!oob(x,y-1)){
                        if(map[x][y-1][z].texture == null){
                            ynudge -= wallThickness;
                            ymargin += wallThickness;
                        }
                    }
                }
                ctx.fillStyle = "rgb(0,0,0)";
                ctx.fillRect((x*settings.tileSize)+xmargin,(y*settings.tileSize)+ymargin,settings.tileSize+xnudge,settings.tileSize+ynudge);
                hidden = true;
            }

            for(z = z; z > cameraDepth; z--){
                if(map[x][y][z].texture != null){
                    map[x][y][z].draw((z-cameraDepth)/20);
                }
            }
                
            
        }
    }
    for(var i = 0; i < astronauts.length; i++){
        astronauts[i].draw();
    }

    
}

function updateAll(){
    for(var x = 0; x < settings.width; x++){
        for(var y = 0; y < settings.height; y++){
            for(var z = 0; z < settings.depth; z++){
                map[x][y][z].update();
            }
        }
    }
    for(var i = 0; i < astronauts.length; i++){
        astronauts[i].update();
    }
}

var map = generateMap(settings.width,settings.height,settings.depth)
var astronauts = [];



document.addEventListener("wheel", (event) => {
    console.log(event.deltaY);
    cameraDepth += event.deltaY/100

});

for(var i = 0; i < 100; i++){
    astronauts.push(new astronaut(20,20,15));
}

setInterval(drawAll,50);
setInterval(updateAll,100)
for(var i = 0; i < 1000; i++){
    updateAll();
}
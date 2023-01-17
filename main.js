var settings = {
    groundLevel:120,
    width:80,
    height:80,
    depth:160,
    tileSize:16,
    smoothness:6,
    variation:10,
    offset:0,
    caveCount:10,
    meteors:3,
    nitrogenDeposits:10
}

var c = document.getElementById("mainCanvas");
var ctx = c.getContext("2d");

var waterupdate = function(ref){
    var tempx = ref.x;
    var tempy = ref.y;
    var tempz = ref.z;
    if(map[tempx][tempy][tempz+1].type == null){
        var temp = map[tempx][tempy][tempz+1].type;
        map[tempx][tempy][tempz+1].type = map[tempx][tempy][tempz].type;
        map[tempx][tempy][tempz].type = temp;
    }else{
        var r = Math.random();
        if(!oob(tempx+1,tempy) && r < 0.25){
            if(map[tempx+1][tempy][tempz].type == null){
                var temp = map[tempx+1][tempy][tempz].type
                map[tempx+1][tempy][tempz].type = map[tempx][tempy][tempz].type
                map[tempx][tempy][tempz].type = temp;
            }
        }
        else if(!oob(tempx-1,tempy) && r < 0.5){
            if(map[tempx-1][tempy][tempz].type == null){
                var temp = map[tempx-1][tempy][tempz].type
                map[tempx-1][tempy][tempz].type = map[tempx][tempy][tempz].type
                map[tempx][tempy][tempz].type = temp;
            }
        }
        else if(!oob(tempx,tempy+1) && r < 0.75){
            if(map[tempx][tempy+1][tempz].type == null){
                var temp = map[tempx][tempy+1][tempz].type
                map[tempx][tempy+1][tempz].type = map[tempx][tempy][tempz].type
                map[tempx][tempy][tempz].type = temp;
            }
        }
        else if(!oob(tempx,tempy-1)){
            if(map[tempx][tempy-1][tempz].type == null){
                var temp = map[tempx][tempy-1][tempz].type
                map[tempx][tempy-1][tempz].type = map[tempx][tempy][tempz].type
                map[tempx][tempy][tempz].type = temp;
                return;
            }
        }
    }
    
}

var tileTypes = {
    organicSand:{
        stopDraw:true,
        texture:"organic-sand",
        update:function(){return;}
    },
    basalt:{
        stopDraw:true,
        texture:"basalt",
        update:function(){return;}
    },
    meteorite:{
        stopDraw:true,
        texture:"meteorite",
        update:function(){return;}
    },
    solidNitrogen:{
        stopDraw:false,
        texture:"solid-nitrogen",
        update:function(){return;}
    },
    liquidMethane:{
        stopDraw:false,
        texture:"liquid-methane",
        update:waterupdate
    },

}

var idtrack = 0;

function makePath(ax,ay,az,bx,by,bz){
    var active = [];
    var inactive = [];
    active.push([ax,ay,az,[]]);
    tempActive = []
    while(true){
        for(var i = active.length-1; i > 1;i--){
            var temp = active.pop();
            if(temp[0] == bx && temp[1] == by && temp[2] == bz){
                return temp[3]
            }
            
            if(map[temp[0]][temp[1]][temp[2]+1].type == null){
                temp[3].push([0,0,1]);
                tempActive.push([temp[0],temp[1],temp[2]+1,temp[3]]);
            }else{
                if(!oob(temp[0]+1,temp[1])){
                    if(map[temp[0]+1][temp[1]][temp[2]].type == null){
                        temp[3].push([1,0,0]);
                        tempActive.push([temp[0]+1,temp[1],temp[2],temp[3]]);
                        temp[3].pop();
                    }else{
                        if(map[temp[0]+1][temp[1]][temp[2]-1].type == null){
                            temp[3].push([1,0,-1]);
                            tempActive.push([temp[0]+1,temp[1],temp[2]-1,temp[3]]);
                            temp[3].pop();
                        }
                    }
                }

                if(!oob(temp[0]-1,temp[1])){
                    if(map[temp[0]-1][temp[1]][temp[2]].type == null){
                        temp[3].push([-1,0,0]);
                        tempActive.push([temp[0]-1,temp[1],temp[2],temp[3]]);
                        temp[3].pop();
                    }else{
                        if(map[temp[0]-1][temp[1]][temp[2]-1].type == null){
                            temp[3].push([-1,0,-1]);
                            tempActive.push([temp[0]-1,temp[1],temp[2]-1,temp[3]]);
                            temp[3].pop();
                        }
                    }
                }

                if(!oob(temp[0],temp[1]+1)){
                    if(map[temp[0]][temp[1]+1][temp[2]].type == null){
                        temp[3].push([0,1,0]);
                        tempActive.push([temp[0],temp[1]+1,temp[2],temp[3]]);
                        temp[3].pop();
                    }else{
                        if(map[temp[0]][temp[1]+1][temp[2]-1].type == null){
                            temp[3].push([0,1,-1]);
                            tempActive.push([temp[0],temp[1]+1,temp[2]-1,temp[3]]);
                            temp[3].pop();
                        }
                    }
                }

                if(!oob(temp[0],temp[1]-1)){
                    if(map[temp[0]][temp[1]-1][temp[2]].type == null){
                        temp[3].push([0,1,0]);
                        tempActive.push([temp[0],temp[1]-1,temp[2],temp[3]]);
                        temp[3].pop();
                    }else{
                        if(map[temp[0]][temp[1]-1][temp[2]-1].type == null){
                            temp[3].push([0,-1,-1]);
                            tempActive.push([temp[0],temp[1]-1,temp[2]-1,temp[3]]);
                            temp[3].pop();
                        }
                    }
                }
            }
            
            inactive.push(temp);
        }
        for(var i = 0; i < tempActive.length; i++){
            active.push(tempActive.pop());
        }
    }

}

class astronaut{
    constructor(_x,_y,_z){
        this.x = _x;
        this.y = _y;
        this.z = _z;
        this.dx = _x; 
        this.dy = _y;
        this.dz = _z;
        this.progress = 0;
        this.speed = 50;//((Math.round(Math.random()*10))+5)*10;
        this.path = [];
        this.id = idtrack;
        idtrack++;
        this.hand = null;
        this.inv = [];
    }
    
    draw(darkness){
        var img = document.getElementById("astronaut");

        

        ctx.drawImage(img,((((this.x*(this.progress/this.speed))+(this.dx*(1-(this.progress/this.speed)))))*settings.tileSize)+camerax,((((this.y*(this.progress/this.speed))+(this.dy*(1-(this.progress/this.speed)))))*settings.tileSize)+cameray,settings.tileSize,settings.tileSize);
        for(var i = 0; i < darkness; i++){
            img = document.getElementById("dark-astronaut");
            ctx.drawImage(img,((((this.x*(this.progress/this.speed))+(this.dx*(1-(this.progress/this.speed)))))*settings.tileSize)+camerax,((((this.y*(this.progress/this.speed))+(this.dy*(1-(this.progress/this.speed)))))*settings.tileSize)+cameray,settings.tileSize,settings.tileSize);
        }
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
            /*
            if(map[this.x][this.y][this.z+1].type == null){
                nz++;
                this.dx += nx;
                this.dy += ny;
                this.dz += nz;
                this.progress = 10;
                return;
            }*/

            if(this.path.length == 0){
                var rx = this.x+(Math.round(Math.random()*20)-10)
                var ry = this.x+(Math.round(Math.random()*20)-10)
                if(!oob(rx,ry)){
                    var rz = 0;
                    for(var i = 0; i < map.depth; i++){
                        if(map[rx][ry][i].type != null){
                            rz = i-1;
                            break;
                        }
                    }
                    this.path = makePath(this.x,this.y,this.z,rx,ry,rz)
                }
                return;
                var nx = 0;
                var ny = 0;
                var nz = 0;
                var fall = false;
                if(map[this.x][this.y][this.z+1].type == null){
                    nz++;
                    fall = true;
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
                    if(map[this.x+nx][this.y+ny][this.z].type == null){
                        this.dx += nx;
                        this.dy += ny;
                        this.dz += nz;
                        this.progress = this.speed;
                        if(fall){
                            this.progress = 10;
                        }
                    }else{
                        if(map[this.x+nx][this.y+ny][this.z-1].type == null){
                            nz--;
                            this.dx += nx;
                            this.dy += ny;
                            this.dz += nz;
                            this.progress = this.speed;
                            if(fall){
                                this.progress = 10;
                            }
                        }
                    }
                }
            }else{
                if(map[this.x+nx][this.y+ny][this.z+1].type == null){
                    this.path.pop()
                    this.dz = this.z+1;
                    this.progress = 10;
                }else{
                    var next = this.path.pop()
                    this.dx = next[0];
                    this.dy = next[1];
                    this.dz = next[2];
                    this.progress = this.speed;
                }
                
            }
        }
        
    }
}



class tile{
    constructor(_x,_y,_z){
        this.x = _x;
        this.y = _y;
        this.z = _z;
        this.type = null;
    }

    draw(darkness){
        if(this.type == null){
            return;
        }
        if(darkness == null){
            darkness = 0;
        }
        var hidden = false;
        if(this.z > 0){
            if(map[this.x][this.y][this.z-1].type != null){
                if(tileTypes[map[this.x][this.y][this.z-1].type].stopDraw){
                    ctx.fillStyle = "rgb(0,0,0)";
                    ctx.fillRect(this.x*settings.tileSize,this.y*settings.tileSize,settings.tileSize,settings.tileSize);
                    hidden = true;
                }
            }
        }
        //if(!hidden){
            var img = document.getElementById(tileTypes[this.type].texture);
            ctx.drawImage(img,(this.x*settings.tileSize)+camerax,(this.y*settings.tileSize)+cameray,settings.tileSize,settings.tileSize);
            ctx.fillStyle = "rgba(0,0,0,"+darkness+")";
            ctx.fillRect((this.x*settings.tileSize)+camerax,(this.y*settings.tileSize)+cameray,settings.tileSize,settings.tileSize);
        //}
        
    }
}

function oob(x,y){
    if(x > settings.width-1 || x < 0 || y < 0 || y > settings.height-1){
        return true;
    }
    return false;
}

function soob(x,y,z){
    if(x > settings.width-1 || x < 0 || y < 0 || y > settings.height-1 || z < 0 || z > settings.depth-1){
        return true;
    }
    return false;
}

function dist(ax,ay,az,bx,by,bz){
    return Math.sqrt(((ax-bx)*(ax-bx))+((ay-by)*(ay-by))+((az-bz)*(az-bz)));
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
                    m[x][y][z].type = "organicSand";
                }else if(z > settings.groundLevel){
                    m[x][y][z].type = "liquidMethane";
                }
                
                if(z > depth-2){
                    m[x][y][z].type = "basalt";
                }
            }
        }
    }
    var cavex = 0;
    var cavey = 0;
    var cavez = 0;
    var cavewidth = 5;
    var caveVector = [0,0,0];
    for(var i = 0; i < settings.caveCount; i++){
        caveVector[2] = (Math.random())-0.25;
        caveVector[1] = Math.random()-0.5;
        caveVector[0] = Math.random()-0.5;
        cavex = Math.round(Math.random()*(settings.width-2))+1;
        cavey = Math.round(Math.random()*(settings.height-2))+1
        if(Math.random() > 0.25)
            cavez = Math.round(gen[cavex][cavey]);
        else
            cavez = Math.round(gen[cavex][cavey]+(Math.random()*gen[cavex][cavey]));
        cavewidth = Math.round((Math.random()*5)+1);
        while(Math.random() > 0.01){
            var z = Math.round(cavez);
            for(var x = Math.round(cavex)-(cavewidth*2);x < Math.round(cavex)+(cavewidth*2); x++){
                for(var y = Math.round(cavey)-(cavewidth*2);y < Math.round(cavey)+(cavewidth*2); y++){
                    for(var z = Math.round(cavez)-(cavewidth*2);z < Math.round(cavez)+(cavewidth*2); z++){
                        if(!soob(x,y,z) && (dist(cavex,cavey,cavez,x,y,z) < cavewidth)){
                            m[x][y][z].type = null;
                        }
                    }
                }
            }

            cavex += caveVector[0];
            cavey += caveVector[1];
            cavez += caveVector[2];
            caveVector[1] += Math.random()-0.5;
            caveVector[0] += Math.random()-0.5;
            caveVector[2] += Math.random()-0.5;
            //cavewidth += Math.round((Math.random()-0.5)*2);
        }
    }

    for(k = 0; k < settings.meteors; k++){
        orex = Math.round(Math.random()*(settings.width-2))+1;
        orey = Math.round(Math.random()*(settings.height-2))+1
        orez = Math.round(gen[orex][orey]);
        oresize = Math.round((Math.random()*10)+1);
        for(var x = Math.round(orex)-(oresize*2);x < Math.round(orex)+(oresize*2); x++){
            for(var y = Math.round(orey)-(oresize*2);y < Math.round(orey)+(oresize*2); y++){
                for(var z = Math.round(orez)-(oresize*2);z < Math.round(orez)+(oresize*2); z++){
                    if(!soob(x,y,z) && (dist(orex,orey,orez,x,y,z) < oresize)){
                        if((dist(orex,orey,orez+(oresize*0.75),x,y,z) < oresize*0.5)){
                            m[x][y][z].type = "meteorite";
                        }else{
                            m[x][y][z].type = null;
                        }
                    }
                }
            }
        }
    }

    for(k = 0; k < settings.nitrogenDeposits; k++){
        orex = Math.round(Math.random()*(settings.width-2))+1;
        orey = Math.round(Math.random()*(settings.height-2))+1
        orez = Math.round(gen[orex][orey]+(Math.random()*settings.groundLevel)+5);
        oresize = Math.round((Math.random()*10)+1);
        for(var x = Math.round(orex)-(oresize*2);x < Math.round(orex)+(oresize*2); x++){
            for(var y = Math.round(orey)-(oresize*2);y < Math.round(orey)+(oresize*2); y++){
                for(var z = Math.round(orez)-(oresize*2);z < Math.round(orez)+(oresize*2); z++){
                    if(!soob(x,y,z) && (dist(orex,orey,orez,x,y,z) < oresize)){
                        if((dist(orex,orey,orez,x,y,z) < oresize) && m[x][y][z].type != null){
                            m[x][y][z].type = "solidNitrogen";
                        }
                    }
                }
            }
        }
    }

    for(var x = 0; x < width; x++){
        for(var y = 0; y < height; y++){
            m[x][y][settings.depth-1].type = "basalt";
            m[x][y][settings.depth-2].type = "basalt";
        }
    }
        
    return m;
}

var cameraDepth = settings.groundLevel-5;
var camerax = 0;
var cameray = 0;


function drawAll(){
    c.width = window.innerWidth;
    c.height = window.innerHeight;

    for(var x = 0; x < settings.width; x++){
        for(var y = 0; y < settings.height; y++){
            var z = 0;
            for(z = cameraDepth; z < settings.depth; z++){
                if(map[x][y][z].type != null){
                    if(tileTypes[map[x][y][z].type].stopDraw)
                        break;

                }
            }

            if(z <= cameraDepth){
                xnudge = 0;
                xmargin = 0;
                ynudge = 0;
                ymargin = 0;
                wallThickness = Math.round(settings.tileSize/4);
                if(z == cameraDepth){
                    map[x][y][z].draw();
                    if(!oob(x+1,y)){
                        if(map[x+1][y][z].type == null || !tileTypes[map[x+1][y][z].type].stopDraw){
                            xnudge -= wallThickness;
                        }
                    }
                    if(!oob(x-1,y)){
                        if(map[x-1][y][z].type == null || !tileTypes[map[x-1][y][z].type].stopDraw){
                            xnudge -= wallThickness;
                            xmargin += wallThickness;
                        }
                    }

                    if(!oob(x,y+1)){
                        if(map[x][y+1][z].type == null || !tileTypes[map[x][y+1][z].type].stopDraw){
                            ynudge -= wallThickness;
                        }
                    }
                    if(!oob(x,y-1)){
                        if(map[x][y-1][z].type == null || !tileTypes[map[x][y-1][z].type].stopDraw){
                            ynudge -= wallThickness;
                            ymargin += wallThickness;
                        }
                    }
                }
                ctx.fillStyle = "rgb(0,0,0)";
                ctx.fillRect(((x*settings.tileSize)+xmargin)+camerax,((y*settings.tileSize)+ymargin)+cameray,settings.tileSize+xnudge,settings.tileSize+ynudge);
                hidden = true;
            }

            for(z = z; z > cameraDepth; z--){
                if(z < settings.depth-1){
                    if(map[x][y][z].type != null){
                        map[x][y][z].draw((z-cameraDepth)/20);
                    }
                }
            }
                
            
        }
    }
    for(var i = 0; i < astronauts.length; i++){
        if(astronauts[i].z >= cameraDepth){
            var hide = false;
            for(var j = astronauts[i].z; j >= cameraDepth; j--){
                if(map[astronauts[i].x][astronauts[i].y][j].type != null && tileTypes[map[astronauts[i].x][astronauts[i].y][j].type].stopDraw){
                    hide = true;
                }
            }
            if(!hide)
                astronauts[i].draw((astronauts[i].z-cameraDepth));
        }
    }
}

class job{
    constructor(_x,_y,_z){
        this.x = _x;
        this.y = _y;
        this.z = _z;
        this.task = function(){return;}
        this.claim = null;
    }
}

var jobs = [];

function updateAll(){
    camerax += cameraMovement[0];
    cameray += cameraMovement[1];
    if(camerax > 0)
        camerax = 0;
    if(cameray > 0)
        cameray = 0;
    if(camerax < c.width+(-1*(settings.width*settings.tileSize)))
        camerax = c.width+(-1*(settings.width*settings.tileSize));
    if(cameray < c.height+(-1*(settings.height*settings.tileSize)))
        cameray = c.height+(-1*(settings.height*settings.tileSize));
    for(var x = 0; x < settings.width; x++){
        for(var y = 0; y < settings.height; y++){
            for(var z = 0; z < settings.depth; z++){
                if(map[x][y][z].type != null)
                    tileTypes[map[x][y][z].type].update(map[x][y][z]);
            }
        }
    }
    for(var i = 0; i < astronauts.length; i++){
        astronauts[i].update();
    }
}

var map = generateMap(settings.width,settings.height,settings.depth)
var astronauts = [];



if(settings.tileSize*settings.width < c.width){
    settings.tileSize = Math.ceil(c.width/settings.width)
}
if(settings.tileSize*settings.height < c.height){
    settings.tileSize = Math.ceil(c.height/settings.height)
}

document.addEventListener("wheel", (event) => {
    console.log(event.deltaY);
    if(shiftDown){
        settings.tileSize += event.deltaY/100
        if(settings.tileSize*settings.width < c.width){
            settings.tileSize = Math.ceil(c.width/settings.width)
        }
        if(settings.tileSize*settings.height < c.height){
            settings.tileSize = Math.ceil(c.height/settings.height)
        }


    }else{
        cameraDepth += event.deltaY/100
    }
    if(cameraDepth < 0){
        cameraDepth = 0;
    }
    if(cameraDepth > settings.depth-1){
        cameraDepth = settings.depth-1;
    }
});

var cameraMovement = [0,0]
var shiftDown = false;
var cameraSpeed = 10;

document.addEventListener("keydown", (event) => {
    console.log(event.key);

    if(event.key == "Shift"){
        shiftDown = true;
        if(Math.abs(cameraMovement[0]) == cameraSpeed){
            cameraMovement[0] = cameraMovement[0]*2;
        }
        if(Math.abs(cameraMovement[1]) == cameraSpeed){
            cameraMovement[1] = cameraMovement[1]*2;
        }
    }

    if(event.key == "a")
        cameraMovement[0] = cameraSpeed;
    if(event.key == "d")
        cameraMovement[0] = -cameraSpeed;
    if(event.key == "w")
        cameraMovement[1] = cameraSpeed;
    if(event.key == "s")
        cameraMovement[1] = -cameraSpeed;

    if(event.key == "A")
        cameraMovement[0] = cameraSpeed*2;
    if(event.key == "D")
        cameraMovement[0] = -2*cameraSpeed;
    if(event.key == "W")
        cameraMovement[1] = cameraSpeed*2;
    if(event.key == "S")
        cameraMovement[1] = -2*cameraSpeed;
});

document.addEventListener("keyup", (event) => {
    console.log(event.key);

    if(event.key == "Shift"){
        shiftDown = false;
        if(Math.abs(cameraMovement[0]) == cameraSpeed*2){
            cameraMovement[0] = cameraMovement[0]/2;
        }
        if(Math.abs(cameraMovement[1]) == cameraSpeed*2){
            cameraMovement[1] = cameraMovement[1]/2;
        }
    }

    if(event.key == "a")
        cameraMovement[0] = 0;
    if(event.key == "d")
        cameraMovement[0] = 0;
    if(event.key == "w")
        cameraMovement[1] = 0;
    if(event.key == "s")
        cameraMovement[1] = 0;
    
    if(event.key == "A")
        cameraMovement[0] = 0;
    if(event.key == "D")
        cameraMovement[0] = 0;
    if(event.key == "W")
        cameraMovement[1] = 0;
    if(event.key == "S")
        cameraMovement[1] = 0;

});

for(var i = 0; i < 100; i++){
    astronauts.push(new astronaut(Math.round(Math.random()*(settings.width-2))+1,Math.round(Math.random()*(settings.height-2))+1,settings.groundLevel-10));
}

setInterval(drawAll,50);
setInterval(updateAll,100)
for(var i = 0; i < 500; i++){
    updateAll();
}
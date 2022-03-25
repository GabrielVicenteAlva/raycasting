var aux = false;

var canvas = document.getElementById('gamecanvas');
canvas.width = 240;
canvas.height = 140;
var ctx = canvas.getContext('2d');

var pixscale = 4;
canvas.style.width = canvas.width*pixscale;
canvas.style.height = canvas.height*pixscale;

var auxcanvas = document.getElementById('auxcanvas');
auxcanvas.width = 160*aux;
auxcanvas.height = 160*aux;
var auxctx = auxcanvas.getContext('2d');

var logdiv = document.getElementById('log');

// Key controls
var keys = {
	up: false,
	down: false,
	left: false,
	right: false
}
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    switch(e.key) {
	case 'w':
		keys.movU = true;
		break;
	case 's':
		keys.movD = true;
		break;
	case 'a':
		keys.movL = true;
		break;
	case 'd':
		keys.movR = true;
		break;
	case 'ArrowUp':
		keys.camU = true;
		break;
	case 'ArrowDown':
		keys.camD = true;
		break;
	case 'ArrowLeft':
		keys.camL = true;
		break;
	case 'ArrowRight':
		keys.camR = true;
		break;
	case ' ':
		keys.jump = true;
		break;
	}
}

function keyUpHandler(e) {
    switch(e.key) {
	case 'w':
		keys.movU = false;
		break;
	case 's':
		keys.movD = false;
		break;
	case 'a':
		keys.movL = false;
		break;
	case 'd':
		keys.movR = false;
		break;
	case 'ArrowUp':
		keys.camU = false;
		break;
	case 'ArrowDown':
		keys.camD = false;
		break;
	case 'ArrowLeft':
		keys.camL = false;
		break;
	case 'ArrowRight':
		keys.camR = false;
		break;
	case ' ':
		keys.jump = false;
		break;
	}
}

// Game variables
var player = {
	x: 2.5,
	y: -4.5,
	rot: -Math.PI/2,
	speed: .07,
	rotspeed: Math.PI*.01,
	shearing: 0,
	shearspeed: 5,
	maxshear: 100,
	z: 0,
	zspeed: 0,
	jumping: false
}
var map = {
	data: [
		[ [0,1,1,0], [0,1,0,1], [0,1,0,1], [1,1,0,0], [0,0,0,0], [0,1,2,1], [0,1,0,1], [0,1,0,1], [0,1,0,1], [1,1,0,0] ],
		[ [1,0,1,0], [0,0,0,0], [0,0,0,0], [1,0,1,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], [1,0,1,0] ],
		[ [1,0,1,0], [0,0,0,0], [0,0,0,0], [1,0,1,0], [0,0,0,0], [0,3,3,0,3], [3,3,0,0,3], [0,0,0,0], [0,0,0,0], [1,0,1,0] ],
		[ [0,0,1,0], [0,1,0,0], [0,1,0,0], [1,0,0,0], [0,0,0,0], [0,0,3,0,3], [0,0,0,0,3], [0,1,0,1], [0,1,0,1], [1,0,0,0] ],
		[ [0,0,1,1], [0,0,0,0], [0,0,0,0], [1,0,0,1], [0,0,0,0], [0,0,3,3,3], [3,0,0,3,3], [0,0,0,0], [0,0,0,0], [1,0,1,0] ],
		[ [0,0,0,0], [0,0,1,0], [1,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], [1,0,1,0] ],
		[ [0,1,1,0], [0,0,0,0], [0,0,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0], [1,0,0,0] ],
		[ [0,0,1,0], [0,0,0,0,4], [0,0,0,0,4], [0,0,0,0,4], [0,0,0,0,4], [0,0,0,0,4], [0,0,0,0,4], [0,0,0,0,4], [0,0,0,0,4], [1,0,0,0] ],
		[ [0,0,1,0], [0,0,0,0,4], [0,0,0,0,4], [0,0,0,0,4], [0,0,0,0,4], [0,0,0,0,4], [0,0,0,0,4], [0,0,0,0,4], [0,0,0,0,4], [1,0,0,0] ],
		[ [0,0,1,1], [0,0,0,1], [0,0,0,1], [0,0,0,1], [0,0,0,1], [0,0,0,1], [0,0,0,1], [0,0,0,1], [0,0,0,1], [1,0,0,1] ]
	]
}
map.height = map.data.length;
map.width = map.data[0].length;
const wallcollision = 0.05;

// Frame
var lastTime = 0;
function onframe(time) {
	var dt = (time - lastTime)/1000*60;
	lastTime = time;
	logdiv.innerHTML = '';
	player.cosr = Math.cos(player.rot);
	player.sinr = Math.sin(player.rot);
	player.i = Math.floor(player.x);
	player.j = Math.floor(-player.y);
	player.cell = map.data[player.j][player.i];
	
	if(keys.movU) {
		player.x += player.speed*player.cosr *dt;
		if(player.cell[0] && player.x-player.i>1-wallcollision)
			player.x = player.i+1-wallcollision;
		if(player.cell[2] && player.x-player.i<wallcollision)
			player.x = player.i+wallcollision;
		player.i = Math.floor(player.x);
		player.cell = map.data[player.j][player.i];
		player.y += player.speed*player.sinr *dt;
		if(player.cell[1] && player.y+player.j>-wallcollision)
			player.y = -player.j-wallcollision;
		if(player.cell[3] && player.y+player.j<-1+wallcollision)
			player.y = -player.j-1+wallcollision;
	}
	if(keys.movD) {
		player.x -= player.speed*player.cosr *dt;
		if(player.cell[0] && player.x-player.i>1-wallcollision)
			player.x = player.i+1-wallcollision;
		if(player.cell[2] && player.x-player.i<wallcollision)
			player.x = player.i+wallcollision;
		player.i = Math.floor(player.x);
		player.cell = map.data[player.j][player.i];
		player.y -= player.speed*player.sinr *dt;
		if(player.cell[1] && player.y+player.j>-wallcollision)
			player.y = -player.j-wallcollision;
		if(player.cell[3] && player.y+player.j<-1+wallcollision)
			player.y = -player.j-1+wallcollision;
	}
	if(keys.movL) {
		player.x -= player.speed*player.sinr *dt;
		if(player.cell[0] && player.x-player.i>1-wallcollision)
			player.x = player.i+1-wallcollision;
		if(player.cell[2] && player.x-player.i<wallcollision)
			player.x = player.i+wallcollision;
		player.i = Math.floor(player.x);
		player.cell = map.data[player.j][player.i];
		player.y += player.speed*player.cosr *dt;
		if(player.cell[1] && player.y+player.j>-wallcollision)
			player.y = -player.j-wallcollision;
		if(player.cell[3] && player.y+player.j<-1+wallcollision)
			player.y = -player.j-1+wallcollision;
	}
	
	if(keys.movR) {
		player.x += player.speed*player.sinr *dt;
		if(player.cell[0] && player.x-player.i>1-wallcollision)
			player.x = player.i+1-wallcollision;
		if(player.cell[2] && player.x-player.i<wallcollision)
			player.x = player.i+wallcollision;
		player.i = Math.floor(player.x);
		player.cell = map.data[player.j][player.i];
		player.y -= player.speed*player.cosr *dt;
		if(player.cell[1] && player.y+player.j>-wallcollision)
			player.y = -player.j-wallcollision;
		if(player.cell[3] && player.y+player.j<-1+wallcollision)
			player.y = -player.j-1+wallcollision;
	}
	if(keys.camL)
		player.rot += player.rotspeed *dt;
	if(keys.camR)
		player.rot -= player.rotspeed *dt;
	if(keys.camU)
		player.shearing += player.shearspeed *dt;
	if(keys.camD)
		player.shearing -= player.shearspeed *dt;
	while(player.rot > Math.PI)
		player.rot -= 2*Math.PI;
	while(player.rot < -Math.PI)
		player.rot += 2*Math.PI;
	if(player.shearing > player.maxshear)
		player.shearing = player.maxshear;
	if(player.shearing < -player.maxshear)
		player.shearing = -player.maxshear;
	drawframe();
	
	// Jumping
	if(keys.jump && player.z<=0) {
		player.zspeed = 15;
	}
	if(!keys.jump && player.z<=0) {
		player.zspeed = 0;
		player.z = 0;
	}
	if(player.zspeed>0 || player.z>0) {
		player.zspeed -= 1;
		player.z += player.zspeed;
	}
	
	if(aux)
		auxframe();
	window.requestAnimationFrame(onframe);
}

// Aux variables
const tilesize = 24;
const aov = Math.PI/3; // Angle of vision
function auxframe() {
	auxctx.clearRect(0,0,auxcanvas.width,auxcanvas.height);
	// Drawing map
	auxctx.strokeStyle = "#000000";
	auxctx.lineWidth = 2;
	auxctx.beginPath();
	for(var j=0;j<map.height;j++)
		for(var i=0;i<map.width;i++) {
			var cell = map.data[j][i];
			if(cell[0]) {
				auxctx.moveTo(tilesize*(i+1),tilesize*(j+1));
				auxctx.lineTo(tilesize*(i+1),tilesize*j)
			}
			if(cell[1]) {
				auxctx.moveTo(tilesize*(i+1),tilesize*j);
				auxctx.lineTo(tilesize*i,tilesize*j)
			}
			if(cell[2]) {
				auxctx.moveTo(tilesize*i,tilesize*j);
				auxctx.lineTo(tilesize*i,tilesize*(j+1))
			}
			if(cell[3]) {
				auxctx.moveTo(tilesize*i,tilesize*(j+1));
				auxctx.lineTo(tilesize*(i+1),tilesize*(j+1))
			}
		}
	auxctx.stroke();
		
	// Drawing character
	var x = tilesize*player.x;
	var y = -tilesize*player.y;
	var rot = player.rot;
	
	auxctx.beginPath();
	auxctx.lineWidth = 1;
	auxctx.moveTo(x, y);
	auxctx.lineTo(x+tilesize*Math.cos(rot)/2, y-tilesize*Math.sin(rot)/2);
	auxctx.stroke();
	
	for(var a=-aov/2;a<aov/2+.0001;a+=Math.PI/3/canvas.width) {
		var r = ray(player.x,player.y,player.rot+a);
		drawRay(r);
	}
	
	auxctx.beginPath();
	auxctx.fillStyle = "#FF0000";
	auxctx.arc(x,y,3,0,2*Math.PI);
	auxctx.fill();
}
function drawRay(r) {
	auxctx.strokeStyle = "#00FF00";
	auxctx.beginPath();
	auxctx.lineWidth = 1;
	auxctx.moveTo(tilesize*r.ox,-tilesize*r.oy);
	auxctx.lineTo(tilesize*r.x,-tilesize*r.y);
	auxctx.stroke();
}

const maxdepth = 10;
const floatth = 0.001// Float threshold
function ray(ox,oy,ang) {
	if(ang > Math.PI)
		ang -= 2*Math.PI;
	if(ang < -Math.PI)
		ang += 2*Math.PI;
	var cosa = Math.cos(ang);
	var sina = Math.sin(ang);
	// Horizontal
	var depth = 0;
	var hx,hy;
	var dx,dy;
	var dirh, dirv;
	var thid = 0, tvid = 0;
	var txh = 0,txv = 0; // for textureX
	if(ang>floatth && ang<Math.PI-floatth) {
		hy = Math.ceil(oy);
		hx = ox + (hy-oy)*cosa/sina;
		dy = 1;
		dx = cosa/sina;
	}
	else if(ang<-floatth && ang>-Math.PI+floatth) {
		hy = Math.floor(oy);
		hx = ox + (hy-oy)*cosa/sina;
		dy = -1;
		dx = -cosa/sina;
	}
	else {
		hx = ox + ((ang<1&&ang>-1) ? maxdepth : -maxdepth);
		hy = oy;
		depth = maxdepth;
	}
	var i = Math.floor(hx);
	var j = Math.floor(-oy);
	while(depth<maxdepth) {
		if(i<0 || i>=map.width || j<0 || j>=map.height)
			break;
		var cell = map.data[j][i];
		if(dy>0 && cell[1]) {
			txh = hx%1;
			dirh = 1;
			thid = cell[1];
			break;
		}
		if(dy<0 && cell[3]) {
			txh = 1 - hx%1;
			dirh = 3;
			thid = cell[3];
			break;
		}
		hx += dx;
		hy += dy;
		i = Math.floor(hx);
		j -= dy;
		depth++;
	}
	// Vertical
	depth = 0;
	var vx,vy;
	if(ang<Math.PI/2-floatth && ang>-Math.PI/2+floatth) {
		vx = Math.ceil(ox);
		vy = oy + (vx-ox)*sina/cosa;
		dx = 1;
		dy = sina/cosa;
	}
	else if(ang>Math.PI/2+floatth || ang<-Math.PI/2-floatth) {
		vx = Math.floor(ox);
		vy = oy + (vx-ox)*sina/cosa;
		dx = -1;
		dy = -sina/cosa;
	}
	else {
		vy = oy + (ang>0 ? maxdepth : -maxdepth);
		vx = ox;
		depth = maxdepth;
	}
	i = Math.floor(ox);
	j = Math.floor(-vy);
	while(depth<maxdepth) {
		if(i<0 || i>=map.width || j<0 || j>=map.height)
			break;
		var cell = map.data[j][i];
		if(dx>0 && cell[0]) {
			txv = -vy%1;
			dirv = 0;
			tvid = cell[0];
			break;
		}
		if(dx<0 && cell[2]) {
			txv = 1 + vy%1;
			dirv = 2;
			tvid = cell[2];
			break;
		}
		vx += dx;
		vy += dy;
		i += dx;
		j = Math.floor(-vy);
		depth++;
	}
	var lhx = Math.abs(hx-ox)
	var lvx = Math.abs(vx-ox)
	var h = (Math.abs(lhx-lvx)<.01) ? Math.abs(hy-oy)<Math.abs(vy-oy) : lhx<lvx;
	var x = h ? hx : vx;
	var y = h ? hy : vy;
	var dist = Math.sqrt(Math.pow(x-player.x,2)+Math.pow(y-player.y,2));
	return {
		ox: ox,
		oy: oy,
		x: x,
		y: y,
		d: dist,
		// cosd: dist*Math.sin(ang-player.rot),
		cosd: dist*Math.cos(ang-player.rot),
		color: h ? [0,0,255,255] : [0,0,185,255],
		textureX: (h ? txh : txv),
		textureID: (h ? thid : tvid),
		dir: (h ? dirh : dirv),
	};
}

var imdata = ctx.createImageData(canvas.width,canvas.height);
var imdmatrix = Array(canvas.height);
for(var i=0;i<canvas.height;i++) {
	imdmatrix[i] = Array(canvas.width);
	for(var j=0;j<canvas.width;j++)
		imdmatrix[i][j] = [255,255,255,255];
}
function drawframe() {
	// ctx.clearRect(0,0,canvas.width,canvas.height);
	/*
	for(var i=0;i<canvas.height;i++)
		for(var j=0;j<canvas.width;j++)
			imdmatrix[i][j] = [135,206,235,255];
	*/
	ctx.lineWidth = 1;
	for(var i=0;i<canvas.width;i++) {
		var a = aov/2 - aov*i/canvas.width;
		var r = ray(player.x,player.y,player.rot+a);
		var h = 110/r.cosd;
		var dz = player.z/r.cosd
		var m = canvas.height/2-.5+player.shearing;
		var texture = textures[r.textureID];
		var textureI = Math.floor(texture.width*r.textureX);
		
		var skyTexture = textures[5];
		var skyLoops = 3;
		var skyI = Math.floor((i*aov/canvas.width-player.rot+Math.PI)*skyTexture.width/Math.PI/2*skyLoops) % skyTexture.width;
		if(textureI==texture.width)
			textureI--;
		for(var j=0;j<canvas.height;j++) {
			// Sky
			if(j<=m-h+dz) {
				for(var k=0;k<3;k++)
					imdmatrix[j][i][k] = skyTexture.data[(Math.floor(.097*skyLoops*(j-player.shearing+player.maxshear)))%skyTexture.height][skyI][k];
			}
			// Wall
			else if(j<m+h+dz)
				for(var k=0;k<3;k++)
					imdmatrix[j][i][k] = texture.data[Math.floor(texture.height*(j-m+h-dz)/h/2)][textureI][k]*(r.dir%2 ? 1 : .8)*(r.d>2?4/(r.d+2):1);
			// Floor
			else {
				var t = (h+dz)/(j-m);
				var x = r.ox*(1-t) + r.x*t;
				var y = r.oy*(1-t) + r.y*t;
				try {
					var floorID = map.data[Math.floor(-y)][Math.floor(x)][4];
				} catch(e) {
					logdiv.innerHTML = Math.floor(-y) + ' ' + Math.floor(x) + ' ' + e;
				}
				var floorTexture = textures[floorID ? floorID : 2];
				for(var k=0;k<3;k++)
					imdmatrix[j][i][k] = floorTexture.data[Math.floor((-y%1)*floorTexture.height)][Math.floor((x%1)*floorTexture.width)][k]*(r.d*t>2?4/(r.d*t+2):1);
			}
		}
	}
	// Pass imdmatrix to the canvas
	for(var i=0;i<canvas.height;i++)
		for(var j=0;j<canvas.width;j++)
			for(var k=0;k<4;k++)
				imdata.data[4*(i*canvas.width+j)+k] = imdmatrix[i][j][k];
	ctx.putImageData(imdata,0,0);
}
// Textures
var textureDirs = ['','tile1.png','tile2.png','tile3.png','tile4.png','skytexture.png'];
var textures = Array(textureDirs.length);

function loadTexture(id) {
	return new Promise(function(resolve, reject) {
		var img = new Image();
		img.src = textureDirs[id];
		img.id = id;
		img.onload = function() {
			var texturecanvas = document.createElement('canvas');
			var tctx = texturecanvas.getContext('2d');
			texturecanvas.width = this.width;
			texturecanvas.height = this.height;
			tctx.drawImage(this, 0, 0);
			this.style.display = 'none';
			var imd = tctx.getImageData(0, 0, this.width, this.height);	
			var texture = Array(this.height);
			for(var i=0;i<this.height;i++) {
				texture[i] = Array(this.width);
				for(var j=0;j<this.width;j++) {
					texture[i][j] = Array(4);
					for(var k=0;k<4;k++)
						texture[i][j][k] = imd.data[4*(i*this.width+j)+k];
				}
			}
			texturecanvas.remove();
			this.remove();
			resolve({
				data: texture,
				width: this.width,
				height: this.height,
				id: this.id
			});
		};
	});
}

// Mouse control
canvas.requestPointerLock = canvas.requestPointerLock ||
                            canvas.mozRequestPointerLock;

document.exitPointerLock = document.exitPointerLock ||
                           document.mozExitPointerLock;

canvas.onclick = function() {
  canvas.requestPointerLock();
}
document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
function lockChangeAlert() {
  if (document.pointerLockElement === canvas ||
      document.mozPointerLockElement === canvas) {
    console.log('The pointer lock status is now locked');
    document.addEventListener("mousemove", mouseMove, false);
  } else {
    console.log('The pointer lock status is now unlocked');
    document.removeEventListener("mousemove", mouseMove, false);
  }
}
function mouseMove(e) {
	player.rot -= player.rotspeed * e.movementX * .1;
	player.shearing -= player.shearspeed * e.movementY * .1;
	if(player.rot > Math.PI)
		player.rot -= 2*Math.PI;
	if(player.rot < -Math.PI)
		player.rot += 2*Math.PI;
	if(player.shearing > player.maxshear)
		player.shearing = player.maxshear;
	if(player.shearing < -player.maxshear)
		player.shearing = -player.maxshear;
	// console.log(e.movementX + ' ' + e.movementY)
}

// Load
async function start() {
	textures[0] = {
		data: [[[0,0,0,0]]],
		width: 1,
		height: 1,
		id: 0
	}
	for(var i=1;i<textures.length;i++)
		textures[i] = await loadTexture(i);
	window.requestAnimationFrame(onframe);
}
start();
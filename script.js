var canvas = document.getElementById('gamecanvas');
canvas.width = 180;
canvas.height = 120;
var ctx = canvas.getContext('2d');

var pixscale = 5;
canvas.style.width = canvas.width*pixscale;
canvas.style.height = canvas.height*pixscale;

var auxcanvas = document.getElementById('auxcanvas');
auxcanvas.width = 320/2*0;
auxcanvas.height = 320/2*0;
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
	case 'ArrowUp':
	case 'w':
		keys.up = true;
		break;
	case 'ArrowDown':
	case 's':
		keys.down = true;
		break;
	case 'ArrowLeft':
	case 'a':
		keys.left = true;
		break;
	case 'ArrowRight':
	case 'd':
		keys.right = true;
		break;
	}
}

function keyUpHandler(e) {
    switch(e.key) {
	case 'ArrowUp':
	case 'w':
		keys.up = false;
		break;
	case 'ArrowDown':
	case 's':
		keys.down = false;
		break;
	case 'ArrowLeft':
	case 'a':
		keys.left = false;
		break;
	case 'ArrowRight':
	case 'd':
		keys.right = false;
		break;
	}
}

// Game variables
var player = {
	x: 2.5,
	y: -2.5,
	rot: 0,
	speed: .05,
	rotspeed: Math.PI*.01
}
var map = {
	data: [
		[ [1,1,1,0], [0,0,0,0], [0,1,1,0], [0,1,0,0], [0,1,0,1], [1,1,0,0] ],
		[ [0,0,1,0], [0,1,0,0], [0,0,0,0], [1,0,0,0], [0,0,0,0], [1,0,1,0] ],
		[ [0,0,1,0], [0,0,0,0], [0,0,0,0], [1,0,0,0], [0,0,0,0], [1,0,1,0] ],
		[ [0,0,1,0], [0,0,0,0], [0,0,0,0], [0,0,0,1], [0,1,0,1], [1,0,0,1] ],
		[ [0,0,1,1], [0,0,0,0], [1,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0] ],
		[ [0,0,0,0], [0,0,1,1], [0,0,0,1], [0,1,0,1], [0,1,0,1], [1,1,0,1] ]
	]
}
map.height = map.data.length;
map.width = map.data[0].length;
const wallcollision = 0.05;

// Textures
var textures = []
var textureDirs = ['tile1.png']
var texturecanvas = document.createElement('canvas');
var tctx = texturecanvas.getContext('2d');

for(dir of textureDirs) {
	var img = new Image();
	img.src = dir;
	img.onload = function() {
		texturecanvas.width = img.width;
		texturecanvas.height = img.height;
		tctx.drawImage(img, 0, 0);
		img.style.display = 'none';
		var imd = tctx.getImageData(0, 0, img.width, img.height);
		// console.log(imd);
		// logdiv.appendChild(tc);
		
		var texture = Array(img.height);
		for(var i=0;i<img.height;i++) {
			texture[i] = Array(img.width);
			for(var j=0;j<img.width;j++) {
				texture[i][j] = Array(4);
				for(var k=0;k<4;k++)
					texture[i][j][k] = imd.data[4*(i*img.width+j)+k];
			}
		}
		textures.push({
			data: texture,
			width: img.width,
			height: img.height
		});
	};
}

// Frame
function onframe() {
	logdiv.innerHTML = '';
	player.cosr = Math.cos(player.rot);
	player.sinr = Math.sin(player.rot);
	player.i = Math.floor(player.x);
	player.j = Math.floor(-player.y);
	player.cell = map.data[player.j][player.i];
	
	if(keys.up) {
		player.x += player.speed*player.cosr;
		if(player.cell[0] && player.x-player.i>1-wallcollision)
			player.x = player.i+1-wallcollision;
		if(player.cell[2] && player.x-player.i<wallcollision)
			player.x = player.i+wallcollision;
		player.i = Math.floor(player.x);
		player.cell = map.data[player.j][player.i];
		player.y += player.speed*player.sinr;
		if(player.cell[1] && player.y+player.j>-wallcollision)
			player.y = -player.j-wallcollision;
		if(player.cell[3] && player.y+player.j<-1+wallcollision)
			player.y = -player.j-1+wallcollision;
	}
	if(keys.down) {
		player.x -= player.speed*player.cosr;
		if(player.cell[0] && player.x-player.i>1-wallcollision)
			player.x = player.i+1-wallcollision;
		if(player.cell[2] && player.x-player.i<wallcollision)
			player.x = player.i+wallcollision;
		player.i = Math.floor(player.x);
		player.cell = map.data[player.j][player.i];
		player.y -= player.speed*player.sinr;
		if(player.cell[1] && player.y+player.j>-wallcollision)
			player.y = -player.j-wallcollision;
		if(player.cell[3] && player.y+player.j<-1+wallcollision)
			player.y = -player.j-1+wallcollision;
	}
	if(keys.left)
		player.rot += player.rotspeed;
	if(keys.right)
		player.rot -= player.rotspeed;
	if(player.rot > Math.PI)
		player.rot -= 2*Math.PI;
	if(player.rot < -Math.PI)
		player.rot += 2*Math.PI;
	drawframe();
	// auxframe();
}

// Aux variables
const tilesize = 48/2;
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

const maxdepth = 8;
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
		if(dy>0 && cell[1])
			break;
		if(dy<0 && cell[3])
			break;
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
		if(dx>0 && cell[0])
			break;
		if(dx<0 && cell[2])
			break;
		vx += dx;
		vy += dy;
		i += dx;
		j = Math.floor(-vy);
		depth++;
	}
	var lhx = Math.abs(hx-ox)
	var lvx = Math.abs(vx-ox)
	var h = (Math.abs(lhx-lvx)<floatth) ? Math.abs(hy-oy)<Math.abs(vy-oy) : lhx<lvx;
	var x = h ? hx : vx;
	var y = h ? hy : vy;
	var dist = Math.sqrt(Math.pow(x-player.x,2)+Math.pow(y-player.y,2));
	return {
		ox: ox,
		oy: oy,
		x: x,
		y: y,
		d: dist,
		cosd: dist*Math.cos(ang-player.rot),
		color: h ? [0,0,255,255] : [0,0,185,255],
		textureX: h ? x%1 : -y%1
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
	for(var i=0;i<canvas.height;i++)
		for(var j=0;j<canvas.width;j++)
			if(i<canvas.height/2)
				imdmatrix[i][j] = [200,200,200,255];
			else
				imdmatrix[i][j] = [150,150,150,255];
	ctx.lineWidth = 1;
	for(var i=0;i<canvas.width;i++) {
		var a = aov/2 - aov*i/canvas.width;
		var r = ray(player.x,player.y,player.rot+a);
		var h = 80/r.cosd;
		var m = canvas.height/2-.5;
		
		for(var j=0;j<canvas.height;j++) {
			var texture = textures[0];
			var textureI = Math.floor(texture.width*r.textureX);
			if(textureI==texture.width)
				textureI--;
			if(j>m-h && j<m+h)
				imdmatrix[j][i] = texture.data[Math.floor(texture.height*(j-m+h)/h/2)][textureI];
		}
	}
	// Pass imdmatrix to the canvas
	for(var i=0;i<canvas.height;i++)
		for(var j=0;j<canvas.width;j++)
			for(var k=0;k<4;k++)
				imdata.data[4*(i*canvas.width+j)+k] = imdmatrix[i][j][k];
	ctx.putImageData(imdata,0,0);
}

window.onload = setTimeout(function (){
	setInterval(onframe, 1000/60);
},100);








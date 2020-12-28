/**
 * @author Asa Dillahunty
 */

var interval = null;
var objs;


document.getElementById("liveSection").style.display = "inherit";

const scale = 50;

var canvas = document.getElementById("dungeonCanvas");
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;
canvas.width = 15*scale;
canvas.height = 10*scale;

var size = 2;

var a = buildCell("#0000FF", 0, 0, size*scale, size*scale);
var b = buildCell("#FFFF00", 0, 0, size*scale, size*scale);
var c = buildCell("#FF0000", 0, 0, size*scale, size*scale);

// while (anyOverlap([a,b,c])) {
// 	newPoints(c,canvas);
// 	newPoints(b,canvas);
// 	newPoints(a,canvas);
// }
var keySprite = {
	width:27,
	height:90,
	imgW:9,
	imgH:30,
	cord: {x: 0, y: 0},
	img: new Image(),
	permeable: true,
	count: 0,
	frameCount: 0,
	offset: 9,
	frameArr: [0,1,2,1],
	draw: function() {
		// 0, 1, 2, 1
		context.drawImage(this.img, this.offset*(this.frameArr[this.count]), 0, this.imgW, this.imgH, this.cord.x, this.cord.y, this.width, this.height);
		
		// This means the key animates at a fifth of the pace of the game clock
		this.frameCount++;
		if (this.frameCount < 5) return;

		this.frameCount = 0;
		this.count = (this.count + 1)%4;
	},
	move: function() {}
};
keySprite.img.src = './images/K1.png';

var sprite = {
	width: 75,
	height: 75,
	imgW: 32,
	imgH: 32,
	cord: {x: 0, y: 0},
	velocity: {left:0, right:0, up:0, down:0},
	pace: 5,
	img: new Image(),
	count: 0,
	frameCount: 0,
	offset: 32,
	facing: 0,
	draw: function() {
		// if left facing = 1
		// if right facing = 0
		if (this.velocity.left == -1) this.facing = 1;
		else if (this.velocity.right) this.facing = 0;
		context.drawImage(this.img, this.offset*this.count, this.offset*this.facing, this.imgW, this.imgH, this.cord.x, this.cord.y, this.width, this.height);
		
		// This means the key animates at a fifth of the pace of the game clock
		this.frameCount++;
		if (this.frameCount < 5) return;

		this.frameCount = 0;
		this.count = (this.count + 1)%2;
	},
	move: function() {
		this.cord.x += this.pace * (this.velocity.right + this.velocity.left);
		this.cord.y += this.pace * (this.velocity.up + this.velocity.down);

		for (var i=0;i<objs.length;i++) {
			if (objs[i] === this || objs[i].permeable) continue;
			else if (overlap(this,objs[i])) {
				// TODO:
				// - fix the problem direction and not stop whole move
				this.cord.x -= this.pace * (this.velocity.right + this.velocity.left);
				this.cord.y -= this.pace * (this.velocity.up + this.velocity.down);
				return;
			}
		}
		// some check
	}
}
sprite.img.src = './images/G12.png';
objs = [a,b,c,sprite,keySprite];
// renderCanvas([a,b,c,sprite], canvas);
placeObjs();
requestAnimationFrame(renderCanvas);

// if (interval) clearInterval(interval);
// interval = setInterval( () => {
// 	renderCanvas([a,b,c,sprite], canvas);
// 	// if (count == 0) ctx.drawImage(sprite,0,0,160,182,0,0,160,182);
// 	// else ctx.drawImage(sprite,200,0,160,182,0,0,160,182);
// }, 100);

document.addEventListener('keydown', function(event) {
	event.preventDefault();
	if (event.code === "KeyW" || event.code === 'ArrowUp') sprite.velocity.up = -1;
	else if (event.code === "KeyS" || event.code === "ArrowDown") sprite.velocity.down = 1;
	else if (event.code === "KeyA" || event.code === "ArrowLeft") sprite.velocity.left = -1;
	else if (event.code === "KeyD" || event.code === "ArrowRight") sprite.velocity.right = 1;
});

document.addEventListener('keyup', function(event) {
	if (event.code === "KeyW" || event.code === "ArrowUp") sprite.velocity.up = 0;
	else if (event.code === "KeyS" || event.code === "ArrowDown") sprite.velocity.down = 0;
	else if (event.code === "KeyA" || event.code === "ArrowLeft") sprite.velocity.left = 0;
	else if (event.code === "KeyD" || event.code === "ArrowRight") sprite.velocity.right = 0;
});

function placeObjs() {
	do {
		for (var i=0;i<objs.length;i++) newPoints(objs[i],canvas);
	} while (anyOverlap(objs));
}


function buildCell(color, x, y, width, height) {
	return {
		cord: {x: x, y: y},
		height: height,
		width: width,
		color: color,
		draw: function () {
			drawCell(this);
		},
		move: function(){}
	};
}

function anyOverlap(cells) {
	// test every combination
	for (var i=0;i<cells.length-1;i++) {
		for (var j=i+1;j<cells.length;j++) {
			if (overlap(cells[i],cells[j])) return true;
		}
	}
	return false;
}

function overlap(a, b) {
	// a.x to a.x + a.width
	// b.x to b.x + b.width

	return !( a.cord.x + a.width < b.cord.x || // max a left of min b
		a.cord.x > b.cord.x + b.width || // min a right of max b
		a.cord.y > b.cord.y+b.height || // min a above max b
		a.cord.y+a.height < b.cord.y ); // max a below min b
}

function newPoints(cell, canvas) {
	cell.cord.y = Math.floor(Math.random()* (canvas.height - cell.height));
	cell.cord.x = Math.floor(Math.random()* (canvas.width - cell.width));
}

function drawCell(cell) {
	context.fillStyle = cell.color;
	context.fillRect(cell.cord.x,cell.cord.y,cell.width,cell.height);
}

var frameCount=0;
var fps = 20;
var fCount = Math.floor(60/fps);

function renderCanvas() {
	frameCount++;
	if (frameCount < fCount) {
		requestAnimationFrame(renderCanvas);
		return;
	}
	else frameCount = 0;

	context.clearRect(0, 0, canvas.width, canvas.height);
	context.imageSmoothingEnabled = false;
	// context.fillStyle = "#000000";
	// context.fillRect(0,0,canvas.width,canvas.height);

	for (var i=0;i<objs.length;i++) {
		objs[i].move();
		objs[i].draw();
	}
	if (overlap(keySprite, sprite)) {
		placeObjs();
	}
	requestAnimationFrame(renderCanvas);
}
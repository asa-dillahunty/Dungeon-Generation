/**
 * @author Asa Dillahunty
 */

var interval = null;
var objs;
var score=0;

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

var keySprite = newSprite(9,30,9,30,'./images/K1.png',[0,1,2,1],5,5);
keySprite.faces = false;
var ghostSprite = newSprite(scale, scale, 32, 32, './images/G12.png', [0,1], 5, 5);

objs = [a,b,c,ghostSprite,keySprite];
placeObjs();
requestAnimationFrame(renderCanvas);

document.addEventListener('keydown', function(event) {
	if (event.code === "KeyW" || event.code === 'ArrowUp') {
		ghostSprite.velocity.up = -1;
		keySprite.velocity.up = -1;
	}
	else if (event.code === "KeyS" || event.code === "ArrowDown") {
		ghostSprite.velocity.down = 1;
		keySprite.velocity.down = 1;
	}
	else if (event.code === "KeyA" || event.code === "ArrowLeft") {
		ghostSprite.velocity.left = -1;
		keySprite.velocity.left = -1;
	}
	else if (event.code === "KeyD" || event.code === "ArrowRight") {
		ghostSprite.velocity.right = 1;
		keySprite.velocity.right = 1;
	}
	else return;

	event.preventDefault();
});

document.addEventListener('keyup', function(event) {
	if (event.code === "KeyW" || event.code === "ArrowUp") {
		ghostSprite.velocity.up = 0;
		keySprite.velocity.up = 0;
	}
	else if (event.code === "KeyS" || event.code === "ArrowDown") {
		ghostSprite.velocity.down = 0;
		keySprite.velocity.down = 0;
	}
	else if (event.code === "KeyA" || event.code === "ArrowLeft") {
		ghostSprite.velocity.left = 0;
		keySprite.velocity.left = 0;
	}
	else if (event.code === "KeyD" || event.code === "ArrowRight") {
		ghostSprite.velocity.right = 0;
		keySprite.velocity.right = 0;
	}
});

function placeObjs() {
	do {
		for (var i=0;i<objs.length;i++) newPoints(objs[i],canvas);
	} while (anyOverlap(objs));
}

/**
 * 
 * @param {Number} spriteWidth Width of the spite to be displayed
 * @param {Number} spriteHeight Height of the sprite to be drawn
 * @param {Number} imageWidth Width of the sprite's image
 * @param {Number} imageHeight Height of the sprite's image
 * @param {String} imageURL URL of the image
 * @param {Array} frameArray Array to loop through and let the draw function know what frame to draw and each index
 * @param {Number} frameRatio how many frames to skip before changing the animation
 * @param {Number} stepSize Step size of the sprite
 */
function newSprite(spriteWidth, spriteHeight, imageWidth, imageHeight, imageURL, frameArray, frameRatio = 0, stepSize = 0) {
	// newSprite(27,90,9,30,'./images/K1.png',[0,1,2,1],5);
	var sprite = {
		permeable: true,
		width: spriteWidth,
		height: spriteHeight,
		imgW: imageWidth,
		imgH: imageHeight,
		cord: {x: 0, y: 0},
		velocity: {left:0,right:0,up:0,down:0},
		img: new Image(),
		facing: 0,
		faces: true,
		frameCount: 0,
		frameIndex: 0,
		frameArr: frameArray,
		frameRatio: frameRatio,
		draw: function() {
			if (this.faces)
				if (this.velocity.left == -1) this.facing = 1;
				else if (this.velocity.right) this.facing = 0;

			context.drawImage(this.img, this.imgW*(this.frameArr[this.frameIndex]), this.imgH*this.facing, this.imgW, this.imgH, this.cord.x, this.cord.y, this.width, this.height);
			
			// This means the key animates at a fifth of the pace of the game clock
			this.frameCount++;
			if (this.frameCount < this.frameRatio) return;

			this.frameCount = 0;
			this.frameIndex = (this.frameIndex + 1) % this.frameArr.length;
		},
		move: function() {
			if (this.stepSize == 0) return;
			this.cord.x += this.stepSize * (this.velocity.right + this.velocity.left);
			this.cord.y += this.stepSize * (this.velocity.up + this.velocity.down);

			for (var i=0;i<objs.length;i++) {
				if (objs[i] === this || objs[i].permeable) continue;
				else if (overlap(this,objs[i])) {
					this.cord.x -= this.stepSize * (this.velocity.right + this.velocity.left);
					if (!overlap(this,objs[i])) continue;
					else this.cord.x += this.stepSize * (this.velocity.right + this.velocity.left);

					this.cord.y -= this.stepSize * (this.velocity.up + this.velocity.down);
					if (!overlap(this,objs[i])) continue;
					else this.cord.x -= this.stepSize * (this.velocity.right + this.velocity.left);
				}
			}

			const w = Math.floor(this.width/this.stepSize);
			const ws = w*this.stepSize;
			if (this.cord.x > canvas.width - w) this.cord.x = -ws;
			else if (this.cord.x < -ws) this.cord.x = canvas.width - w;

			const h = Math.floor (this.height/this.stepSize);
			const hs = h*this.stepSize;
			if (this.cord.y > canvas.height - h) this.cord.y = -hs;
			else if (this.cord.y < -hs) this.cord.y = canvas.height - h;
		},
		stepSize: stepSize
	}
	sprite.img.src = imageURL;
	return sprite;
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

	return !( a.cord.x + a.width <= b.cord.x || // max a left of min b
		a.cord.x >= b.cord.x + b.width || // min a right of max b
		a.cord.y >= b.cord.y+b.height || // min a above max b
		a.cord.y+a.height <= b.cord.y ); // max a below min b
}

function newPoints(cell, canvas) {
	// have every point be a multiple of scale
	cell.cord.y = Math.floor( (Math.random() * (canvas.height - cell.height) ) / scale) * scale;
	cell.cord.x = Math.floor( (Math.random() * (canvas.width - cell.width) ) / scale) * scale;
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

	for (var i=0;i<objs.length;i++) {
		objs[i].move();
		objs[i].draw();
	}
	if (overlap(keySprite, ghostSprite)) {
		score++;
		updateScore();
		placeObjs();
	}
	requestAnimationFrame(renderCanvas);
}

function updateScore() {
	const scoreElem = document.getElementById('score');
	scoreElem.innerHTML = `Score: ${score}`;
}
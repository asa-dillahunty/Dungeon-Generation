/**
 * @author Asa Dillahunty
 */

var interval = null;
var fScreen = false;
var sprites = [];
var objs = [];

var score=0;

document.getElementById("liveSection").style.display = "inherit";

// const scale = 50;

var canvas = document.getElementById("dungeonCanvas");
document.addEventListener('fullscreenchange', function () { 
	fScreen = !fScreen;
	resizeCanvas();
});

const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;



/**
 * Lots of thinking needed here
 * Standard computer screen ratio is 16:9
 * 
 * check resizeCanvas for product
 * 
 * I'll need a standard grid to fit on the screen for each dungeon
 * Honestly, 16x9 wouldn't be a bad grid
 */
const canvasRatio = {width: 16, height: 9};
var canvasWrapper = document.getElementById("canvasWrapper");
var scale;
resizeCanvas();
canvasWrapper.addEventListener("mouseenter",function (event) {
	document.getElementById("fullScreen").style.display = 'inherit';
});
canvasWrapper.addEventListener("mouseleave",function (event) {
	document.getElementById("fullScreen").style.display = 'none';
});
// document.getElementById("canvasWrapper").style.display = 'none';



var size = 2;

for (var i=0;i<4;i++) {
	objs.push(buildBox(0,0,size,size,'./images/B1.png'));
}

// var a = buildCell("#0000FF", 0, 0, size*scale, size*scale);
// var b = buildCell("#FFFF00", 0, 0, size*scale, size*scale);
// var c = buildCell("#FF0000", 0, 0, size*scale, size*scale);


var keySprite = newSprite(.3,1,9,30,'./images/K1.png',[0,1,2,1],5,.1);
keySprite.faces = false;
var ghostSprite = newSprite(1,1,32,32,'./images/G12.png',[0,1],5,.1);

objs.push(ghostSprite);
objs.push(keySprite);
// sprites.push(ghostSprite);
// sprites.push(keySprite);

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
	else if (event.code === "Space") {
		// for debugging
		for (var i=0;i<objs.length;i++) console.log(objs[i]);
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
		stepSize: stepSize,
		draw: function() {
			if (this.faces)
				if (this.velocity.left == -1) this.facing = 1;
				else if (this.velocity.right) this.facing = 0;

			context.drawImage(this.img, this.imgW*(this.frameArr[this.frameIndex]), this.imgH*this.facing, this.imgW, this.imgH, this.cord.x*scale, this.cord.y*scale, this.width*scale, this.height*scale);
			
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

			// make sure fits tens place
			// this could be fixed another way, multiply everything by ten ? 
			// Definitely has a needless negative impact on performance, 
			// 	especially since I have to do it up to four more times
			this.cord.x = Math.round(this.cord.x * 10) / 10;
			this.cord.y = Math.round(this.cord.y * 10) / 10;

			for (var i=0;i<objs.length;i++) {
				if (objs[i] === this || objs[i].permeable) continue;
				else if (overlap(this,objs[i])) {
					// TODO: get as close to this object as allowed

					// Bug - down left cannot glide across blocks
					// this is because when you meet at a corner, it chooses to sacrifice 
					// horizontal motion before vertical, and then later on, the other block
					// doesn't allow you to go down, voiding both motions
					// This could be fixed using two for loops instead of one, but the time
					// is already so high. I'm leaving this bug until a more clever solution can be found

					this.cord.x -= this.stepSize * (this.velocity.right + this.velocity.left);
					this.cord.x = Math.round(this.cord.x * 10) / 10; // round properly
					if (!overlap(this,objs[i])) continue;
					else this.cord.x += this.stepSize * (this.velocity.right + this.velocity.left);
					this.cord.x = Math.round(this.cord.x * 10) / 10; // round properly

					this.cord.y -= this.stepSize * (this.velocity.up + this.velocity.down);
					this.cord.y = Math.round(this.cord.y * 10) / 10; // round properly
					if (!overlap(this,objs[i])) continue;
					else this.cord.x -= this.stepSize * (this.velocity.right + this.velocity.left);
					this.cord.x = Math.round(this.cord.x * 10) / 10; // round properly
				}
			}
			/**
			 * This handles wrapping around the edges of the canvas
			 * 
			 * Eventually this code will lose its purpose
			 * I use const here because these values never change so long
			 * as canvas.width/height never change, which currently they don't
			 */
			const w = this.width*this.stepSize;
			const ws = w/this.stepSize;
			if (this.cord.x > canvasRatio.width - w) this.cord.x = -ws;
			else if (this.cord.x < -ws) this.cord.x = canvasRatio.width - w;

			const h = this.height*this.stepSize;
			const hs = h/this.stepSize;
			if (this.cord.y > canvasRatio.height - h) this.cord.y = -hs;
			else if (this.cord.y < -hs) this.cord.y = canvasRatio.height - h;
		},
	}


	sprite.img.src = imageURL;
	return sprite;
}

function buildCell(color, x, y, width, height) {
	var cell = {
		cord: {x: x, y: y},
		height: height,
		width: width,
		color: color,
		img: new Image(),
		draw: function () {
			drawCell(this);
		},
		move: function(){}
	};
	return cell;
}

function drawCell(cell) {
	context.fillStyle = cell.color;
	context.fillRect(cell.cord.x*scale,cell.cord.y*scale,cell.width*scale,cell.height*scale);
}

function buildBox(x, y, width, height, imgUrl) {
	var box = {
		cord: {x: x, y: y},
		height: height,
		width: width,
		img: new Image(),
		draw: function () {
			context.drawImage(this.img, this.cord.x*scale, this.cord.y*scale, this.width*scale, this.height*scale);
		}
	};
	box.img.src = imgUrl;
	return box;
}

function anyOverlap(cells) {
	// test every combination
	for (var i=0;i<cells.length-1;i++) {
		for (var j=i+1;j<cells.length;j++) {
			if (overlap(cells[i],cells[j])) {
				return true;
			}
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

function newPoints(cell) {
	// have every point be a multiple of scale
	cell.cord.y = Math.floor( (Math.random() * (canvasRatio.height - cell.height) ) );
	cell.cord.x = Math.floor( (Math.random() * (canvasRatio.width - cell.width) ) );
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
	context.fillStyle = "#EEEEEE";
	context.fillRect(0,0,canvas.width,canvas.height);

	context.imageSmoothingEnabled = false;

	for (var i=0;i<objs.length;i++) {
		if (objs[i].move) objs[i].move();
		objs[i].draw();
	}
	if (overlap(keySprite, ghostSprite)) {
		score++;
		placeObjs();
	}
	drawScore();
	requestAnimationFrame(renderCanvas);
}

function drawScore() {
	var s2 = Math.floor(scale/2);
	var st = scale/5; // 20% of scale, used for padding 
	context.font = `${s2}px Arial`;
	context.fillStyle = "#FFFFFF55";
	context.fillRect(s2 - st,scale - s2 - st,scale*3,scale);

	context.fillStyle = "black";
	context.fillText(`Score: ${score}`, s2, scale);
}

function fullscreen() {
	if (canvas.requestFullscreen) canvas.requestFullscreen();
	else if(canvas.webkitRequestFullScreen) canvas.webkitRequestFullScreen();
	else canvas.mozRequestFullScreen();
}

function closeFullscreen() {
	if (document.exitFullscreen) document.exitFullscreen();
	else if (document.webkitExitFullscreen) document.webkitExitFullscreen(); /* Safari */
	else if (document.msExitFullscreen) document.msExitFullscreen(); /* IE11 */
}

function resizeCanvas() {
	var sw;
	var sh;
	if (!fScreen) {
		sw = Math.floor(window.innerWidth/canvasRatio.width);
		sh = Math.floor(window.innerHeight/canvasRatio.height);
	}
	else {
		sw = Math.floor(screen.width/canvasRatio.width);
		sh = Math.floor(screen.height/canvasRatio.height);
	}
	// scale is the min between the two
	scale = sw < sh ? sw : sh;
	
	// we want a little bit of spacing on the sides of the canvas,
	// so we make scale 80% of what it could be so we take up at most
	// 80% of the width and 80% of the height of the window, probably
	if (!fScreen) scale = Math.floor(scale*.8);

	canvas.width = Math.floor(scale * canvasRatio.width);
	canvas.height = Math.floor(scale * canvasRatio.height);
	
	canvasWrapper.style.width = canvas.width+'px';
	canvasWrapper.style.height = canvas.height+'px';
}

// var x = document.getElementById("gameAudio");

// function playAudio() {
//   x.play();
// }

// function pauseAudio() {
//   x.pause();
// }
activateDPad();
function activateDPad () {
	var touchSection = document.getElementById("touchSection");
	touchSection.addEventListener("touchstart", function (event) { event.preventDefault(); });
	
	var upArrow = document.getElementById("dPadUp");
	upArrow.addEventListener("touchstart", function (event) {
		event.preventDefault();
		move('up');
	});
	upArrow.addEventListener("touchend", function (event) {
		event.preventDefault();
		release('up');
	});

	var downArrow = document.getElementById("dPadDown");
	downArrow.addEventListener("touchstart", function (event) {
		event.preventDefault();
		move('down');
	});
	downArrow.addEventListener("touchend", function (event) {
		event.preventDefault();
		release('down');
	});

	var leftArrow = document.getElementById("dPadLeft");
	leftArrow.addEventListener("touchstart", function (event) {
		event.preventDefault();
		move('left');
	});
	leftArrow.addEventListener("touchend", function (event) {
		event.preventDefault();
		release('left');
	});

	var rightArrow = document.getElementById("dPadRight");
	rightArrow.addEventListener("touchstart", function (event) {
		event.preventDefault();
		move('right');
	});
	rightArrow.addEventListener("touchend", function (event) {
		event.preventDefault();
		release('right');
	});
}

function move(direction) {
	switch(direction) {
		case ('up'):
			ghostSprite.velocity.up = -1;
			keySprite.velocity.up = -1;
			break;
		case ('down'):
			ghostSprite.velocity.down = 1;
			keySprite.velocity.down = 1;
			break;
		case ('left'):
			ghostSprite.velocity.left = -1;
			keySprite.velocity.left = -1;
			break;
		case ('right'):
			ghostSprite.velocity.right = 1;
			keySprite.velocity.right = 1;
			break;
		default:
			// eh
			break;
	}
}

function release(direction) {
	switch (direction) {
		case ('up'):
			ghostSprite.velocity.up = 0;
			keySprite.velocity.up = 0;
			break;
		case ('down'):
			ghostSprite.velocity.down = 0;
			keySprite.velocity.down = 0;
			break;
		case ('left'):
			ghostSprite.velocity.left = 0;
			keySprite.velocity.left = 0;
			break;
		case ('right'):
			ghostSprite.velocity.right = 0;
			keySprite.velocity.right = 0;
			break;
		default:
			// eh
			break;
	}
}

// path finding
function AStar(obj) {
	// using push and pop on a typical
	// javascript array should act like a stack

	var start = buildCell("#0000FF", 0, 0, 1, 1);
	var end = {
		cord: {x:canvasRatio.width-1,y:canvasRatio.height-1},
	};

	var curr = start;
	var path = [];
	var points = newPriorityQueue();
	points.add(start,0);
	var touched = [];
	
	while (points.head) {
		curr = points.pop();
		touched.push(curr);
		// console.log(points);
		if (curr.cord.x == end.cord.x && curr.cord.y == end.cord.y) {
			path.push(curr);
			break;
		}

		pos = getPos(curr,touched);
		if (pos.length < 1) {
			path.pop();
		}
		path.push(curr);

		// this part needs to be randomized
		pos = scramble(pos);
		for (var i=0;i<pos.length;i++) {
			points.add(pos[i], Math.abs(end.cord.x - pos[i].cord.x) + Math.abs(end.cord.y - pos[i].cord.y));
		}
		// console.log(curr);
		// break;
	}
	
	for (var i=0;i<path.length;i++) {
		objs.push(path[i]);
	}

	// var a = buildCell("#0000FF", 0, 0, size*scale, size*scale);
	// objs.push(a);
}

// AStar(null);

function getPos(point,touched) {
	var pos = [];
	var deltas = [{dx:0,dy:1},{dx:1,dy:0}];

	for (var i=-1;i<2;i+=2) {
		for (var j=0;j<deltas.length;j++) {
			var thing = buildCell("#0000FF", point.cord.x + deltas[j].dx * i, point.cord.y + deltas[j].dy * i,1,1)

			objs.push(thing);
			if (inBounds(thing) && !anyOverlap(objs) && !hasPoint(thing,touched)) pos.push(thing);
			objs.pop();
		}
	}

	return pos;
}

function hasPoint(point,points) {
	for (var i=0;i<points.length;i++) {
		if (point.cord.x == points[i].cord.x && point.cord.y == points[i].cord.y) return true;
	}
	return false;
}

function inBounds(obj) {
	if (obj.cord.x > canvasRatio.width || obj.cord.y > canvasRatio.height || obj.cord.x < 0 || obj.cord.y < 0) return false;
	else return true;
}

function scramble(array) {
	var randomList = newPriorityQueue();
	for (var i=0;i<array.length;i++) {
		randomList.add(array[i],Math.random());
	}
	return randomList.toArray();
}

// thing = [1,2,3];
// console.log(scramble(thing));
// console.log(getPos({x:1,y:1},[{x:1,y:0}]));


function newPriorityQueue() {
	return {
		head:null,
		size:0,
		add: function(obj, priority) {
			var node = {val: obj, weight: priority, next: null}

			this.size++;
			if (this.head == null) {
				this.head = node;
			}
			else if (node.weight < this.head.weight) {
				node.next = this.head;
				this.head = node;
			}
			else {
				var curr = this.head;
				while (curr.next && curr.next.weight < node.weight) {
					curr = curr.next;
				}
				node.next = curr.next;
				curr.next = node;
			}
		},
		pop: function() {
			this.size--;
			var temp = this.head;
			this.head = this.head.next;
			return temp.val;
		},
		contains: function(point) {
			// used for a point obj
			var curr = this.head;
			while (curr) {
				if (curr.val.x == point.x && curr.val.y == point.y) return true;
				curr = curr.next;
			}
			return false;
		},
		toArray: function() {
			var arr = [];
			var curr = this.head;
			while (curr) {
				arr.push(curr.val);
				curr = curr.next;
			}

			return arr;
		},
		print: function() {
			var curr = this.head;
			while (curr) {
				console.log(curr.val);
				curr = curr.next;
			}
		}
	};
}
/**
 * @author Asa Dillahunty
 */

var interval = null;
renderDungeon();


document.getElementById("liveSection").style.display = "inherit";

function renderDungeon() {
	const scale = 50;

	var canvas = document.getElementById("dungeonCanvas");
	canvas.width = 15*scale;
	canvas.height = 10*scale;

	var size = 2;

	var a = buildCell("#0000FF", 0, 0, size*scale, size*scale);
	var b = buildCell("#FFFF00", 0, 0, size*scale, size*scale);
	var c = buildCell("#FF0000", 0, 0, size*scale, size*scale);
	

	while (anyOverlap([a,b,c])) {
		newPoints(c,canvas);
		newPoints(b,canvas);
		newPoints(a,canvas);
	}

	var sprite = {
		width: 50,
		height: 50,
		imgW: 160,
		imgH: 160,
		cord: {x: 0, y: 0},
		velocity: {x:0, y:0},
		pace: 5,
		img: new Image(),
		count: 0,
		offset: 200,
		draw: function(context) {
			context.drawImage(this.img, this.offset*this.count, 0, this.imgW, this.imgH, this.cord.x, this.cord.y, this.width, this.height);
			this.count = (this.count + 1)%5;
		},
		move: function() {
			this.cord.x += this.pace*this.velocity.x;
			this.cord.y += this.pace* this.velocity.y;
		}
	}
	sprite.img.src = './images/G7.png';

	renderCanvas([a,b,c,sprite], canvas);
	
	if (interval) clearInterval(interval);
	interval = setInterval( () => {
		renderCanvas([a,b,c,sprite], canvas);
		// if (count == 0) ctx.drawImage(sprite,0,0,160,182,0,0,160,182);
		// else ctx.drawImage(sprite,200,0,160,182,0,0,160,182);
	}, 100);

	document.addEventListener('keydown', function(event) {
		if (event.code === "KeyW") sprite.velocity.y = -1;
		else if (event.code === "KeyS") sprite.velocity.y = 1;
		else if (event.code === "KeyA") sprite.velocity.x = -1;
		else if (event.code === "KeyD") sprite.velocity.x = 1;
	});

	document.addEventListener('keyup', function(event) {
		if (event.code === "KeyW") sprite.velocity.y = 0;
		else if (event.code === "KeyS") sprite.velocity.y = 0;
		else if (event.code === "KeyA") sprite.velocity.x = 0;
		else if (event.code === "KeyD") sprite.velocity.x = 0;
	});
}

function buildCell(color, x, y, width, height) {
	return {
		x: x,
		y: y,
		height: height,
		width: width,
		color: color,
		draw: function (context) {
			drawCell(context,this);
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
	var wO = false;
	var hO = false;

	if (a.x <= b.x && a.x + a.width >= b.x) wO = true;
	else if (a.x <= b.x + b.width && a.x + a.width >= b.x + b.width) wO = true;

	if (a.y <= b.y && a.y + a.height >= b.y) hO = true;
	else if (a.y <= b.y + b.height && a.y + a.height >= b.y + b.height) hO = true;

	return wO && hO;
}

function newPoints(cell, canvas) {
	cell.y = Math.floor(Math.random()* (canvas.height - cell.height));
	cell.x = Math.floor(Math.random()* (canvas.width - cell.width));
}

function drawCell(ctx, cell) {
	ctx.fillStyle = cell.color;
	ctx.fillRect(cell.x,cell.y,cell.width,cell.height);
}

function renderCanvas(objs, canvas) {
	const context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "#000000";
	context.fillRect(0,0,canvas.width,canvas.height);

	for (var i=0;i<objs.length;i++) {
		objs[i].move();
		objs[i].draw(context);
	}
}
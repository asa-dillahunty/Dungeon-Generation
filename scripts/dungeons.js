var interval = null;
renderDungeon();

document.getElementById("liveSection").style.display = "inherit";

function renderDungeon() {
	const scale = 50;

	var canvas = document.getElementById("dungeonCanvas");
	canvas.width = 15*scale;
	canvas.height = 10*scale;

	var size = 2;

	var c = {
		x:0,
		y:0,
		height: size * scale,
		width: size * scale,
		color: "#0000FF",
		draw: function (context) {
			drawCell(context,this);
		}
	};
	var b = {
		x:0,
		y:0,
		height: size * scale,
		width: size * scale,
		color: "#FFFF00",
		draw: function (context) {
			drawCell(context,this);
		}
	};
	var a = {
		x:0,
		y:0,
		height: size * scale,
		width: size * scale,
		color: "#FF0000",
		draw: function (context) {
			drawCell(context,this);
		}
	}

	while (anyOverlap([a,b,c])) {
		newPoints(c,canvas);
		newPoints(b,canvas);
		newPoints(a,canvas);
	}

	var sprite = {
		width: 160,
		height: 160,
		imgW: 160,
		imgH: 160,
		img: new Image(),
		count: 0,
		offset: 200,
		draw: function(context) {
			context.drawImage(this.img, this.offset*this.count, 0, this.imgW, this.imgH, 0, 0, this.width, this.height);
			this.count = (this.count + 1)%5;
		},
	}
	sprite.img.src = './images/G7.png';

	renderCanvas([a,b,c,sprite], canvas);
	
	if (interval) clearInterval(interval);
	interval = setInterval( () => {
		renderCanvas([a,b,c,sprite], canvas);
		// if (count == 0) ctx.drawImage(sprite,0,0,160,182,0,0,160,182);
		// else ctx.drawImage(sprite,200,0,160,182,0,0,160,182);
	}, 300);
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

	for (var i=0;i<objs.length;i++) {
		objs[i].draw(context);
	}
}
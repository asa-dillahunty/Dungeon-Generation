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
		color: "#0000FF"
	};
	var b = {
		x:0,
		y:0,
		height: size * scale,
		width: size * scale,
		color: "#FFFF00"
	};
	var a = {
		x:0,
		y:0,
		height: size * scale,
		width: size * scale,
		color: "#FF0000"
	}

	while (anyOverlap([a,b,c])) {
		newPoints(c,canvas);
		newPoints(b,canvas);
		newPoints(a,canvas);
	}

	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "#000000"; // default to black

	// if (i >= cWidth && i <= cWidth + size && j >= cHeight && j <= cHeight + size) {
	// 	ctx.fillStyle = "#555555"; // grey?
	// }

	// else if (i >= bWidth && i <= bWidth + size && j >= bHeight && j <= bHeight + size) {
	// 	ctx.fillStyle = "#999999"; // grey?
	// }
	
	// flip i and j because I set up my matrix wrong and don't want to fix it
	ctx.fillRect(0,0,canvas.width,canvas.height);

	drawCell(ctx,c);
	drawCell(ctx,b);
	drawCell(ctx,a);
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
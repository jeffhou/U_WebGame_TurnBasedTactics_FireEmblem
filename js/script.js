// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 512;
mapMaxX = 26;
mapMaxY = 26;
mapDisplacementX = 0;
mapDisplacementY = 0;
document.body.appendChild(canvas);

// Hero image
var cursorReady = false;
var cursorImage = new Image();
cursorImage.onload = function () {
    cursorReady = true;
};
cursorImage.src = "images/cursor.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
    heroReady = true;
};
heroImage.src = "images/character.png";

// girl image
var girlReady = false;
var girlImage = new Image();
girlImage.onload = function () {
    girlReady = true;
};
girlImage.src = "images/female_character_smiling.png";

// Terrain image
var terrainReady = false;
var terrainImage = new Image();
terrainImage.onload = function () {
    terrainReady = true;
};
terrainImage.src = "images/grass_terrain.png";

// Terrain image
var wallReady = false;
var wallImage = new Image();
wallImage.onload = function () {
    wallReady = true;
};
wallImage.src = "images/wall_terrain.png";

// Game objects
var hero = {
    //speed: 256 // movement in pixels per second
};
var girl = {};
var girlsCaught = 0;
var cursor = {};
cursor.x = 0;
cursor.y = 0;
// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
}, false);

// Reset the game when the player catches a girl
var reset = function () {
	
    hero.x = 1;
    hero.y = 1;

	mapDisplacementX = 0;
	mapDisplacementY = 0;
	
    // Throw the girl somewhere on the screen randomly
    girl.x = 2 + Math.floor(Math.random() * (mapMaxX - 3));
    girl.y = 2 + Math.floor(Math.random() * (mapMaxY - 3));
};

// Update game objects
var update = function (modifier) {
    if (38 in keysDown) { // Player holding up
		if(cursor.y != 0){
			cursor.y -= 1;
		}
		if (mapDisplacementY > 0 && cursor.y - mapDisplacementY == 2) {
			mapDisplacementY--;
		}
		//cursor.y = (cursor.y + 16) % 16;
		delete keysDown[38];
    }
    if (40 in keysDown) { // Player holding down
        if(cursor.y != mapMaxY - 1){
			cursor.y += 1;
		}
		if (mapDisplacementY < mapMaxY - 16 && cursor.y - mapDisplacementY == 13) {
			mapDisplacementY++;
		}
		//cursor.y += 1;
		//cursor.y = cursor.y % 16;
		delete keysDown[40];
    }
    if (37 in keysDown) { // Player holding left
        if(cursor.x != 0){
			cursor.x -= 1;
		}
		if (mapDisplacementX > 0 && cursor.x - mapDisplacementX == 2) {
			mapDisplacementX--;
		}
		//cursor.x -= 1;
		//cursor.x = (cursor.x + 16) % 16;
		delete keysDown[37];
    }
    if (39 in keysDown) { // Player holding right
        if(cursor.x != mapMaxX - 1){
			cursor.x += 1;
		}
		if (mapDisplacementX < mapMaxX - 16 && cursor.x - mapDisplacementX == 13) {
			mapDisplacementX++;
		}
		//cursor.x = cursor.x % 16;
		delete keysDown[39];
    }

    // Are they touching?
    if (hero.x == girl.x && girl.y == hero.y) {
        ++girlsCaught;
        reset();
    }
};
var mapGrid = [];
for (i = 0; i < mapMaxX; i++) {
	mapGrid.push([]);
	for (j = 0; j < mapMaxY; j++) {
		if (i == 0 || j == 0 || i == mapMaxX - 1 || j == mapMaxY - 1) {
			mapGrid[i].push(1);
		} else {
			mapGrid[i].push(0);
		}
	}
}
mapGrid[3][0] = 0;
// Draw everything
var render = function () {
    if (terrainReady && wallReady) {
        for(i = 0; i < 16; i++){
            for(j = 0; j < 16; j++){
                if(mapGrid[i + mapDisplacementX][j + mapDisplacementY] == 0){
					ctx.drawImage(terrainImage, i*32, j*32);
				}else if(mapGrid[i + mapDisplacementX][j + mapDisplacementY] == 1){
					ctx.drawImage(wallImage, i*32, j*32);
				}
            }
        }
    }

    if (heroReady) {
        ctx.drawImage(heroImage, (hero.x - mapDisplacementX) * 32, (hero.y - mapDisplacementY) * 32);
    }

    if (girlReady) {
        ctx.drawImage(girlImage, (girl.x - mapDisplacementX) * 32, (girl.y - mapDisplacementY) * 32);
    }
	if (cursorReady) {
		ctx.drawImage(cursorImage, (cursor.x - mapDisplacementX) * 32, (cursor.y - mapDisplacementY) * 32)
	}
    // Score
    ctx.fillStyle = "rgb(250, 250, 250)";
    ctx.font = "24px Helvetica";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Girls saved: " + girlsCaught, 32, 32);
};

// The main game loop
var main = function () {
    var now = Date.now();
    var delta = now - then;

    update(delta / 1000);
    render();

    then = now;

    // Request to do this again ASAP
    requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
reset();
main();

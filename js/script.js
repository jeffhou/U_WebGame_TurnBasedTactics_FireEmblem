var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
TILE_WIDTH = 32; TILE_HEIGHT = 32;
canvas.x = 15; canvas.y = 10;
canvas.width = 500; canvas.height = 369;
mapMaxX = 18; mapMaxY = 13;
mapDisplacementX = 0; mapDisplacementY = 0;
document.body.appendChild(canvas);
availableMoves = [];
attackMoveRange = [];
hashedDirections = [-1000, -1, 1, 1000];
selectedObject = false;
gameCanvasX = 10;
gameCanvasY = 40;
function drawImage (image, x, y) {
	ctx.drawImage(image, x + gameCanvasX, y + gameCanvasY);
}
function hashCoor (coor) {
	return coor[0] * 1000 + coor[1];
}
function unhashCoor (hashedCoor) {
	return [parseInt(hashedCoor/1000), hashedCoor%1000];
}
function LoadedImage (imagePath) {
	this.image = new Image();
	this.image.ready = false;
	this.image.onload = function () {
		this.ready = true;
	}
	this.image.src = imagePath;
}
function MapObject (movementRange) {
	this.movementRange = movementRange;
}
cursorImage = new LoadedImage("images/cursor.png");
heroImage = new LoadedImage("images/character.png");
girlImage = new LoadedImage("images/female_character_smiling.png");
terrainImage = new LoadedImage("images/grass_terrain.png");
wallImage = new LoadedImage("images/wall_terrain.png");
blueImage = new LoadedImage("images/blue_highlight2.png");
wrapperImage = new LoadedImage("images/vba-window.png");
redImage = new LoadedImage("images/red_highlight1.png");

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
	cursor.x = 1;
	cursor.y = 1;
	
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
		delete keysDown[38];
    }
    if (40 in keysDown) { // Player holding down
        if(cursor.y != mapMaxY - 1){
			cursor.y += 1;
		}
		if (mapDisplacementY < mapMaxY - canvas.y && cursor.y - mapDisplacementY == canvas.y - 3) {
			mapDisplacementY++;
		}
		delete keysDown[40];
    }
    if (37 in keysDown) { // Player holding left
        if(cursor.x != 0){
			cursor.x -= 1;
		}
		if (mapDisplacementX > 0 && cursor.x - mapDisplacementX == 2) {
			mapDisplacementX--;
		}
		delete keysDown[37];
    }
    if (39 in keysDown) { // Player holding right
        if(cursor.x != mapMaxX - 1){
			cursor.x += 1;
		}
		if (mapDisplacementX < mapMaxX - canvas.x && cursor.x - mapDisplacementX == canvas.x - 3) {
			mapDisplacementX++;
		}
		delete keysDown[39];
    }
	if (90 in keysDown){ // pressed "z" which is actually "a" for our emulator
		if (selectedObject == false) {
			if(hero.x == cursor.x && hero.y == cursor.y){
				console.log("a");
				selectedObject = true;
				availableMoves = [];
				availableMoves.push(hashCoor([hero.x, hero.y]));
				attackMoveRange = [];
				for(i = 0; i < 5; i++){
					var old_length = availableMoves.length;
					for(j = 0; j < old_length; j++){
						for(k = 0; k < hashedDirections.length; k++){
							if(availableMoves.indexOf(hashedDirections[k] + availableMoves[j]) == -1 && mapGrid[unhashCoor(hashedDirections[k] + availableMoves[j])[0]][unhashCoor(hashedDirections[k] + availableMoves[j])[1]] == 0){
								availableMoves.push(hashedDirections[k] + availableMoves[j]);
							}
						}
					}
				}
				for (i = 0; i < availableMoves.length; i++) {
					for (j = 0; j < hashedDirections.length; j++) {
						if(availableMoves.indexOf(hashedDirections[j] + availableMoves[i]) == -1 && attackMoveRange.indexOf(hashedDirections[j] + availableMoves[i]) == -1){
							attackMoveRange.push(hashedDirections[j] + availableMoves[i]);
						}
					}
				}
				
			}
		}else{
			if (availableMoves.indexOf(hashCoor([cursor.x, cursor.y])) != -1){
				selectedObject = false;
				availableMoves = [];
				attackMoveRange = [];
				hero.x = cursor.x;
				hero.y = cursor.y;
			}
		}
		
		delete keysDown[90];
	}
	if (88 in keysDown) {
		selectedObject = false;
		availableMoves = [];
		delete keysDown[88];		
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
mapGrid[5][5] = 1;
mapGrid[5][6] = 1;
mapGrid[5][7] = 1;
// Draw everything
var render = function () {
	
    if (wallImage.image && wallImage.image) {
        for(i = 0; i < canvas.x; i++){
            for(j = 0; j < canvas.y; j++){
                if(mapGrid[i + mapDisplacementX][j + mapDisplacementY] == 0){
					drawImage(terrainImage.image, i*32, j*32);
				}else if(mapGrid[i + mapDisplacementX][j + mapDisplacementY] == 1){
					drawImage(wallImage.image, i*32, j*32);
				}
            }
        }
    }
	
	if (blueImage.image.ready) {
		for(i = 0; i < canvas.x; i++){
            for(j = 0; j < canvas.y; j++){
                if(availableMoves.indexOf(hashCoor([i + mapDisplacementX, j + mapDisplacementY])) != -1){
					drawImage(blueImage.image, i*32, j*32);
				}
            }
        }
	}
	if (redImage.image.ready) {
		for(i = 0; i < canvas.x; i++){
            for(j = 0; j < canvas.y; j++){
                if(attackMoveRange.indexOf(hashCoor([i + mapDisplacementX, j + mapDisplacementY])) != -1){
					drawImage(redImage.image, i*32, j*32);
				}
            }
        }
	}
    if (heroImage.image.ready) {
        drawImage(heroImage.image, (hero.x - mapDisplacementX) * 32, (hero.y - mapDisplacementY) * 32);
    }

    if (girlImage.image.ready) {
        drawImage(girlImage.image, (girl.x - mapDisplacementX) * 32, (girl.y - mapDisplacementY) * 32);
    }
	if (cursorImage.image.ready) {
		drawImage(cursorImage.image, (cursor.x - mapDisplacementX) * 32, (cursor.y - mapDisplacementY) * 32)
	}
	
	if(wrapperImage.image.ready){
		ctx.drawImage(wrapperImage.image, 0, 0);
	}
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
var keysDown = {};
addEventListener("keydown", function (e) { keysDown[e.keyCode] = true }, false);
addEventListener("keyup", function (e) { delete keysDown[e.keyCode] }, false);

var canvas = document.createElement("canvas");
var context = canvas.getContext("2d");
canvas.width = 500; canvas.height = 369;
document.body.appendChild(canvas);
attackMoveRange = [];
availableMoves = [];
function Game (numPlayers) {
	this.numPlayers = numPlayers;
	this.currentPlayer = 0;
	this.turnMode = 0;
	// turnMode: 0 = equilibrium, 1 = unit selected (moving), 2 = unit moved (action)
}
var game = new Game(2);

var CONSTANTS = new function () {
	this.hashedDirections = [-1000, -1, 1, 1000];
	this.tileWidth = 32;
	this.mapWidth = 15;
	this.mapHeight = 10;
}
function hashCoor (coor) {
	return coor[0] * 1000 + coor[1];
}
function unhashCoor (hashedCoor) {
	return [parseInt(hashedCoor/1000), hashedCoor%1000];
}

var cursor = new function () {
	this.imageObject = new ImageObject ("images/cursor.png");
	this.x = 0;
	this.y = 0;
}

function ImageObject (imagePath) {
	this.image = new Image();
	this.image.ready = false;
	this.image.onload = function () {
		this.ready = true;
	}
	this.image.src = imagePath;
} ImageObject.prototype.draw = function (x, y) {
	//TODO: Should not draw if not on canvas or not on VBA screen (if relevant)
	if (this.image.ready) {
		context.drawImage(this.image, x, y);
	}
}; ImageObject.prototype.drawWithDisplacement = function (x, y, displaceX, displaceY) {
	this.draw(x + displaceX, y + displaceY);
}; ImageObject.prototype.drawOnScreen = function (x, y) {
	this.drawWithDisplacement(x, y, 10, 40);
}; ImageObject.prototype.drawOnGrid = function (tileX, tileY) {
	this.drawOnScreen((tileX - grid.xDisplace) * CONSTANTS.tileWidth, (tileY - grid.yDisplace) * CONSTANTS.tileWidth);
};

function Unit (name, maxHP, attack, move, imagePath, playerID) {
	this.name = name;
	this.maxHP = maxHP;
	this.currentHP = maxHP;
	this.attack = attack;
	this.move = move;
	this.image = new ImageObject (imagePath);
	this.active = true; // turns to false after it moves.
	this.playerID = playerID;
	this.x = 0;
	this.y = 0;
}

function Terrain (traversable) {
	this.traversable = traversable;
	this.unit = null;
} Terrain.prototype.setUnit = function (unit) {
	this.unit = unit;
};
terrainMapObjects = {};
terrainMapObjects[false] = new ImageObject("images/wall_terrain.png");
terrainMapObjects[true] = new ImageObject("images/grass_terrain.png");

blueHighlight = new ImageObject("images/blue_highlight2.png");
redHighlight = new ImageObject("images/red_highlight1.png");

var units = [];
units.push(new Unit("boy", 10, 3, 4, "images/character.png", 0));
units.push(new Unit("girl", 10, 3, 4, "images/female_character_smiling.png", 0));
units.push(new Unit("monster", 10, 3, 4, "images/monster.png", 1));

function activateUnits () {
	for (i = 0; i < units.length; i++) {
		units[i].active = true;
	}
}
function existsActiveUnits () {
	for (i = 0; i < units.length; i++) {
		if(units[i].active) return true;
	}
	return false;
}

function Grid () {
	this.grid = [];
	this.width = 15;
	this.height = 10;
	this.xDisplace = 0;
	this.yDisplace = 0;
	this.selectedObject = null;
	for (i = 0; i < this.width; i++) {
		this.grid.push([]);
		//console.log(this.grid);
		for (j = 0; j < this.height; j++) {
			if (i == 0 || j == 0 || i == this.width - 1 || j == this.height - 1) {
				//console.log(this.grid[i]);
				//console.log(i);
				this.grid[i].push(new Terrain(false));
			} else {
				this.grid[i].push(new Terrain(true));
			}
		}
	}
	this.placeUnitAt(units[0], 1, 1);
	this.placeUnitAt(units[1], 3, 1);
	this.placeUnitAt(units[2], 7, 7);
} Grid.prototype.placeUnitAt = function (unit, x, y) {
	if (this.grid[unit.x][unit.y].unit == unit) {
		this.grid[unit.x][unit.y].unit = null;
	}
	unit.x = x;
	unit.y = y;
	this.grid[x][y].unit = unit;
};
var grid = new Grid();

wrapperImage = new ImageObject("images/vba-window.png");

function processInputs () {
	if (38 in keysDown) { // Player holding up
		if(cursor.y != 0) {
			cursor.y -= 1;
		}
		if (grid.yDisplace > 0 && cursor.y - grid.yDisplace == 2) {
			grid.yDisplace--;
		}
		delete keysDown[38];
    }
    if (40 in keysDown) { // Player holding down
        if(cursor.y != grid.height - 1) {
			cursor.y += 1;
		}
		if (grid.yDisplace < grid.height - CONSTANTS.mapHeight && cursor.y - grid.yDisplace == CONSTANTS.mapHeight - 3) {
			grid.yDisplace++;
		}
		delete keysDown[40];
    }
    if (37 in keysDown) { // Player holding left
        if(cursor.x != 0) {
			cursor.x -= 1;
		}
		if (grid.xDisplace > 0 && cursor.x - grid.xDisplace == 2) {
			grid.xDisplace--;
		}
		delete keysDown[37];
    }
    if (39 in keysDown) { // Player holding right
        if(cursor.x != grid.width - 1) {
			cursor.x += 1;
		}
		if (grid.xDisplace < grid.width - CONSTANTS.mapWidth && cursor.x - grid.xDisplace == CONSTANTS.mapWidth - 3) {
			grid.xDisplace++;
		}
		delete keysDown[39];
    }
	if (90 in keysDown) { // pressed "z" which is actually "a" for our emulator
		if (grid.selectedObject == null) { // no unit selected yet and "a" just pressed
			if (grid.grid[cursor.x][cursor.y].unit != null && grid.grid[cursor.x][cursor.y].unit.playerID == game.currentPlayer && grid.grid[cursor.x][cursor.y].unit.active) { // cursor is on an active unit belonging to the current player
				grid.selectedObject = grid.grid[cursor.x][cursor.y].unit;
				availableMoves = [];
				availableMoves.push(hashCoor([cursor.x, cursor.y]));
				attackMoveRange = [];
				for(i = 0; i < grid.grid[cursor.x][cursor.y].unit.move; i++){
					var old_length = availableMoves.length;
					for(j = 0; j < old_length; j++){
						for(k = 0; k < CONSTANTS.hashedDirections.length; k++){
							//console.log("i: " + i + " j: " + j + " k: " + k);
							if(availableMoves.indexOf(CONSTANTS.hashedDirections[k] + availableMoves[j]) == -1) { // move not already in list
								if(grid.grid[unhashCoor(CONSTANTS.hashedDirections[k] + availableMoves[j])[0]][unhashCoor(CONSTANTS.hashedDirections[k] + availableMoves[j])[1]].traversable == true) {
									// line below says you can't move through other ppl's units
									if(grid.grid[unhashCoor(CONSTANTS.hashedDirections[k] + availableMoves[j])[0]][unhashCoor(CONSTANTS.hashedDirections[k] + availableMoves[j])[1]].unit == null || grid.grid[unhashCoor(CONSTANTS.hashedDirections[k] + availableMoves[j])[0]][unhashCoor(CONSTANTS.hashedDirections[k] + availableMoves[j])[1]].unit.playerID == game.currentPlayer) {
										availableMoves.push(CONSTANTS.hashedDirections[k] + availableMoves[j]);									
									}
								}

							}
						}
					}
				}
				for (i = 0; i < availableMoves.length; i++) {
					for (j = 0; j < CONSTANTS.hashedDirections.length; j++) {
						if(availableMoves.indexOf(CONSTANTS.hashedDirections[j] + availableMoves[i]) == -1 && attackMoveRange.indexOf(CONSTANTS.hashedDirections[j] + availableMoves[i]) == -1) {
							attackMoveRange.push(CONSTANTS.hashedDirections[j] + availableMoves[i]);
						}
					}
				}
				game.turnMode = 1;
			}
		} else { // a unit was already selected and "a" just pressed
			if (game.turnMode == 1) {
				if (availableMoves.indexOf(hashCoor([cursor.x, cursor.y])) != -1 && grid.grid[cursor.x][cursor.y].unit == null) {
					grid.placeUnitAt(grid.selectedObject, cursor.x, cursor.y);
					grid.selectedObject = null;
					availableMoves = [];
					attackMoveRange = [];
					game.turnMode = 2;
					// unit just moved
				} else {
					console.log("invalid click");
				}
			} else if (game.turnMode == 2) {
				// unit needs to perform action or wait
				// check to see if there are any other units of the current player who is active, if none exist, end turn
			}
			
		}
		delete keysDown[90];
	}
}

function drawAll () {
	wrapperImage.draw(0, 0);
	
	// print units
	for (i = 0; i < CONSTANTS.mapWidth; i++) {
		for (j = 0; j < CONSTANTS.mapHeight; j++) {
			terrainMapObjects[grid.grid[i + grid.xDisplace][j + grid.yDisplace].traversable].drawOnGrid(i + grid.xDisplace, j + grid.yDisplace);
		}
	}

	for(i = 0; i < grid.width; i++){
		for(j = 0; j < grid.height; j++){
			if(availableMoves.indexOf(hashCoor([i + grid.xDisplace, j + grid.yDisplace])) != -1) {
				blueHighlight.drawOnGrid(i, j);
			}
		}
	}

	for(i = 0; i < grid.width; i++){
		for(j = 0; j < grid.height; j++){
			if(attackMoveRange.indexOf(hashCoor([i + grid.xDisplace, j + grid.yDisplace])) != -1) {
				redHighlight.drawOnGrid(i, j);
			}
		}
	}

	for (i = 0; i < CONSTANTS.mapWidth; i++) {
		for (j = 0; j < CONSTANTS.mapHeight; j++) {
			if (grid.grid[i + grid.xDisplace][j + grid.yDisplace].unit) {
				grid.grid[i + grid.xDisplace][j + grid.yDisplace].unit.image.drawOnGrid(i + grid.xDisplace, j + grid.yDisplace);
			}
		}
	}
	cursor.imageObject.drawOnGrid(cursor.x, cursor.y);
};

var main = function () {
	processInputs();
    drawAll();
    requestAnimationFrame(main);
};
main();
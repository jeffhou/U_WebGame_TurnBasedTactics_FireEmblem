var keysDown = {};
addEventListener("keydown", function (e) { keysDown[e.keyCode] = true }, false);	//eventlisteners! so that the game knows to watch out for keypresses! woah!
addEventListener("keyup", function (e) { delete keysDown[e.keyCode] }, false);

var canvas = document.createElement("canvas"); //this creates the canvas! all the stuff we see exists on the canvas! woah!
var context = canvas.getContext("2d");	//canvas specifications

canvas.width = 500; canvas.height = 369;	//canvas specifications (size)
document.body.appendChild(canvas);			//place canvas in the main html code? woah?
attackMoveRange = [];
availableMoves = [];
function Game (numPlayers) {		//sets initial game parameters? woah?
	this.numPlayers = numPlayers;
	this.currentPlayer = 0;
	this.turnMode = 0;
	this.phase = "neutral";			//im assuming this is defined somewhere
}
var game = new Game(2);				//initialize game object! woah!


//dunno how this syntax works:
var CONSTANTS = new function () { //Lors notes different ways to make class; this is a singleton (sftwr design pattern) there can only be one instance of this class. 
	this.hashedDirections = [-1000, -1, 1, 1000];
	this.tileWidth = 32;			//game map specifications
	this.mapWidth = 15;
	this.mapHeight = 10;
};

var IMAGES = new function () {
	this.menu_top = new ImageObject ("images/menu-top.png");
	this.menu_mid = new ImageObject ("images/menu-middle.png");
	this.menu_bot = new ImageObject ("images/menu-bottom.png");
	this.menu_cursor = new ImageObject ("images/menu-cursor.png");
	this.terrainMapObjects = {};
	this.terrainMapObjects[false] = new ImageObject("images/wall_terrain.png");
	this.terrainMapObjects[true] = new ImageObject("images/grass_terrain.png");
	this.blueHighlight = new ImageObject("images/blue_highlight2.png");
	this.redHighlight = new ImageObject("images/red_highlight1.png");
	this.characterPane = new ImageObject("images/character_pane.png");
	this.wrapperImage = new ImageObject("images/vba-window.png");
};

//im guessing these functions parse coordinates in the tile system so that we can refer to tiles easily
function hashCoor (coor) {
	return coor.x * 1000 + coor.y;
}
function unhashCoor (hashedCoor) {
	return new Coor(parseInt(hashedCoor / 1000), hashedCoor % 1000);
}

//SUNG TIL HERE WOAH


function Cursor() {
	this.imageObject = new ImageObject ("images/cursor.png");
	this.x = 0;
	this.y = 0;
	
} Cursor.prototype.coor = function () {
	return new Coor(this.x, this.y);
}; Cursor.prototype.draw = function () {
	this.imageObject.drawOnGrid(cursor.coor().screenify());
}
cursor = new Cursor();

function Coor (x, y) {
	this.x = x;
	this.y = y;
} Coor.prototype.equals = function (coor) {
	if (coor instanceof Coor) return this.x == coor.x && this.y == coor.y;
	return false;
}; Coor.prototype.unscreenify = function () {
	return new Coor(this.x + grid.xDisplace, this.y + grid.yDisplace);
}; Coor.prototype.screenify = function () {
	return new Coor(this.x - grid.xDisplace, this.y - grid.yDisplace);
};

function ImageObject (imagePath) {
	this.image = new Image(); // creates a new image BER
	this.image.ready = false; 		// doesn't load the image? BERN
	this.image.onload = function () { // as soon as the page has been loaded, do this function BERN
		this.ready = true;		//??LOR what is going on 
	}
	this.image.src = imagePath; // sets the imagepath to url? BER
} ImageObject.prototype.draw = function (x, y) { //draws starting at the x and y values? BERN
	//TODO: Should not draw if not on canvas or not on VBA screen (if relevant)
	if (this.image.ready) { // if the image is ready draw it centered at the specified x and y coordinates? BER
		context.drawImage(this.image, x, y);
	}
}; ImageObject.prototype.drawScaled = function (x, y, width, height) {
	//TODO: Should not draw if not on canvas or not on VBA screen (if relevant)
	if (this.image.ready) {
		context.drawImage(this.image, x, y, width, height);
	}
}; ImageObject.prototype.drawWithDisplacement = function (x, y, displaceX, displaceY) {
	this.draw(x + displaceX, y + displaceY); // moves the drawing? so the character can move around the screen? BERN
}; ImageObject.prototype.drawOnScreen = function (x, y) {
	this.drawWithDisplacement(x, y, 10, 40);
}; ImageObject.prototype.drawOnGrid = function (coor) { // draws the background?
	this.drawOnScreen((coor.x - grid.xDisplace) * CONSTANTS.tileWidth, (coor.y - grid.yDisplace) * CONSTANTS.tileWidth); //KAR is this making the background?
}; ImageObject.prototype.drawOnScreenScaled = function (x, y, width, height) {
	this.drawScaled(x + 10, y + 40, width, height);
};

function Unit (name, maxHP, attack, move, imagePath, playerID) { // set all the variables for the units and sets their original location to the origin BER
	this.name = name;
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
} Unit.prototype.coor = function () {
	return new Coor(this.x, this.y);
};

function Terrain (traversable) {
	this.traversable = traversable; // sets the terrain's traversible field to the value inputted, traversable or not traversable so you can toggle whether or not a character can go somewhere?
	this.unit = null;            //KAR what is dis
} Terrain.prototype.setUnit = function (unit) {
	this.unit = unit;
};

function generateMovementRange (unit) {
	availableMoves = [];
	availableMoves.push(hashCoor(unit.coor()));
	attackMoveRange = [];
	
	var startIndex = 0;
	var endIndex = availableMoves.length;
	for (i = 0; i < unit.move; i++) {
		for (j = startIndex; j < endIndex; j++) {
			for(k = 0; k < CONSTANTS.hashedDirections.length; k++){
				var hashedTile = CONSTANTS.hashedDirections[k] + availableMoves[j];
				if (availableMoves.indexOf(hashedTile) == -1) { // move not already in list
					if (grid.tileAt(unhashCoor(hashedTile)).traversable == true) {
						// line below says you can't move through other ppl's units
						if (grid.tileAt(unhashCoor(hashedTile)).unit == null || grid.tileAt(unhashCoor(hashedTile)).unit.playerID == game.currentPlayer) {
							availableMoves.push(hashedTile);
						}
					}
				} //?? LOR 8)
			}
		}
		startIndex = endIndex;
		endIndex = availableMoves.length;
	}
	for (i = 0; i < availableMoves.length; i++) {
		for (j = 0; j < CONSTANTS.hashedDirections.length; j++) {
			var hashedTile = CONSTANTS.hashedDirections[j] + availableMoves[i];
			if (availableMoves.indexOf(hashedTile) == -1 && attackMoveRange.indexOf(hashedTile) == -1) {
				attackMoveRange.push(hashedTile);
			}
		}
	}
}

var units = [];
units.push(new Unit("Seth", 10, 3, 4, "images/character.png", 0));
units.push(new Unit("Eirika", 10, 3, 4, "images/female_character_smiling.png", 0));
units.push(new Unit("Cutthroat", 10, 3, 4, "images/monster.png", 1));

function Grid () {
	this.grid = [];
	this.width = 15;  this.height = 10;
	this.xDisplace = 0;  this.yDisplace = 0;
	this.selectedObject = null;
	for (i = 0; i < this.width; i++) {
		this.grid.push([]);
		for (j = 0; j < this.height; j++) {
			if (i == 0 || j == 0 || i == this.width - 1 || j == this.height - 1) {
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
}; Grid.prototype.unitAt = function (coor) {
	return this.grid[coor.x][coor.y].unit;
}; Grid.prototype.tileAt = function (coor) {
	return this.grid[coor.x][coor.y];
}; Grid.prototype.tileOnScreen = function (coor) {
	return this.grid[coor.x + this.xDisplace][coor.y + this.yDisplace];
}; Grid.prototype.unitOnScreen = function (coor) {
	return this.grid[coor.x + this.xDisplace][coor.y + this.yDisplace].unit;
}; Grid.prototype.iterateScreen = function (runnable) {
	for (i = 0; i < CONSTANTS.mapWidth; i++) {
		for (j = 0; j < CONSTANTS.mapHeight; j++) {
			runnable(new Coor(i, j));
		}
	}
};
var grid = new Grid();



function processInputs () {
	if (38 in keysDown) { // Player holding the up button       //Karen what is keysDown
		if (game.phase == "action menu") {
			action_menu_selection--;
			if (action_menu_selection == -1) {
				action_menu_selection = 0;
			}
		} else {
			if(cursor.y != 0) {   //if the cursor isn't in the top row
				cursor.y -= 1;  //when you're going up, you're always decreasing the y value
			}
			if (grid.yDisplace > 0 && cursor.y - grid.yDisplace == 2) {
				grid.yDisplace--;
			}
		}
		delete keysDown[38];
		
    }
    if (40 in keysDown) { // Player holding down
		if (game.phase == "action menu") {
			action_menu_selection++;
			if (action_menu_selection == 2) {
				action_menu_selection = 1;
			}
		} else {
			if(cursor.y != grid.height - 1) {
				cursor.y += 1;
			}
			if (grid.yDisplace < grid.height - CONSTANTS.mapHeight && cursor.y - grid.yDisplace == CONSTANTS.mapHeight - 3) {
				grid.yDisplace++;
			}	
		}
		delete keysDown[40]; //?? LOR IDK WHAT ARE THESE DELETE
    }
    if (37 in keysDown) { // Player holding left
        if (game.phase != "action menu") {
			if(cursor.x != 0) {
				cursor.x -= 1;
			}
			if (grid.xDisplace > 0 && cursor.x - grid.xDisplace == 2) {
				grid.xDisplace--;
			}
		}
		
		delete keysDown[37];
    }
    if (39 in keysDown) { // Player holding right
		if (game.phase != "action menu") {
			if(cursor.x != grid.width - 1) {
				cursor.x += 1;
			}
			if (grid.xDisplace < grid.width - CONSTANTS.mapWidth && cursor.x - grid.xDisplace == CONSTANTS.mapWidth - 3) {
				grid.xDisplace++;
			}
		}
        
		delete keysDown[39];
    }
	if (90 in keysDown) { // pressed "z" which is actually "a" for our emulator
		if (game.phase == "neutral") {//if (grid.selectedObject == null) { // no unit selected yet and "a" just pressed
			if (grid.unitAt(cursor.coor()) != null
					&& grid.unitAt(cursor.coor()).playerID == game.currentPlayer
					&& grid.unitAt(cursor.coor()).active) { // cursor is on an active unit belonging to the current player
				grid.selectedObject = grid.unitAt(cursor.coor());
				generateMovementRange(grid.selectedObject);
				game.phase = "unit selected";
			}
		} else if (game.phase == "unit selected") { //moving
			if (availableMoves.indexOf(hashCoor(cursor.coor())) != -1 && (grid.unitAt(cursor.coor()) == null || grid.unitAt(cursor.coor()) == grid.selectedObject)) {
				grid.placeUnitAt(grid.selectedObject, cursor.x, cursor.y);
				availableMoves = [];
				attackMoveRange = [];
				for (j = 0; j < CONSTANTS.hashedDirections.length; j++) {
					
						attackMoveRange.push(CONSTANTS.hashedDirections[j] + hashCoor(cursor.coor()));
				}
				game.phase = "action menu";
				action_menu_selection = 0;
				//console.log
				// unit just moved
			} else {
				console.log("invalid click");	
			}
		} else if (game.phase == "action menu") { //attacking
			if (action_menu_selection == 0) {
				game.phase = "unit attacking";
			} else {
				grid.selectedObject.active = false;
				// TODO: should make this into a function
				var allInactive = true;
				for (i = 0; i < units.length; i++) {
					if (units[i].playerID == game.currentPlayer && units[i].active) {
						allInactive = false;
						break;
					}
				}
				if (allInactive) {
					game.currentPlayer = (game.currentPlayer + 1) % game.numPlayers;
					for (i = 0; i < units.length; i++) {
						if (units[i].playerID == game.currentPlayer) {
							units[i].active = true;
						}
					}
				}
				
				// 
				grid.selectedObject = null;
				game.phase = "neutral";
				availableMoves = [];
				attackMoveRange = [];
			}
		} else if (game.phase == "unit attacking") { //attacking
			if (attackMoveRange.indexOf(hashCoor(cursor.coor())) != -1 || hashCoor(cursor.coor()) == hashCoor(grid.selectedObject.coor())) { //clicked in range
				if (grid.unitAt(cursor.coor()) != null && grid.unitAt(cursor.coor()).playerID != game.currentPlayer) { //attacking the enemy unit
					grid.unitAt(cursor.coor()).currentHP -= grid.selectedObject.attack; // subtract hp from attacked unit
					if (grid.unitAt(cursor.coor()).currentHP <= 0) {  // if enemy died
						units.splice(units.indexOf(grid.unitAt(cursor.coor())), 1);
						grid.grid[cursor.x][cursor.y].unit = null;
					}
				} else { //didn't attack anyone and just waited (by clicking on ally or ground)
					//do nothing
				}
				grid.selectedObject.active = false;
				// TODO: should make this into a function
				var allInactive = true;
				for (i = 0; i < units.length; i++) {
					if (units[i].playerID == game.currentPlayer && units[i].active) {
						allInactive = false;
						break;
					}
				}
				if (allInactive) {
					game.currentPlayer = (game.currentPlayer + 1) % game.numPlayers;
					for (i = 0; i < units.length; i++) {
						if (units[i].playerID == game.currentPlayer) {
							units[i].active = true;
						}
					}
				}
				grid.selectedObject = null;
				game.phase = "neutral";
				availableMoves = [];
				attackMoveRange = [];
			} else {
				console.log("invalid click");
			}
			// unit needs to perform action or wait
			// check to see if there are any other units of the current player who is active, if none exist, end turn
		}
		delete keysDown[90];
	}
}

function drawAll () {
	IMAGES.wrapperImage.draw(0, 0);
	
	grid.iterateScreen(function (coor) {  
		IMAGES.terrainMapObjects[grid.tileOnScreen(coor).traversable].drawOnGrid(coor);
	});
	
	grid.iterateScreen(function (coor) {  // highlights the available moves in blue after looping through every spot on the visible grid
		if(availableMoves.indexOf(hashCoor(coor.unscreenify())) != -1) {
			IMAGES.blueHighlight.drawOnGrid(coor);
		}
	});
	
	grid.iterateScreen(function (coor) {  // highlights the attack range in red after looping through every spot on the visible grid
		if(attackMoveRange.indexOf(hashCoor(coor.unscreenify())) != -1) {
			IMAGES.redHighlight.drawOnGrid(coor);
		}
	});

	grid.iterateScreen(function (coor) {  // highlights the available moves in blue after looping through every spot on the grid
		if (grid.unitOnScreen(coor)) {
			grid.unitOnScreen(coor).image.drawOnGrid(coor);
		}
	});
	cursor.draw(); // draws the cursor
	if (game.phase == "action menu" /*8 row*/) {
		if (cursor.x - grid.xDisplace < 8) {
			context.font = "bold 18px Verdana";
			context.fillStyle = "#ffffff";
			IMAGES.menu_top.drawOnScreen(360, 0);
			IMAGES.menu_mid.drawOnScreen(360, 58);
			IMAGES.menu_bot.drawOnScreen(360, 1 * 38 + 58);
			IMAGES.menu_cursor.drawOnScreen(340, 25 + 38 * (action_menu_selection));
			context.fillText("Attack", 391, 85);
			context.fillText("Wait", 391, 85 + 38); // if the other character is withing 8 squares of your character give the options to attack or wait?
		} else {
			context.font = "bold 18px Verdana";
			context.fillStyle = "#ffffff";
			IMAGES.menu_top.drawOnScreen(20, 0);
			IMAGES.menu_mid.drawOnScreen(20, 58);
			IMAGES.menu_bot.drawOnScreen(20, 1 * 38 + 58);
			IMAGES.menu_cursor.drawOnScreen(0, 25 + 38 * (1 - 1));
			context.fillText("Attack", 51, 85);
			context.fillText("Wait", 51, 85 + 38);
		}
	} else if (game.phase == "neutral") {	// shows stats during neutral phase?
		if (grid.unitAt(cursor.coor()) != null) {
			if (cursor.x - grid.xDisplace < 8 && cursor.y - grid.yDisplace < 5) {
				IMAGES.characterPane.drawOnScreen(0, 224);
				context.font = "bold 17px Verdana";
				context.fillStyle = "#000000";
				currentHPString = "" + grid.unitAt(cursor.coor()).currentHP;
				context.fillText(currentHPString, 148 - 10 * currentHPString.length, 224 + 103);
				context.fillText("" + grid.unitAt(cursor.coor()).maxHP, 173, 224 + 103);
				context.font = "bold 18px Courier";
				context.fillText(grid.unitAt(cursor.coor()).name, 172 - grid.unitAt(cursor.coor()).name.length * 7.4, 224 + 81);
				
				context.fillStyle = "#f8f7f5";
				context.fillRect(10 + 86, 40 + 70 + 224, 100 * grid.unitAt(cursor.coor()).currentHP / grid.unitAt(cursor.coor()).maxHP, 1);
				context.fillStyle = "#f6f4e9";
				context.fillRect(10 + 86, 40 + 71 + 224, 100 * grid.unitAt(cursor.coor()).currentHP / grid.unitAt(cursor.coor()).maxHP, 1);
				context.fillStyle = "#f2ecc7";
				context.fillRect(10 + 86, 40 + 72 + 224, 100 * grid.unitAt(cursor.coor()).currentHP / grid.unitAt(cursor.coor()).maxHP, 1);
				context.fillStyle = "#f0e9bb";
				context.fillRect(10 + 86, 40 + 73 + 224, 100 * grid.unitAt(cursor.coor()).currentHP / grid.unitAt(cursor.coor()).maxHP, 1);
				grid.unitAt(cursor.coor()).image.drawOnScreenScaled(20, 21 + 224, 56, 56);
			} else {
				IMAGES.characterPane.drawOnScreen(0, 0);
				context.font = "bold 17px Verdana";
				context.fillStyle = "#000000";
				currentHPString = "" + grid.unitAt(cursor.coor()).currentHP;
				context.fillText(currentHPString, 148 - 10 * currentHPString.length, 103);
				context.fillText("" + grid.unitAt(cursor.coor()).maxHP, 173, 103);
				context.font = "bold 18px Courier";
				context.fillText(grid.unitAt(cursor.coor()).name, 172 - grid.unitAt(cursor.coor()).name.length * 7.4, 81);
				
				context.fillStyle = "#f8f7f5";
				context.fillRect(10 + 86, 40 + 70, 100 * grid.unitAt(cursor.coor()).currentHP / grid.unitAt(cursor.coor()).maxHP, 1);
				context.fillStyle = "#f6f4e9";
				context.fillRect(10 + 86, 40 + 71, 100 * grid.unitAt(cursor.coor()).currentHP / grid.unitAt(cursor.coor()).maxHP, 1);
				context.fillStyle = "#f2ecc7";
				context.fillRect(10 + 86, 40 + 72, 100 * grid.unitAt(cursor.coor()).currentHP / grid.unitAt(cursor.coor()).maxHP, 1);
				context.fillStyle = "#f0e9bb";
				context.fillRect(10 + 86, 40 + 73, 100 * grid.unitAt(cursor.coor()).currentHP / grid.unitAt(cursor.coor()).maxHP, 1);
				grid.unitAt(cursor.coor()).image.drawOnScreenScaled(20, 21, 56, 56);
			}
		}
	}
};

var main = function () {
	processInputs();
	drawAll();
    requestAnimationFrame(main);
};
main(); // why 2 mains? bern, PS: I forgot where the first portion of mine ended but I did comment up there

/**
 * Adds Event Listeners for keyboard events (pressing down and pressing up) and
 * these listeners save the events into the dictionary keysDown for use later.
 */
var keysDown = {};
addEventListener("keydown", function (e) { keysDown[e.keyCode] = true }, false);	
addEventListener("keyup", function (e) { delete keysDown[e.keyCode] }, false);

/**
 * Initial setup for the webapp. First creates a canvas, makes it 2D, and
 * sets the dimensions of the canvas. (Everything is drawn on the canvas)
 */
var canvas = document.createElement("canvas");
var context = canvas.getContext("2d");
canvas.width = 500; canvas.height = 369;
document.body.appendChild(canvas);

/**
 * Defines the Game class which contains the overall setup of the game.
 */
function Game (numPlayers) {
	this.numPlayers = numPlayers;  // TODO: move to Level class once defined.
	this.currentPlayer = 0;
	this.turnMode = 0;
	this.phase = "neutral";  // defines which phase user is in
} var game = new Game(2);

/**
 * Constants singleton, collection of a lot of magic numbers
 */
var CONSTANTS = new function () {
	this.hashedDirections = [-1000, -1, 1, 1000];
    // we hash coordinates to deal with primitives instead of objects
	this.tileWidth = 32;  // tiles are 32x32 pixels
	this.mapWidth = 15; this.mapHeight = 10;  // screen is 15x10 tiles
};

/**
 * Collection of imageObjects.
 */
var IMAGES = new function () {
	this.menu_top = new ImageObject ("images/menu-top.png");
	this.menu_mid = new ImageObject ("images/menu-middle.png");
	this.menu_bot = new ImageObject ("images/menu-bottom.png");
	this.menu_cursor = new ImageObject ("images/menu-cursor.png");
	this.terrainMapObjects = {};
	this.terrainMapObjects[0] = new ImageObject("images/Plain.png");
	this.terrainMapObjects[1] = new ImageObject("images/Peak.png");
    this.terrainMapObjects[2] = new ImageObject("images/River.png");
    this.terrainMapObjects[3] = new ImageObject("images/Bridge.png");
    this.terrainMapObjects[4] = new ImageObject("images/Forest.png");
	this.blueHighlight = new ImageObject("images/blue_highlight2.png");
	this.redHighlight = new ImageObject("images/red_highlight1.png");
	this.characterPane = new ImageObject("images/character_pane.png");
    this.terrainPane = new ImageObject("images/terrain_pane.png");
	this.wrapperImage = new ImageObject("images/vba-window.png");
};

/**
 * We hash coordinates to integers so that we can store them in arrays and
 * use array methods without programming our own. As long as x and y are both
 * between 0 and 999 inclusive, the coordinates and the hash are 1-to-1
 */
function hashCoor (coor) {
	return coor.x * 1000 + coor.y;
}
function unhashCoor (hashedCoor) {
	return new Coor(parseInt(hashedCoor / 1000), hashedCoor % 1000);
}

/**
 * Cursor 
 */
function Cursor() {
	this.imageObject = new ImageObject ("images/cursor.png");
	this.x = 0;
	this.y = 0;
	
} Cursor.prototype.coor = function () {
	return new Coor(this.x, this.y);
}; Cursor.prototype.draw = function () {
	this.imageObject.drawOnGrid(cursor.coor().screenify());
}; Cursor.prototype.coorOnScreen = function () {
    //this.imageObject.
}; cursor = new Cursor();

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

attackMoveRange = [];
availableMoves = [];
function Unit (name, maxHP, attack, move, imagePath, playerID) { // set all the variables for the units and sets their original location to the origin BER
	this.name = name;
	this.inventory = [];
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
}; Unit.prototype.canAttack = function () {
    for (var i = 0; i < CONSTANTS.hashedDirections.length; i++) {
        var hashedTile = CONSTANTS.hashedDirections[i] + hashCoor(this.coor());
        if (grid.unitAt(unhashCoor(hashedTile)) && grid.unitAt(unhashCoor(hashedTile)).playerID != this.playerID) {
            return true;
        }
    }
    return false;
}; Unit.prototype.hasItems = function () {
    return this.inventory.length != 0;
}

function Terrain (terrainType) {
	//this.walkable = walkable; // sets the terrain's traversible field to the value inputted, walkable or not walkable so you can toggle whether or not a character can go somewhere?
	this.unit = null;            //KAR what is dis
    this.type = terrainType;  // numeric representation of the type
    switch (this.type) {
        case 0:
            this.name = "Plain";
            this.walkable = true;
            this.flyable = true;
            this.defense = 0;
            this.avoid = 0;
            break;
        case 1:
            this.name = "Peak";
            this.walkable = false;
            this.flyable = true;
            this.defense = 2;
            this.avoid = 40;
            break;
        case 2:
            this.name = "River";
            this.walkable = false;
            this.flyable = true;
            this.defense = 0;
            this.avoid = 0;
            break;
        case 3:
            this.name = "Bridge";
            this.walkable = true;
            this.flyable = true;
            this.defense = 0;
            this.avoid = 0;
            break;
        case 4:
            this.name = "Forest";
            this.walkable = true;
            this.flyable = true;
            this.defense = 1;
            this.avoid = 20;
            break;
        default:
            this.name = "Plain";
            this.walkable = true;
            this.flyable = true;
            this.defense = 0;
            this.avoid = 0;
    }
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
					if (grid.tileAt(unhashCoor(hashedTile)).walkable == true) {
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

function populateActionMenu () {
    var actionMenu = [];
    if (grid.selectedObject.canAttack()) {
        actionMenu.push("Attack");
    }
    if (grid.selectedObject.hasItems()) {
        actionMenu.push("Item");
    }
    actionMenu.push("Wait");
    return actionMenu;
}

var units = [];
units.push(new Unit("Seth", 15, 4, 5, "images/character.png", 0));
units.push(new Unit("Eirika", 10, 3, 4, "images/female_character_smiling.png", 0));
units.push(new Unit("Cutthroat", 14, 5, 4, "images/monster.png", 1));

function Grid () {
	this.grid = [];
	this.width = 15;  this.height = 10;
	this.xDisplace = 0;  this.yDisplace = 0;
	this.selectedObject = null;
	for (i = 0; i < this.width; i++) {
		this.grid.push([]);
		for (j = 0; j < this.height; j++) {
			if (i == 0 || j == 0 || i == this.width - 1 || j == this.height - 1) {
				this.grid[i].push(new Terrain(1));
			} else if ((i * 2 + j * j) % 35 == 4) {
                this.grid[i].push(new Terrain(2));
            } else if ((i * 2 + j * j) % 6 == 1) {
                this.grid[i].push(new Terrain(4));
            } else {
				this.grid[i].push(new Terrain(0));
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
			if (action_menu_selection == availableActions.length) {
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
				// unit just moved
			} else {
				console.log("invalid click");	
			}
		} else if (game.phase == "action menu") { //attacking
			if (availableActions[action_menu_selection] == "Attack") {
				game.phase = "unit attacking";
			} else if (availableActions[action_menu_selection] == "Wait") {
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

function drawActionMenu (listOfOptions) {
    var xStart = 0;
    if (cursor.x - grid.xDisplace < 8) {
        xStart = 360;
    } else {
        xStart = 20;
    }
    context.font = "bold 18px Verdana";
    context.fillStyle = "#ffffff";
    for (i = 0; i < listOfOptions.length; i++) {
        if (i == 0) {
            IMAGES.menu_top.drawOnScreen(xStart, 0);
        } else {
            IMAGES.menu_mid.drawOnScreen(xStart, 20 + i * 38);
        }
        context.fillText(listOfOptions[i], xStart + 31, 85 + i * 38);
    }
    IMAGES.menu_bot.drawOnScreen(xStart, i * 38 + 20);
    IMAGES.menu_cursor.drawOnScreen(xStart - 20, 25 + 38 * (action_menu_selection));
}

function drawAll () {
	IMAGES.wrapperImage.draw(0, 0);
	
	grid.iterateScreen(function (coor) {  
		IMAGES.terrainMapObjects[grid.tileOnScreen(coor).type].drawOnGrid(coor);
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
	if (game.phase == "action menu") {
        availableActions = populateActionMenu();
		drawActionMenu(availableActions);
	} else if (game.phase == "neutral") {	// shows stats during neutral phase?
        if (cursor.x - grid.xDisplace < 8) {
            IMAGES.terrainPane.drawOnScreen(380, 220);
            context.font = "bold 17px Verdana";
            context.fillStyle = "#ffffff";
            context.fillText(grid.tileAt(cursor.coor()).name, 426 - 3.5 * grid.tileAt(cursor.coor()).name.length, 220 + 40 + 17 + 20);
            context.font = "bold 14px Verdana";
            context.fillText("DEF.", 395, 320);
            context.fillText("AVO.", 395, 336);
            var avoid = grid.tileAt(cursor.coor()).avoid;
            context.fillText(grid.tileAt(cursor.coor()).defense, 460, 320);
            context.fillText(avoid, 470 - 10 * avoid.toString().length, 336);
        } else {
            IMAGES.terrainPane.drawOnScreen(380 - 370, 220);
            context.font = "bold 17px Verdana";
            context.fillStyle = "#ffffff";
            context.fillText(grid.tileAt(cursor.coor()).name, 426 - 3.5 * grid.tileAt(cursor.coor()).name.length - 370, 220 + 40 + 17 + 20);
            context.font = "bold 14px Verdana";
            context.fillText("DEF.", 395 - 370, 320);
            context.fillText("AVO.", 395 - 370, 336);
            var avoid = grid.tileAt(cursor.coor()).avoid;
            context.fillText(grid.tileAt(cursor.coor()).defense, 460 - 370, 320);
            context.fillText(avoid, 470 - 370 - 10 * avoid.toString().length, 336);
        }
        
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
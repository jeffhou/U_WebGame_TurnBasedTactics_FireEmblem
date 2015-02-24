/** ITEMS: (i actually dont think inheritance helps whatsoever with this)*/

function Item(name, price, imagePath, itemID){
	this.name = name;
	this.price = price;
	this.image = new ImageObject (imagePath);
	this.itemID = itemID;
	this.usable = false;
}

function QuestItem(){
	QuestItem.prototype = Object.create(Item.prototype);

}

function SellableItem(name, price, imagePath, itemID, uses){
	SellableItem.prototype = Object.create(Item.prototype);
	this.uses = uses
}

function Weapon(name, price, imagePath, itemID, uses, range, weight, might, hit, crit, type, rank, wex){
	this.name = name;
	this.price = price;
	this.image = new ImageObject (imagePath);
	this.itemID = itemID;

	this.uses = uses;

	this.range = range;
	this.weight = weight;
	this.might = might;
	this.hit = hit;
	this.crit = crit;
	this.rank = rank;
	this.wex = wex;
	this.type = type;


	switch (this.type) { //TODO: add weapon triangle and all that
        case 0:
            this.weaponType = "Sword";
            break;
        case 1:
        	this.weaponType = "Lance";
        	break;
        case 2:
        	this.weaponType = "Axe";
        	break;
        case 3:
        	this.weaponType = "Bow";
        	break;
        case 4:
        	this.weaponType = "Dark Tome";
        	break;
        case 5:
        	this.weaponType = "Light Tome";
        	break;
        case 6:
        	this.weaponType = "Anima Tome";
        	break;
        case 7:
        	this.weaponType = "Staff";
        	break;
        default:
            this.weaponType = "Sword";
        	break;
    }
    this.itemType = "Weapon";
} Weapon.prototype.triangleBonus = function (defendingWeapon) {
    switch (this.type) { //TODO: add weapon triangle and all that
        case 0:
            switch (defendingWeapon.type) {
                case 0:
                    return 0;
                case 1:
                    return -1;
                case 2:
                    return 1;
                default:
                    return 0;
            }
        case 1:
        	switch (defendingWeapon.type) {
                case 0:
                    return 1;
                case 1:
                    return 0;
                case 2:
                    return -1;
                default:
                    return 0;
            }
        case 2:
        	switch (defendingWeapon.type) {
                case 0:
                    return -1;
                case 1:
                    return 1;
                case 2:
                    return 0;
                default:
                    return 0;
            }
        default:
            return 0;
    }
}; Weapon.prototype.effectiveBonus = function (targetUnit) {
    return 1;
};



function ConsumableItem(name, price, imagePath, itemID, uses, type, effect, description){
	ConsumableItem.prototype = Object.create(SellableItem.prototype);
	this.name = name;
	this.price = price;
	this.image = new ImageObject(imagePath);
	this.itemID = itemID;
	
	this.usable = true;
	this.uses = uses;

	this.type = type;
	this.effect = effect;
	switch (this.type) {	//probably will have to change this later
		case 0:
			this.effectType = "Heal self";

			break;
        case 1:
            this.effectType = "Heal other";
            
            break;
        default:
            this.effectType = "Sword"

        	break;
    }
    this.itemType = "ConsumableItem";
    this.description = description;
}

/**
 * Adds Event Listeners for keyboard events (pressing down and pressing up) and
 * these listeners save the events into the dictionary keysDown for use later.
 */
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
	this.phase = "neutral";  // defines which phase user is in
} Game.prototype.switchPhase = function (newPhase) {
    this.phase = newPhase;
    menu.reset();
}; var game = new Game(2);

/**
 * Constants singleton, collection of a lot of magic numbers
 */
var CONSTANTS = new function () {

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
    this.inventory_top = new ImageObject ("images/inventory_top.png");
    this.inventory_mid = new ImageObject ("images/inventory_slot.png");
    this.inventory_bot = new ImageObject ("images/inventory_bottom.png");
    this.inventory_highlight = new ImageObject ("images/inventory_highlight.png");
    this.inventory_description = new ImageObject ("images/inventory_description.png");
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
    this.levelBackgrounds = [];
    this.levelBackgrounds.push(new ImageObject("images/level0.png"));
};

/**
 * Class that contains the cursor used in the game. Self-explanatory for the
 * most part.
 */

function Cursor() {
	this.imageObject = new ImageObject ("images/cursor.png");
	this.x = 0;
	this.y = 0;
	
} Cursor.prototype.coor = function () {
	return new Coor(this.x, this.y);
}; Cursor.prototype.draw = function () {
	this.imageObject.drawOnGrid(cursor.coor());
}; Cursor.prototype.coorOnScreen = function () {
    return this.coor().screenify();
}; Cursor.prototype.up = function () {
    if(cursor.y != 0) {   //if the cursor isn't in the top row
        cursor.y -= 1;  //when you're going up, you're always decreasing the y value
    }
}; Cursor.prototype.down = function () {
    if(cursor.y != grid.height - 1) {
        cursor.y += 1;
    }
}; Cursor.prototype.left = function () {
    if(cursor.x != 0) {
        cursor.x -= 1;
    }
}; Cursor.prototype.right = function () {
    if(cursor.x != grid.width - 1) {
        cursor.x += 1;
    }
}; cursor = new Cursor();


/**
 * Class that encapsulates coordinates. Screenify and unscreenify change
 * the displacements from the top left of the screen to the top left of the
 * entire map.
 */
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
 * ImageObject encapsulates the necessary functions to load and print an
 * image. Only after an image loads does it actually display on the screen.
 * If an image does not load, you can assume either image is missing or name
 * is misspelled. (when you set the src for an image, it begins loading)
 */
function ImageObject (imagePath) {
	this.image = new Image();
	this.image.ready = false;
	this.image.onload = function () {
		this.ready = true;
	}
	this.image.src = imagePath;
} ImageObject.prototype.draw = function (x, y) {
    /**
     * Draws self with upper-left corner at x, y.
     * TODO: Should not draw if not on canvas or not on VBA screen (if relevant)
     */
	if (this.image.ready) {
		context.drawImage(this.image, x, y);
	}
}; ImageObject.prototype.drawScaled = function (x, y, width, height) {
	//TODO: Should not draw if not on canvas or not on VBA screen (if relevant)
	if (this.image.ready) {
		context.drawImage(this.image, x, y, width, height);
	}
}; ImageObject.prototype.drawWithDisplacement = function (x, y, displaceX, displaceY) {
    /**
     * Draws with displacement.
     */
	this.draw(x + displaceX, y + displaceY);
}; ImageObject.prototype.drawOnScreen = function (x, y) {
	this.drawWithDisplacement(x, y, 10, 40);
}; ImageObject.prototype.drawOnGrid = function (coor) { // draws the background?
	this.drawOnScreen((coor.x - grid.xDisplace) * CONSTANTS.tileWidth, (coor.y - grid.yDisplace) * CONSTANTS.tileWidth); //KAR is this making the background?
}; ImageObject.prototype.drawOnScreenScaled = function (x, y, width, height) {
	this.drawScaled(x + 10, y + 40, width, height);
};

attackMoveRange = [];
availableMoves = [];

/**
 * Class for each controllable unit. Initializes at (0, 0), must be changed.
 */
function Unit (name, maxHP, move, imagePath, playerID, strength, skill, speed, luck, defense, resistance, constitution, aid, traveler, affinity, condition, level, experience, numWins, numLosses, numBattles) {
	this.name = name;
	this.inventory = [];
	this.maxHP = maxHP;
	this.currentHP = maxHP;
	this.move = move;
	this.image = new ImageObject (imagePath);
	this.active = true; // turns to false after it moves.
	this.playerID = playerID;
	this.x = 0;
	this.y = 0;
	this.equipped = null;
	this.strength = strength;
	this.skill = skill;
	this.speed = speed;
	this.luck = luck;
	this.defense = defense;
	this.resistance = resistance;
	this.constitution = constitution;
	this.aid = aid;
	this.traveler = traveler;
	this.affinity =affinity;
	this.condition = condition;
    this.level = level;
    this.experience = experience;
    this.numWins = numWins;
    this.numLosses = numLosses;
    this.numBattles = numBattles

} Unit.prototype.coor = function () {
	return new Coor(this.x, this.y);
}; Unit.prototype.canAttack = function () {
    if (this.equipped == null){
        return false;
    }
    for (var i = 0; i < CONSTANTS.hashedDirections.length; i++) {
        var hashedTile = CONSTANTS.hashedDirections[i] + hashCoor(this.coor());
        if (grid.unitAt(unhashCoor(hashedTile)) && grid.unitAt(unhashCoor(hashedTile)).playerID != this.playerID) {
            return true;
        }
    }
    return false;
}; Unit.prototype.canTrade = function () {
    for (var i = 0; i < CONSTANTS.hashedDirections.length; i++) {
        var hashedTile = CONSTANTS.hashedDirections[i] + hashCoor(this.coor());
        if (grid.unitAt(unhashCoor(hashedTile)) && grid.unitAt(unhashCoor(hashedTile)).playerID == this.playerID) {
            if (grid.selectedUnit.hasItems() && grid.unitAt(unhashCoor(hashedTile)).hasItems()) {
				return true;
			}
        }
    }
    return false;
}; Unit.prototype.hasItems = function () {
    return this.inventory.length != 0;
}; Unit.prototype.giveItem = function (item) {
	if (this.inventory.length < 6){
		this.inventory.push(item);
	}
	if (this.equipped == null){	//TODO: check if equippable
		this.equipItem(this.inventory.length - 1);
	}
}; Unit.prototype.removeItem = function (index, item) { //either needs to be renamed or changed (currently replaces item)
	this.inventory.splice(index, 1, item);
	if (this.equipped == index) {
		this.equipped = null;
	} 
}; Unit.prototype.updateInventory = function () {
	temp = []
	for (i = 0; i < this.inventory.length; i++) {
		if (this.inventory[i].uses > 0) {
			temp.push(this.inventory[i]);
		} else if (i == this.equipped) {
			//this.attack -= this.inventory[this.equipped].might; //probably badly coded but will be deprecated soon anyway since we're revamping how stats figure into attacks
			this.equipped = null;
		}
	}
	this.inventory = temp;
	if (this.equipped == null) { 
		for (i = 0; i < this.inventory.length; i++) {
			if (this.inventory[i].itemID == 0) {
				this.equipItem(i);
				break;
			}
		}
	}
}; Unit.prototype.equipItem = function (index) {
	//if (this.equipped != null) {
		//this.attack -= this.inventory[this.equipped].might;
	//}
	this.equipped = index;
	//this.attack += this.inventory[this.equipped].might;
}; Unit.prototype.weapon = function () {
    if (this.equipped == null) {
        return null;
    } else {
        return this.inventory[this.equipped];
    }
}; Unit.prototype.heal = function (amount) {
    if (this.currentHP >= this.maxHP) {
        return 0;
    }
    
    this.currentHP += amount;
	if (this.currentHP > this.maxHP) {
		this.currentHP = this.maxHP;
	}
	return 1;
}; Unit.prototype.damage = function (amount) {
    this.currentHP -= amount;
    if (this.currentHP <= 0) {
        this.currentHP = 0;
        return 0;
    } else {
        return 1;
    }
}; Unit.prototype.physicalAttack = function (targetUnit) {
    console.log(this.strength + ((this.weapon().might + this.weapon().triangleBonus(targetUnit.weapon())) * this.weapon().effectiveBonus(targetUnit)));
    return this.strength + ((this.weapon().might + this.weapon().triangleBonus(targetUnit.weapon())) * this.weapon().effectiveBonus(targetUnit));
}; Unit.prototype.physicalDefense = function () {
    console.log(this.defense + grid.tileAt(this.coor()).defense);
    return this.defense + grid.tileAt(this.coor()).defense;
}; Unit.prototype.criticalBonus = function (targetUnit) {
    var criticalRate = this.weapon().crit + this.skill / 2; // = Weapon Critical + (Skill / 2) + Support bonus + Class Critical bonus + S Rank bonus 
    var criticalEvade = targetUnit.luck;
    if (Math.random() * 100 <= criticalRate - criticalEvade) {
        console.log("Critical Attack!");
        return 3;
    } else {
        console.log("Normal Attack!");
        return 1;
    }
};

function Tile (terrainType) {
	//this.walkable = walkable; // sets the terrain's traversible field to the value inputted, walkable or not walkable so you can toggle whether or not a character can go somewhere?
	this.unit = null;  //each tile has a unit
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
} Tile.prototype.setUnit = function (unit) {
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
                    if (unhashCoor(hashedTile).x < 0 || unhashCoor(hashedTile).y < 0 || unhashCoor(hashedTile).x >= grid.width || unhashCoor(hashedTile).y >= grid.height) {
                        
                    } else if (grid.tileAt(unhashCoor(hashedTile)).walkable == true) {
						// line below says you can't move through other ppl's units
						if (grid.tileAt(unhashCoor(hashedTile)).unit == null || grid.tileAt(unhashCoor(hashedTile)).unit.playerID == game.currentPlayer) {
							availableMoves.push(hashedTile);
						}
					}
				}
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
    menu = new Menu();
    if (grid.selectedUnit.canAttack()) {
        menu.addOption("Attack", function () {
            game.switchPhase("unit attacking");
        });
    }
    if (grid.selectedUnit.hasItems()) {
        menu.addOption("Item", function () {
            game.switchPhase("inventory menu");
            populateInventoryMenu(grid.selectedUnit);
        });
    }
    if (grid.selectedUnit.canTrade()) {
        menu.addOption("Trade", function () {
            game.switchPhase("unit trading");
            for (j = 0; j < CONSTANTS.hashedDirections.length; j++) {
                attackMoveRange.push(CONSTANTS.hashedDirections[j] + hashCoor(grid.selectedUnit.coor()));
            }
        });
    }
    menu.addOption("Wait", function () {
        grid.selectedUnit.active = false;
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
        grid.selectedUnit = null;
        game.switchPhase("neutral");
        availableMoves = [];
        attackMoveRange = [];
    });
    //return actionMenu;
}

function populateInventoryMenu (unit) {
    menu = new Menu();
	for (i = 0; i < unit.inventory.length; i++) {
		if (i == unit.equipped) {
			menu.addOption(unit.inventory[i].name.concat(" (E)"), function () {
                selectedItem = grid.selectedUnit.inventory[menu.index]
				game.switchPhase("item usage menu");
                populateItemUsageMenu(selectedItem);
            });
		} else {
            menu.addOption(unit.inventory[i].name, function () {
                selectedItem = grid.selectedUnit.inventory[menu.index]
				game.switchPhase("item usage menu");
                populateItemUsageMenu(selectedItem);
            });
		}
	}
	menu.addOption("Back", function () {
        game.switchPhase("action menu");
        populateActionMenu();
    });
}

function populateItemUsageMenu (item) {
	menu = new Menu();
	if (item.itemID == 0) {
		menu.addOption("Equip", function () {
			grid.selectedUnit.equipItem(grid.selectedUnit.inventory.indexOf(selectedItem));
			game.switchPhase("inventory menu");
			populateInventoryMenu(grid.selectedUnit);
		})
	} else if (item.itemID == 1){
		if (item.effectType == "Heal self") {
			menu.addOption("Heal", function () {
				healingFactor = selectedItem.effect;
				selectedItem.uses -= grid.selectedUnit.heal(healingFactor);
				
				grid.selectedUnit.updateInventory();

				grid.selectedUnit.active = false;
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
		        grid.selectedUnit = null;
		        game.switchPhase("neutral");
		        availableMoves = [];
		        attackMoveRange = [];
			})
		}
	}
	//MORE TO COME
    menu.addOption("Back", function () {
        game.switchPhase("inventory menu");
        populateInventoryMenu(grid.selectedUnit);
    });
}

function populateTradeMenu1 (unit) { //TODO: Recode to actually be like the game
	menu = new Menu();
	menu.addOption(unit.name, function () {});
	for (i = 0; i < unit.inventory.length; i++) {
		menu.addOption(unit.inventory[i].name, function () {
            selectedItemIndex = menu.index - 1;
            game.switchPhase("trade menu 2");
            populateTradeMenu2(grid.unitAt(cursor.coor()));
        });
	}
    menu.addOption("Back", function () {
        game.switchPhase("action menu");
        populateActionMenu(); 
    });
}

function populateTradeMenu2 (unit) { //TODO: Recode to actually be like the game
     //currently badly implemented (this and the previous few) - Sung
     //even after my my refactoring, Sung's above comment applies - Jeff
	menu = new Menu();
	menu.addOption(unit.name, function () {});
	for (i = 0; i < unit.inventory.length; i++) {
		menu.addOption(unit.inventory[i].name, function () {
            selectedItem1 = grid.selectedUnit.inventory[selectedItemIndex];
            selectedItem2 = grid.unitAt(cursor.coor()).inventory[menu.index - 1];

            grid.selectedUnit.removeItem(selectedItemIndex, selectedItem2);
            grid.unitAt(cursor.coor()).removeItem(menu.index - 1, selectedItem1);
            
            grid.selectedUnit.updateInventory();
            grid.unitAt(cursor.coor()).updateInventory();
            game.switchPhase("action menu");
            populateActionMenu();
        });
	}
    menu.addOption("Back", function () {
        game.switchPhase("trade menu 1");
        populateTradeMenu1(grid.selectedUnit);
    });
}

//Weapon(name, price, imagePath, itemID, uses, range, weight, might, hit, crit, type, rank, wex)

var units = [];
units.push(new Unit("Seth", 30, 8, "images/seth.png", 0, 14, 13, 12, 13, 11, 8, 11, 14, null, "anima", null, 1, 0, 0, 0, 0));
//Seth's items
units[0].giveItem(new Weapon("Silver Lance", 1200, "placeholder", 0, 20, 1, 10, 14, 0.75, 0, 1, 'A', 1)); //give seth silver lance, eirika rapier vulneraries, goblin bronze axe
units[0].giveItem(new Weapon("Steel Sword", 600, "placeholder", 0, 30, 1, 10, 8, 0.75, 0, 0, 'D', 1));
units[0].giveItem(new ConsumableItem("Vulnerary", 300, "placeholder", 1, 3, 0, 10, "Restores some HP."));

units.push(new Unit("Eirika", 16, 5, "images/eirika.png", 0, 4, 8, 9, 5, 3, 1, 5, 4, null, "light", null, 1, 0, 0, 0, 0));
//Eirika's items
units[1].giveItem(new Weapon("Rapier", 0, "placeholder", 0, 40, 1, 5, 7, 0.95, 10, 0, 'Prf', 2)); //TODO: add rapier's special shit
units[1].giveItem(new ConsumableItem("Vulnerary", 300, "placeholder", 1, 3, 0, 10, "Restores some HP."));

units.push(new Unit("Cutthroat", 22, 5, "images/axe_soldier.png", 1, 5, 1, 1, 0, 5, 0, 11, 10, null, null, null, 1, 0, 0, 0, 0));
units.push(new Unit("Cutthroat", 21, 5, "images/axe_soldier.png", 1, 5, 2, 4, 0, 2, 0, 11, 10, null, null, null, 2, 0, 0, 0, 0));
units.push(new Unit("O'Neill", 24, 5, "images/axe_soldier.png", 1, 6, 4, 8, 0, 2, 0, 11, 10, null, "fire", null, 1, 0, 0, 0, 0));
//goblin's items
units[2].giveItem(new Weapon("Iron Axe", 270, "placeholder", 0, 45, 1, 10, 8, 0.75, 0, 2, "E", 1));
units[3].giveItem(new Weapon("Iron Axe", 270, "placeholder", 0, 45, 1, 10, 8, 0.75, 0, 2, "E", 1));
units[4].giveItem(new Weapon("Iron Axe", 270, "placeholder", 0, 45, 1, 10, 8, 0.75, 0, 2, "E", 1));

function Grid () {
    this.grid = [];
	this.width = 15;  this.height = 10;
	this.xDisplace = 0;  this.yDisplace = 0;
	this.selectedUnit = null;
	data = [[0,0,4,1,0,2,2,2,1,1,1,1,1,1,1],
        [2,3,2,2,2,2,1,1,1,1,1,1,1,1,1],
        [2,3,2,0,1,1,1,1,1,1,1,1,1,1,1],
        [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],
        [1,1,0,0,0,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,0,0,0,0,0,0,1,1,1,1,0],
        [1,1,1,1,1,1,1,1,0,4,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,0,4,0,0,4,0],
        [1,1,1,1,1,1,1,1,1,1,0,0,0,0,4],
        [1,1,1,1,1,1,1,1,1,1,1,0,0,0,0]];
    this.grid = [];
    for (i = 0; i < this.width; i++) {
        this.grid.push([]);
        for (j = 0; j < this.height; j++) {
            this.grid[i].push(new Tile(data[j][i]));
        }
    }
    this.placeUnitAt(units[0], 4, 4);
    this.placeUnitAt(units[1], 4, 5);
    this.placeUnitAt(units[2], 8, 6);
	this.placeUnitAt(units[3], 9, 6);
    this.placeUnitAt(units[4], 10, 8);
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
}; Grid.prototype.adjust = function () {
    if (grid.yDisplace > 0 && cursor.y - grid.yDisplace == 2) {
        grid.yDisplace--;
    }
    if (grid.yDisplace < grid.height - CONSTANTS.mapHeight && cursor.y - grid.yDisplace == CONSTANTS.mapHeight - 3) {
        grid.yDisplace++;
    }
    if (grid.xDisplace > 0 && cursor.x - grid.xDisplace == 2) {
        grid.xDisplace--;
    }
    if (grid.xDisplace < grid.width - CONSTANTS.mapWidth && cursor.x - grid.xDisplace == CONSTANTS.mapWidth - 3) {
        grid.xDisplace++;
    }
};
var grid = new Grid();

function Menu () {
    this.index = 0;
    this.options = [];
    this.actions = {};
} Menu.prototype.up = function () {
    this.index++;
    if (this.index >= this.options.length) {
        this.index = this.options.length - 1;
    }
}; Menu.prototype.down = function () {
    this.index--;
    if (this.index < 0) {
        this.index = 0;
    }
}; Menu.prototype.reset = function () {
    this.index = 0;
}; Menu.prototype.addOption = function (text, action) {
    this.options.push(text);
    this.actions[text] = action;
}; Menu.prototype.go = function () {
    this.actions[this.options[this.index]]();
}; menu = new Menu();

function processInputs () {
    if (game.phase.indexOf("menu") > -1) {  // in a menu
        if (38 in keysDown) { // Player holding the up button
            menu.down();
        }
        if (40 in keysDown) { // Player holding down
            menu.up();
        }
        if (90 in keysDown) {
            menu.go();
        }
    } else {  // not a menu
        if (38 in keysDown) { // Player holding the up button
            cursor.up();
			grid.adjust();
        }
        if (40 in keysDown) { // Player holding down
            cursor.down();
            grid.adjust();
        }
        if (37 in keysDown) { // Player holding left
            cursor.left();
            grid.adjust();
        }
        if (39 in keysDown) { // Player holding right
			cursor.right();
			grid.adjust();
        }
        if (90 in keysDown) { // pressed "z" which is actually "a" for our emulator
            if (game.phase == "neutral") {//if (grid.selectedUnit == null) { // no unit selected yet and "a" just pressed
                if (grid.unitAt(cursor.coor()) != null
                        && grid.unitAt(cursor.coor()).playerID == game.currentPlayer
                        && grid.unitAt(cursor.coor()).active) { // cursor is on an active unit belonging to the current player
                    grid.selectedUnit = grid.unitAt(cursor.coor());
                    generateMovementRange(grid.selectedUnit);
                    game.switchPhase("unit selected");
                }
            } else if (game.phase == "unit selected") { //moving
                if (availableMoves.indexOf(hashCoor(cursor.coor())) != -1 && (grid.unitAt(cursor.coor()) == null || grid.unitAt(cursor.coor()) == grid.selectedUnit)) {
                    grid.placeUnitAt(grid.selectedUnit, cursor.x, cursor.y);
                    availableMoves = [];
                    attackMoveRange = [];
                    if (grid.selectedUnit.canAttack()) {
                        for (j = 0; j < CONSTANTS.hashedDirections.length; j++) {
                            attackMoveRange.push(CONSTANTS.hashedDirections[j] + hashCoor(cursor.coor()));
                        }
                    }
                    game.switchPhase("action menu");
                    populateActionMenu();
                    menu.reset();
                    // unit just moved
                } else {
                    console.log("invalid click");	
                }
            } else if (game.phase == "unit attacking") { //attacking
                if (attackMoveRange.indexOf(hashCoor(cursor.coor())) != -1 || hashCoor(cursor.coor()) == hashCoor(grid.selectedUnit.coor())) { //clicked in range
                    var defender = grid.unitAt(cursor.coor());
                    var attacker = grid.selectedUnit;
                    if (defender != null && defender.playerID != game.currentPlayer) { //attacking the enemy unit
                        
                        var battleResult = defender.damage((attacker.physicalAttack(defender) - defender.physicalDefense()) * attacker.criticalBonus(defender));
                        
                        //grid.unitAt(cursor.coor()).currentHP -= grid.selectedUnit.attack; // subtract hp from attacked unit
                        
                        attacker.inventory[attacker.equipped].uses -= 1;
                        attacker.updateInventory();
                        
                        //TODO implement wex (weapon experience)
                        
                        if (battleResult == 0) {  // if enemy died
                            units.splice(units.indexOf(grid.unitAt(cursor.coor())), 1);
                            grid.grid[defender.x][defender.y].unit = null;
                        } else {
                            battleResult = attacker.damage((defender.physicalAttack(attacker) - attacker.physicalDefense()) * defender.criticalBonus(attacker));
                            if (battleResult == 0) {
                                units.splice(units.indexOf(attacker), 1);
                                grid.grid[attacker.x][attacker.y].unit = null;
                            }
                        }
                        
                    } else { //didn't attack anyone and just waited (by clicking on ally or ground)
                        //do nothing
                    }
                    attacker.active = false;
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
                    grid.selectedUnit = null;
                    game.switchPhase("neutral");
                    availableMoves = [];
                    attackMoveRange = [];
                } else {
                    console.log("invalid click");
                }
                // unit needs to perform action or wait
                // check to see if there are any other units of the current player who is active, if none exist, end turn
            } else if (game.phase == "unit trading") { //trading, currently can trade with yourself and trade multiple times in one turn
                if (attackMoveRange.indexOf(hashCoor(cursor.coor())) != -1 || hashCoor(cursor.coor()) == hashCoor(grid.selectedUnit.coor())) { //clicked in range
                    if (grid.unitAt(cursor.coor()) != null && grid.unitAt(cursor.coor()).playerID == game.currentPlayer) { 
                        game.switchPhase("trade menu 1");
                        attackMoveRange = [];
                        populateTradeMenu1(grid.selectedUnit);
                    } else { //didn't attack anyone and just waited (by clicking on ally or ground)
                        game.switchPhase("action menu");
                        populateActionMenu();
                    }
                } else {
                    console.log("invalid click");
                }
            }
        }
    }
    
	
    keysDown = {};
}

function drawActionMenu (listOfOptions) {
    var xStart = 0; var yStart = 20;
    if (cursor.coorOnScreen().x < 8) {
        xStart = 340;
    } else {
        xStart = 20;
    }
    context.font = "bold 18px Verdana";
    context.fillStyle = "#ffffff";
    for (i = 0; i < listOfOptions.length; i++) {
        if (i == 0) {
            IMAGES.menu_top.drawOnScreen(xStart, yStart);
        } else {
            IMAGES.menu_mid.drawOnScreen(xStart, yStart + 20 + i * 38);
        }
        context.fillText(listOfOptions[i], xStart + 31, yStart + 85 + i * 38);
    }
    IMAGES.menu_bot.drawOnScreen(xStart, yStart + i * 38 + 20);
    IMAGES.menu_cursor.drawOnScreen(xStart - 20, yStart + 25 + 38 * (menu.index));
}

function drawInventoryPanel (inventory) {
    var xStart = 22; var yStart = 16;
    
    context.font = "18px Arial";
    context.fillStyle = "#ffffff";
    for (i = 0; i < inventory.length + 1; i++) {
        if (i != inventory.length) {
            IMAGES.inventory_mid.drawOnScreen(xStart, 15 + yStart + i * 30);
        } else {
            IMAGES.inventory_mid.drawOnScreen(xStart, 15 + yStart + i * 30);
        }
    }
    IMAGES.inventory_highlight.drawOnScreen(xStart + 15, yStart + 30 + 30 * (menu.index));
    for (i = 0; i < inventory.length + 1; i++) {
        if (i != inventory.length) {
            if (i == grid.selectedUnit.equipped) {
                context.fillText(inventory[i].name + " (E)", xStart + 50, yStart + 77 + i * 30);
            } else {
                context.fillText(inventory[i].name, xStart + 50, yStart + 77 + i * 30);
            }
            
        } else {
            context.fillText("BACK", xStart + 50, yStart + 77 + i * 30);
        }
    }
    IMAGES.inventory_top.drawOnScreen(xStart, yStart);
    IMAGES.inventory_bot.drawOnScreen(xStart, yStart + i * 30 + 15);
    IMAGES.menu_cursor.drawOnScreen(xStart - 20, yStart + 16 + 30 * (menu.index));
    
    
    grid.selectedUnit.image.drawOnScreenScaled(270, 60, 130, 130);
    IMAGES.inventory_description.drawOnScreen(230, 165);
    context.font = "16px Arial";
    if (menu.index != inventory.length) {
        if (inventory[menu.index].itemType == "Weapon") {
            context.fillText("Type: " + inventory[menu.index].weaponType, 295, 240);
            context.fillText("Atk", 265, 270);
            context.fillText("???", 265 + 45, 270);
            context.fillText("Hit", 265, 300);
            context.fillText("???", 265 + 45, 300);
            context.fillText("Crit", 355, 270);
            context.fillText("???", 355 + 45, 270);
            context.fillText("Avoid", 355, 300);
            context.fillText("???", 355 + 45, 300);
            // find formulas to determine these pl0x.
        } else {
            context.fillText(inventory[menu.index].description, 255, 240);
        }
    } else {
        context.fillText("Return to Action Menu", 255, 240);
    }
}

function drawAll () {
	IMAGES.wrapperImage.draw(0, 0);
	/*
	grid.iterateScreen(function (coor) {
		IMAGES.terrainMapObjects[grid.tileOnScreen(coor).type].drawOnGrid(coor.unscreenify());
	});
	*/
    IMAGES.levelBackgrounds[0].drawOnScreen(0, 0);
    
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
			grid.unitOnScreen(coor).image.drawOnGrid(coor.unscreenify());
		}
	});
	cursor.draw(); // draws the cursor
    if (game.phase == "inventory menu") {
        drawInventoryPanel(grid.selectedUnit.inventory);
    } else if (game.phase.indexOf("menu") > -1) {
		drawActionMenu(menu.options);
	} else if (game.phase == "neutral") {	// shows stats during neutral phase?
        if (cursor.coorOnScreen().x < 8) {
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
			if (cursor.coorOnScreen().x < 8 && cursor.coorOnScreen().y < 5) {
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
}; main();

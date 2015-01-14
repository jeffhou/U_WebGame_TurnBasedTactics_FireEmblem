// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 512;
document.body.appendChild(canvas);

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

// Game objects
var hero = {
    //speed: 256 // movement in pixels per second
};
var girl = {};
var girlsCaught = 0;

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
    hero.x = 0;
    hero.y = 0;

    // Throw the girl somewhere on the screen randomly
    girl.x = 1 + Math.floor(Math.random() * 15);
    girl.y = 1 + Math.floor(Math.random() * 15);
};

// Update game objects
var update = function (modifier) {
    if (38 in keysDown) { // Player holding up
        hero.y -= 1;
		hero.y = (hero.y + 16) % 16;
		delete keysDown[38];
    }
    if (40 in keysDown) { // Player holding down
        hero.y += 1;
		hero.y = hero.y % 16;
		delete keysDown[40];
    }
    if (37 in keysDown) { // Player holding left
        hero.x -= 1;
		hero.x = (hero.x + 16) % 16;
		delete keysDown[37];
    }
    if (39 in keysDown) { // Player holding right
        hero.x += 1;
		hero.x = hero.x % 16;
		delete keysDown[39];
    }

    // Are they touching?
    if (hero.x == girl.x && girl.y == hero.y) {
        ++girlsCaught;
        reset();
    }
};

// Draw everything
var render = function () {
    if (terrainReady) {
        for(i = 0; i < 16; i++){
            for(j = 0; j < 16; j++){
                ctx.drawImage(terrainImage, i*32, j*32);
            }
        }
    }

    if (heroReady) {
        ctx.drawImage(heroImage, hero.x * 32, hero.y * 32);
    }

    if (girlReady) {
        ctx.drawImage(girlImage, girl.x * 32, girl.y * 32);
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

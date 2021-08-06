// Configure Phaser. 
// Sets width, height, canvas type & physics engine
// 'parent' is the id of the div on the page that will hold the canvas
// 'mode: Phaser.Scale.FIT' ensures the canvas will scale to fit the div,
// while maintaining 4:3 aspect ratio
var config = {
    type: Phaser.CANVAS,
    parent: 'game-area',
    width: 800,
    height: 600,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 0
            }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    backgroundColor: 0x333333
};

// Instantiate Phaser
var game = new Phaser.Game(config);

// Declare game variables
var ball;
var paddle;
var bricks;
var numBricks = 0;

function preload(){
    this.load.image('ball', 'assets/img/ball.png');
    this.load.image('paddle', 'assets/img/paddle.png');
    this.load.image('brick-first-aid', 'assets/img/brick-first-aid.png');
}

function create(){
    // Set 3 of 4 boundaries to detect collisions
    this.physics.world.setBoundsCollision(true, true, true, false);

    // Create the ball object. Applies physics, set original co-ordinates, and asigns art based on keyword as set in preloader 
    ball = this.physics.add.sprite(400, 575, 'ball');
    // Tells ball to collide with world boundaries
    ball.setCollideWorldBounds(true);
    // Allows ball to create an event when a world boundary collision occurs
    ball.body.onWorldBounds = true;
    // Lets ball bounce
    ball.setBounce(1, 1);
    // Launch the ball on mouse click
    this.input.on('pointerdown', releaseBall);

    // Create the paddle object. Applies physics, set original co-ordinates, and asigns art based on keyword as set in preloader
    paddle = this.physics.add.sprite(400, 595, 'paddle');
    // Prevents paddle from being pushed away when collision with ball occurs
    paddle.setImmovable(true)

    // Allows ball and paddle to collide
    this.physics.add.collider(ball, paddle);
    // Listens for world boundary event, and triggers onWorldBounds
    this.physics.world.on('worldbounds', onWorldBounds);

    // Create bricks
    bricks = createBricks();
    //Add brick and ball collision
    this.physics.add.collider(ball, bricks, brickDestroyed);
}

function update(){
    // Moves the paddle along the x axis based on player input (mouse or touch)
    // Defaults to 400 (half of width declared in config) to center the paddle on load
    paddle.x = this.input.x || 400;

}

// Fires whenever a world boundary event is captured by the listener above
// Checks if player has lost, i.e. if the ball's position on y axis is below the paddle's
function onWorldBounds() {
    if (ball.y > (paddle.y)) {
        //alert('Game Over!');
        location.reload();
    }
}

//Brick config
const brickConfig = {
    width: 64,
    height: 64
}

//Brick layout config
const brickLayout = {
    count: {
        row: 2,
        col: 11
    },
    offset: {
        top: 64,
        left: 64
    },
    padding: 0
};

//Create bricks on screen from config
function createBricks() {
    const bricks = game.scene.scenes[0].physics.add.staticGroup();
    //Loop through the number of columns and rows in the layout definition
    for (let column = 0; column < brickLayout.count.col; column++) {
        for (let row = 0; row < brickLayout.count.row; row++) {
            let brickX = (column * (brickConfig.width + brickLayout.padding)) + brickLayout.offset.left;
            let brickY = (row * (brickConfig.height + brickLayout.padding)) + brickLayout.offset.top;
            bricks.create(brickX, brickY, 'brick-first-aid');
            numBricks++;
        }
    }

    return bricks;
}

//Define what happens when a ball gets hit
function brickDestroyed(ball, brick) {
    brick.disableBody(true, true);
    numBricks--;
    console.log(numBricks);
}

//Set the velocity of the ball to fire up from the paddle
function releaseBall() {
    ball.setVelocity(200, -200);
}
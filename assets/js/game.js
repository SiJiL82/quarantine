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
var ballFired = false;
var ballLaunchSpeed = 400;
var score = 0;
var scoreText;
var hiScore;
var hiScoreText;

function preload(){
    onFirstLoad();
    hiScore = localStorage.getItem('hiscore');
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
    this.physics.add.collider(ball, paddle, ballPaddleCollision);
    // Listens for world boundary event, and triggers onWorldBounds
    this.physics.world.on('worldbounds', onWorldBounds);

    // Create bricks
    bricks = createBricks();
    //Add brick and ball collision
    this.physics.add.collider(ball, bricks, ballBrickCollsion);

    // Display the scores
    scoreText = this.add.text(8, 4, 'SCORE: 0', { fontFamily: '"Press Start 2P"', fontSize: '24px', fill: '#fafafa' });
    hiScoreText = this.add.text(515, 4, 'HISCORE: ' + hiScore, { fontFamily: '"Press Start 2P"', fontSize: '24px', fill: '#fafafa' });
}

function update(){
    // Moves the paddle along the x axis based on player input (mouse or touch)
    // Defaults to 400 (half of width declared in config) to center the paddle on load
    paddle.x = this.input.x || 400;
    //Stick the ball to the paddle when it's not fired
    if(!ballFired) {
        ball.x = paddle.x;
    }
    //Check if player has won the round
    checkRemainingBricks();
}

// Fires whenever a world boundary event is captured by the listener above
// Checks if player has lost, i.e. if the ball's position on y axis is below the paddle's
function onWorldBounds() {
    //Fell out the bottom of the world
    if (ball.y > (paddle.y)) {
        checkHiScore();
        alert('Game Over!');
        location.reload();
    }
    //Collided with a wall - add velocity on collision to stop the ball getting stuck in a continuous horizontal bounce
    else {
        let ballXVelocity = ball.body.velocity.x;
        let ballYVelocity = ball.body.velocity.y;
        //If ball is moving down or perfectly horizontally when it hits a wall, add a little bit of downward velocity
        if(ball.body.velocity.y >= 0) {
            ballYVelocity += 0.1;
        }
        //If ball is moving upwards when it hits the wall, add a little bit more upwards velocity
        else {
            ballYVelocity -= 0.1;
        }
        ball.setVelocity(ballXVelocity, ballYVelocity);
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
        col: 12
    },
    offset: {
        top: 64,
        left: 48
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

//Define what happens when a brick gets hit
function ballBrickCollsion(ball, brick) {
    brick.disableBody(true, true);
    numBricks--;

    // Increment score variable by 10, and write to screen
    score += 10;
    scoreText.setText('Score: ' + score);
}

//Set the velocity of the ball to fire up from the paddle
function releaseBall() {
    if(!ballFired) {
        ball.setVelocity(getRandomBetweenRange(-200, 200), -ballLaunchSpeed);
        //Set ball as fired so it stops sticking to the paddle
        ballFired = true;
    }
}

//Generate a random number between the passed in values
function getRandomBetweenRange(min, max) {
    if(max < min) {
        console.log("Incorrect values passed to getRandomBetweenRange. Max should be > min");
        return 0;
    }
    return Math.random() * (max - min) + min;
}

//Define what happens when the ball collides with the paddle
function ballPaddleCollision(ball, paddle) {
    //Get the offset between the paddle and ball
    let offset = ball.x - paddle.x;
    //Set a new velocity for the ball, adding velocity on X so it bounces in the direction relative to where it hit the paddle.
    //Hitting the paddle to the left of the center applies a -X offset for example.
    //Stops the ball getting stuck bouncing straight up and down endlessly
    let ballXVelocity = ball.body.velocity.x += offset;
    let ballYVelocity = ball.body.velocity.y;
    ball.setVelocity(ballXVelocity, ballYVelocity);
}

// Check if users final score is higher than the hi-score in localStorage
// if so, overwrite localStorage
function checkHiScore() {
    let finalScore = score;
    let hiScoreStorage = localStorage.getItem('hiscore');
    // Convert localStorage from string to int
    let hiScoreInt = parseInt(hiScoreStorage);
    if (finalScore > hiScoreInt) {
        // Convert final score to string and add to localStorage
        localStorage.setItem('hiscore', finalScore.toString());
    }
}

// Checks if localStorage is empty, and seeds with a hi-score of 0 on first visit
function onFirstLoad() {
    if (localStorage.length < 1) {
        localStorage.setItem('hiscore', '0');
    }
}
//Check if all bricks have been destroyed
function checkRemainingBricks() {
    if(numBricks == 0) {
        checkHiScore()
        alert("You win!");
        location.reload();
    }
}
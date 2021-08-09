// Declare game variables
var currentScene;
var welcome_title;
var welcome_text;
var ball;
var paddle;
var bricks;
var numBricks = 0;
var ballFired;
var ballLaunchSpeed = 400;
var score = 0;
var scoreText;
var hiScore;
var hiScoreText;
var bgMusic;
var baseHit;
var pop;
var sfxVolume = 0.05;
var defaultBrick;
var brickStyles = [];
var alertText;
var lives = 3;
var livesText;



// Welcome - Scene Class
class Welcome extends Phaser.Scene {
    constructor() {
        super({
            key: 'Welcome'
        });
    }

    preload() {
        //Load audio assets
        this.load.audio('bg-music', 'assets/audio/bgm.ogg');
        this.load.audio('hit', 'assets/audio/hit.wav');
        this.load.audio('pop', 'assets/audio/pop.ogg');
    }

    create() {
        // Set current scene
        currentScene = this;
        welcome_title = this.add.text(250, 300, 'Quarantine!', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            fill: '#fafafa'
        })
        welcome_text = this.add.text(115, 350, 'Press SPACEBAR or TOUCH to begin!', {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            fill: '#fafafa'
        })
        this.input.keyboard.on('keydown-SPACE', function () {
            currentScene.scene.start('Game');
        })
        this.input.on('pointerdown', function () {
            currentScene.scene.start('Game');
        })

        //Set up audio
        initialiseAudio();
        addAudioControlListeners();
    }
}

// Game - Scene Class
class Game extends Phaser.Scene {
    constructor() {
        super({
            key: 'Game'
        });
    }

    preload() {
        
        
        onFirstLoad();
        hiScore = localStorage.getItem('hiscore');
        this.load.image('ball', 'assets/img/ball.png');
        this.load.image('paddle', 'assets/img/paddle.png');
        this.load.image('brick-first-aid', 'assets/img/brick-first-aid.png');
        this.load.image('brick-normal', 'assets/img/brick-normal.png');
        this.load.image('brick-virus', 'assets/img/brick-virus.png');
    }

    create() {
        // Set current scene
        currentScene = this;

        // Set ballFired back to false
        ballFired = false

        //Set up the paddle
        initalisePaddle();

        //Set up the ball
        initialiseBall();

        //Set up possible brick styles
        initialiseBrickStyles();

        // Create bricks
        initialiseBricks();

        //Set up score display
        initialiseScore();

        //Set up alert text
        initialiseAlertText();

        //Set up physics interactions
        initalisePhysics();
    }

    //Phaser function called each frame
    update() {
        // Set paddle position 
        setPaddlePosition(this);

        //Stick the ball to the paddle when it's not fired
        setBallPosition();

        //Check if player has won the round
        checkRemainingBricks();

        // Check if player will lose a life
        checkLifeLost();

        //Check if player has lost the round
        checkGameOver();
    }
}

// Game Over - Scene Class
class GameOver extends Phaser.Scene {
    constructor() {
        super({
            key: 'GameOver'
        });
    }

    preload() {

    }

    create() {
        // Set current scene
        currentScene = this;
        // Set lives back to 3, and score back to 0
        lives = 3
        score = 0

        welcome_title = this.add.text(250, 300, 'GAME OVER!', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            fill: '#fafafa'
        })
        welcome_text = this.add.text(110, 350, 'Press SPACEBAR or TOUCH to play again!', {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            fill: '#fafafa'
        })
        this.input.keyboard.on('keydown-SPACE', function () {
            currentScene.scene.start('Game');
        })
        this.input.on('pointerdown', function () {
            currentScene.scene.start('Game');
        })
    }
}

// You win - Scene Class
class YouWin extends Phaser.Scene {
    constructor() {
        super({
            key: 'YouWin'
        });
    }

    preload() {

    }

    create() {
        // Set current scene
        currentScene = this;
        welcome_title = this.add.text(250, 300, 'YOU WIN!', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            fill: '#fafafa'
        })
        welcome_text = this.add.text(110, 350, 'Press SPACEBAR or TOUCH to play again!', {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            fill: '#fafafa'
        })
        this.input.keyboard.on('keydown-SPACE', function () {
            currentScene.scene.start('Game');
        })
        this.input.on('pointerdown', function () {
            currentScene.scene.start('Game');
        })
    }
}

//Initialise Paddle
function initalisePaddle() {
    // Create the paddle object. Applies physics, set original co-ordinates, and asigns art based on keyword as set in preloader
    paddle = currentScene.physics.add.sprite(400, 595, 'paddle');
    // Prevents paddle from being pushed away when collision with ball occurs
    paddle.setImmovable(true)
    //Set initial paddle position
    paddle.x = currentScene.cameras.main.centerX;
}

//Initialise Audio
function initialiseAudio() {
    // Creat sound object for Background Music, and play.
    bgMusic = currentScene.sound.add('bg-music', {
        volume: sfxVolume
    });
    bgMusic.setLoop(true);

    //  Create sound object for basic collision sound
    baseHit = currentScene.sound.add('hit', {
        volume: sfxVolume
    });

    //  Create sound object for basic collision sound
    pop = currentScene.sound.add('pop', {
        volume: sfxVolume
    });
}

//Initialise Ball
function initialiseBall() {
    // Create the ball object. Applies physics, set original co-ordinates, and asigns art based on keyword as set in preloader 
    ball = currentScene.physics.add.sprite(400, 575, 'ball');

    setBallPosition();
    // Tells ball to collide with world boundaries
    ball.setCollideWorldBounds(true);
    // Allows ball to create an event when a world boundary collision occurs
    ball.body.onWorldBounds = true;
    // Lets ball bounce
    ball.setBounce(1, 1);
    // Launch the ball on mouse click
    currentScene.input.on('pointerdown', releaseBall);
}

//Initialise Score display
function initialiseScore() {
    // Display the scores
    scoreText = currentScene.add.text(8, 4, 'SCORE: ' + score, {
        fontFamily: '"Press Start 2P"',
        fontSize: '20px',
        fill: '#fafafa'
    });
    livesText = currentScene.add.text(260, 4, 'LIVES: ' + lives, {
        fontFamily: '"Press Start 2P"',
        fontSize: '20px',
        fill: '#fafafa'
    });
    hiScoreText = currentScene.add.text(525, 4, 'HISCORE: ' + hiScore, {
        fontFamily: '"Press Start 2P"',
        fontSize: '20px',
        fill: '#fafafa'
    });
}

//Initialise alert text object to be used to display in game alerts
function initialiseAlertText() {
    alertText = currentScene.add.text(currentScene.cameras.main.centerX,
        currentScene.cameras.main.centerY,
        "", {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            fill: "yellow"
        }
    ).setOrigin(0.5);
}

//Initialise Brick styles
function initialiseBrickStyles() {
    //Normal brick
    let normalBrick = {
        name: 'brick-normal',
        score: 10,
        default: true
    }
    defaultBrick = normalBrick;

    //First Aid Brick (Powerup)
    let firstAidBrick = {
        name: 'brick-first-aid',
        score: 50,
        chance: 90,
        onDestroy: onDestroyPowerup
    }
    brickStyles.push(firstAidBrick);

    //Virus Brick (Hazard)
    let virusBrick = {
        name: 'brick-virus',
        score: 0,
        chance: 10,
        onDestroy: onDestroyHazard
    }
    brickStyles.push(virusBrick);
}

// Configure physics
function initalisePhysics() {
    // Set 3 of 4 boundaries to detect collisions
    currentScene.physics.world.setBoundsCollision(true, true, true, false);

    // Allows ball and paddle to collide
    currentScene.physics.add.collider(ball, paddle, ballPaddleCollision);

    // Listens for world boundary event, and triggers onWorldBounds
    currentScene.physics.world.on('worldbounds', onWorldBounds);

    //Add brick and ball collision
    currentScene.physics.add.collider(ball, bricks, ballBrickCollsion);
}


//Set paddle position
function setPaddlePosition() {
    // Moves the paddle along the x axis based on player input (mouse or touch)
    let minPaddlePos = paddle.width / 2;
    let maxPaddlePos = currentScene.cameras.main.width - (paddle.width / 2);
    paddle.x = Phaser.Math.Clamp(currentScene.input.x, minPaddlePos, maxPaddlePos);
}

//Set ball position when it hasn't been fired yet
function setBallPosition() {
    //Stick the ball to the paddle
    if (!ballFired) {
        //Position ball horizontally in the middle of the paddle and vertically just above it
        ball.x = paddle.x;
        ball.y = paddle.y - (paddle.height / 2) - (ball.height / 2) - 5;
        //Stop ball moving, otherwise it tries to keep previous velocity
        ball.body.setVelocity(0);
    }
}

// Fires whenever a world boundary event is captured by the listener above
// Checks if player has lost, i.e. if the ball's position on y axis is below the paddle's
function onWorldBounds() {
    //Collided with a wall - add velocity on collision to stop the ball getting stuck in a continuous horizontal bounce
    //Only adjust the ball velocity if the ball has been fired
    if (ballFired) {
        let ballXVelocity = ball.body.velocity.x;
        let ballYVelocity = ball.body.velocity.y;
        //If ball is moving down or perfectly horizontally when it hits a wall, add a little bit of downward velocity
        if (ball.body.velocity.y >= 0) {
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
        row: 3,
        col: 12
    },
    offset: {
        top: 64,
        left: 48
    },
    padding: 0
};

//Create bricks on screen from config
function initialiseBricks() {
    bricks = currentScene.physics.add.staticGroup();

    //Loop through the number of columns and rows in the layout definition
    for (let column = 0; column < brickLayout.count.col; column++) {
        for (let row = 0; row < brickLayout.count.row; row++) {
            let brickX = (column * (brickConfig.width + brickLayout.padding)) + brickLayout.offset.left;
            let brickY = (row * (brickConfig.height + brickLayout.padding)) + brickLayout.offset.top;
            //Get the brick type we want to add to the array
            let brickToAdd = chooseBrickToAdd();
            //Add the new brock to the collection
            let newBrick = bricks.create(brickX, brickY, brickToAdd);
            //Set the name of the new brick to the brick type, so we can use it later.
            newBrick.name = brickToAdd;
            //Increment the number of bricks in the game
            numBricks++;
        }
    }

    //Choose which brick to add from the array of potential bricks
    function chooseBrickToAdd() {
        for(let brickStyle of brickStyles) {
            let spawnChance = getRandomBetweenRange(1, 100);
            if(spawnChance <= brickStyle.chance) {
                return brickStyle.name;
            }
        }
        return defaultBrick.name;
    }
}

//Function called from a positive brick being destroyed
function onDestroyPowerup() {
    //Build an array of possible powerups
    let powerups = [
        {
            name: "Decrease Ball Speed",
            action: decreaseBallSpeed
        },
        {
            name: "Increase Paddle Width",
            action: increasePaddleWidth
        }
    ];

    //Get a random array index
    let randomPowerup = getRandomBetweenRange(0, powerups.length - 1);
    console.log(randomPowerup);
    console.log(powerups[randomPowerup]);
    //Set alert text to the name of the powerup
    setAlertText(powerups[randomPowerup].name + "!");
    //Perform the powerup's action
    powerups[randomPowerup].action();
    //Clear alert text after it's been set for 2s
    currentScene.time.addEvent({
        delay: 1500,
        callback: ()=>{
            setAlertText("");
        },
        loop: false
    })
}

//Power up to decrease ball's speed
function decreaseBallSpeed() {
    ball.body.velocity.x *= 0.8;
    ball.body.velocity.y *= 0.8;
    //Clamp the ball speed so it doesn't go too slow
    if(ball.body.velocity.x < 150) {
        ball.body.velocity.x = 150
    }
    if(ball.body.velocity.y < 150) {
        ball.body.velocity.y = 150
    }
}

//Power up to increase paddle width
function increasePaddleWidth() {
    paddle.scaleX *= 1.2;
    //Clamp the scale to stop it getting too big.
    if(paddle.scaleX > 2) {
        paddle.scaleX = 2;
    }
}

function onDestroyHazard() {
    //Build an array of possible hazards
    let hazards = [
        {
            name: "Increase Ball Speed",
            action: increaseBallSpeed
        }
    ];

    //Get a random array index
    let randomHazard = getRandomBetweenRange(0, hazards.length - 1);
    //Set alert text to the name of the powerup
    setAlertText(hazards[randomHazard].name + "!");
    //Perform the powerup's action
    hazards[randomHazard].action();
    //Clear alert text after it's been set for 2s
    currentScene.time.addEvent({
        delay: 1500,
        callback: ()=>{
            setAlertText("");
        },
        loop: false
    })
}

//Hazard to increase ball's speed
function increaseBallSpeed() {
    ball.body.velocity.x *= 1.4;
    ball.body.velocity.y *= 1.4;
    //Clamp the ball speed so it doesn't go too fast
    if(ball.body.velocity.x > 800) {
        ball.body.velocity.x = 800
    }
    if(ball.body.velocity.y > 800) {
        ball.body.velocity.y = 800
    }
}

//Set alert text to passed in parameter
function setAlertText(newText){
    alertText.text = newText;
}

//Define what happens when a brick gets hit
function ballBrickCollsion(ball, brick) {
    //Play sfx
    pop.play();
    //Remove the brick
    brick.disableBody(true, true);
    //Decrease the number of active bricks in the game
    numBricks--;
    //Call bonus effect for the brick
    brickDestroyBonus(brick);
    //Add score
    increaseScore(brick);
}

//Get the bonus function to call when the brick is destroyed
function brickDestroyBonus(brick) {
    for(let brickStyle of brickStyles) {
        if(brick.name == brickStyle.name) {
            //Check if the brick has a bonus effect
            if("onDestroy" in brickStyle) {
                brickStyle.onDestroy();
            }
        }
    }
}

//Add score based on the properties of the destroyed brick
function increaseScore(brick) {
    //Check if we hit the default brick and get its score
    if(brick.name == defaultBrick.name) {
        score += defaultBrick.score;
    }
    //Loop through the other bricks and get their score value
    else {
        for(let brickStyle of brickStyles) {
            if(brick.name == brickStyle.name) {
                score += brickStyle.score;
            }
        }
    }
    updateScoreText();
}

//Update score text
function updateScoreText() {
    scoreText.setText('SCORE: ' + score);
}

//Update Lives text
function updateLivesText() {
    livesText.setText('LIVES: ' + lives);
}

//Set the velocity of the ball to fire up from the paddle
function releaseBall() {
    if (!ballFired) {
        ball.setVelocity(getRandomBetweenRange(-200, 200), -ballLaunchSpeed);
        //Set ball as fired so it stops sticking to the paddle
        ballFired = true;
    }
}

//Generate a random number between the passed in values
function getRandomBetweenRange(min, max) {
    if (max < min) {
        console.log("Incorrect values passed to getRandomBetweenRange. Max should be > min");
        return 0;
    }
    return Math.floor(Math.random() * (max - min + 1) + min);
}

//Define what happens when the ball collides with the paddle
function ballPaddleCollision(ball, paddle) {
    baseHit.play();
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
    if (numBricks == 0) {
        checkHiScore();
        currentScene.scene.start('YouWin');
    }
}

// Check if ball is below paddle
function checkLifeLost() {
    if (ball.y > (paddle.y)) {
        lives -= 1;
        ballFired = false;
        setBallPosition();
        updateLivesText();
    }
}

// Check if ball is below paddle
function checkGameOver() {
    if (lives == 0) {
        checkHiScore();
        currentScene.scene.start('GameOver')
    }
}

//Add event listener to any audio control buttons
function addAudioControlListeners() {
    let musicControlButton = document.getElementById("music-toggle");
    musicControlButton.addEventListener("change", toggleMusic);
}

//If music is set to play, turn it off. If it is off, turn it on
function toggleMusic() {
    let musicControlButton = document.getElementById("music-toggle");
    if (musicControlButton.checked) {
        bgMusic.play();
    } else {
        bgMusic.pause();
    }
}


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
    scene: [Welcome, Game, GameOver, YouWin],
    backgroundColor: 0x333333
};

// Instantiate Phaser
var game = new Phaser.Game(config);
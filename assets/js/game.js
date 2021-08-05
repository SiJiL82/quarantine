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

function preload(){
    this.load.image('ball', 'assets/img/ball.png');
}

function create(){
    // Create the ball object. Applies physics, set original co-ordinates, and asigns art based on keyword as set in preloader 
    ball = this.physics.add.sprite(400, 575, 'ball');
}

function update(){

}
/*
 * Menu class
 * Simple menu with only button start
 */
class Menu extends Phaser.Scene {

    constructor() {
        super('Menu');
    }

    preload() {
        // Load background
        this.load.image('background', './assets/bg.png');

        // Load button
        this.load.image('button', './assets/btnStart.png');

        // Load title
        this.load.image('title', './assets/title.png');
    }

    create() {
        // A simple background for our game
        this.add.image(500, 350, 'background');

        // Load button menu
        var button = this.add.image(500, 450, 'button');
        button.setScale(0.6);
        this.add.image(500, 175, 'title');

        // Event click button
        button.setInteractive().once('pointerup', function() {
            this.scene.start('Game');
        }, this);
    }
}

/*
 * Game class
 * Manage session game pong
 */
class Game extends Phaser.Scene {

    constructor() {
        super('Game');
    }

    preload() {
        // Load background
        this.load.image('backgroundGame', './assets/bgGame.png');

        // Load Band Game
        this.load.image('bandGame', './assets/bandGame.png');

        // Load racket spritesheet
        this.load.spritesheet('racket', './assets/racketSprite.png', {
            frameWidth: 272,
            frameHeight: 25
        });

        // Load balls spritesheet
        this.load.spritesheet('ball', './assets/balls.png', {
            frameWidth: 46,
            frameHeight: 48
        });

        // Load dead Band
        this.load.image('deadBand', './assets/deadBand.png');

        // Load sound
        this.load.audio('pongHit', [
            './sounds/pongHit.wav'
        ]);

        this.load.audio('pongGameOver', [
            './sounds/pongGameOver.wav'
        ]);
    }

    create() {
        // Display background
        this.add.image(500, 350, 'backgroundGame');
        this.add.image(500, 50, 'bandGame');

        this.deadBand = this.physics.add.staticGroup();
        this.deadBand.create(500, 710, 'deadBand').refreshBody();

        // Instantiate racket
        this.racket = this.physics.add.sprite(400, 650, 'racket');
        this.racket.setImmovable(true);

        // Number of balls
        this.createBall();
        this.createBall();
        this.balls = 2;
        this.ballsText = this.add.text(490, 20, this.balls, {
            fontSize: '30px',
            fill: '#000'
        });

        // Instantiate score 
        this.score = 0;
        this.scoreText = this.add.text(250, 25, 'Score: 0', {
            fontSize: '20px',
            fill: '#fff'
        });

        // Chrono text
        this.chrono = 0;
        this.chronoText = this.add.text(620, 25, 'Chrono:' + this.chrono, {
            fontSize: '20px',
            fill: '#fff'
        }, this);

        // Instantiate chrono 
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.secondCounter,
            callbackScope: this,
            loop: true
        })

        // Sound manager
        this.pongHit = this.sound.add('pongHit');
        this.pongGameOver = this.sound.add('pongGameOver');

        this.cursors = this.input.keyboard.createCursorKeys();

        // Manage movement touch event drag
        this.input.on('pointermove', function(pointer) {
            this.physics.moveTo(this.racket, pointer.x, 650, 400);
        }, this);
    }

    update() {
        // Refresh information chrono and balls
        this.chronoText.setText("Chrono :" + this.chrono);
        this.ballsText.setText(this.balls);

        // Event movement manager with keyboard
        if (this.cursors.left.isDown) {
            this.racket.setVelocityX(-300);
        } else if (this.cursors.right.isDown) {
            this.racket.setVelocityX(300);
        } else {
            this.racket.setVelocityX(0);
        }

        // Verify if gameOver
        this.isGameOver();
    }


    /**
     * Generate ball
     */
    createBall() {
        // Random parameters
        var randX = Phaser.Math.Between(100, 900);
        var randSpeedX = Phaser.Math.Between(-100, 100);
        var randSpeedY = Phaser.Math.Between(300, 400);
        var randColor = Phaser.Math.Between(0, 1);

        // The initial ball and its settings
        var ball = this.physics.add.sprite(randX, 450, 'ball', randColor);

        // Ball physics properties.
        ball.setBounce(1);
        ball.setCollideWorldBounds(true);
        ball.setVelocity(randSpeedX, -randSpeedY);
        ball.allowGravity = true;
        ball.setGravityY(281);

        // Manage collider ball and racket
        this.physics.add.collider(ball, this.racket, function() {
            this.pongHit.play();
            this.score += 10;
            this.scoreText.setText('Score: ' + this.score);
        }, null, this);

        // Manage collider ball and deadBand
        this.physics.add.collider(ball, this.deadBand, function() {
            ball.destroy();
            this.balls -= 1;
            this.pongGameOver.play();
        }, null, this);

        // Add ball to the count
        this.balls += 1;
    }

    /**
     * Chrono manager
     */
    secondCounter() {
        // Generate new ball each 20 seconds
        if (this.chrono != 0 && this.chrono % 20 == 0) {
            this.createBall();
        }
        this.chrono += 1;
    }

    /**
     * Verify is game over
     */
    isGameOver() {
        if (this.balls == 0) {
            this.scene.start('Menu');
        }
    }
}

// Config file
var config = {
    type: Phaser.WEBGL,
    width: 1000,
    height: 700,
    physics: {
        default: 'arcade'
    },
    parent: 'phaser-example',
    scene: [Menu, Game]
};

var game = new Phaser.Game(config);
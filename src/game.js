var game = {
    width: 640,
    height: 360,
    ctx: undefined,
    platform: undefined,
    ball: undefined,

    block: function(x, y) {
        this.ctx.beginPath();
        this.ctx.rect(x, y, 64, 32);
        this.ctx.fillStyle = "lightblue";
        this.ctx.fill();
        this.ctx.closePath();
    },
    blocks: [],
    rows: 4,
    cols: 8,

    running: true,
    score: 0,

    sprites: {
        background: undefined,
        platform: undefined,
        ball: undefined
        // block: undefined
    },
    init: function() {
        var canvas = document.getElementById('canvas');
        this.ctx = canvas.getContext("2d");

        this.ctx.font = "20px Arial";

        window.addEventListener("keydown", function(evt) {
            if(evt.keyCode == 37) {
                game.platform.dx = -game.platform.speed; 
            } else if(evt.keyCode == 39) {
                game.platform.dx = game.platform.speed; 
            } else if(evt.keyCode == 32) {
                game.platform.releaseBall();
            }
        });
        window.addEventListener("keyup", function() {
            game.platform.stop();
        });
    },
    load: function() {
        for(let key in this.sprites) {
            this.sprites[key] = new Image();
            this.sprites[key].src = "./dist/img/" + key + ".png";
        }
    },
    create: function() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.blocks.push({
                    x: 68 * col + 50,
                    y: 38 * row + 35,
                    width: 64,
                    height: 32,
                    isAlive: true
                });
            }
        }
        
    },
    start: function(){
        this.init();
        this.load();

        this.create();

        this.run();
    },
    render: function() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.drawImage(this.sprites.background, 0, 0);
        this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
        this.ctx.drawImage(this.sprites.ball, this.ball.x, this.ball.y);

        this.blocks.forEach(function(elem) {
            if (elem.isAlive) {
                this.block(elem.x, elem.y);
            }
        }, this);

        this.ctx.fillStyle = "#FFF";
        this.ctx.fillText("SCORE:" + this.score, 15, this.height - 15);
    },
    update: function() {

        if(this.platform.dx) {
            this.platform.move();
        }
        if(this.ball.dx || this.ball.dy) {
            this.ball.move();
        }

        this.blocks.forEach(function(elem) {
            if (elem.isAlive) {
                if(this.ball.collide(elem)) {
                    this.ball.bumpBlock(elem);
                }
            }
        }, this);

        this.ball.checkBounds();

        if(this.ball.collide(this.platform)) {
            this.ball.bumpPlatform(this.platform);
        }
    },
    run: function() {
        this.update();
        this.render();

        if (this.running) {
            window.requestAnimationFrame(function() {
                game.run();
            });
        }
    },
    over: function(message) {
        alert(message);
        this.running = false;
        window.location.reload();
    }
};

game.ball = {
    width: 22,
    height: 22,
    x: 309,
    y: 278,
    speed: 3,
    dx: 0,
    dy: 0,
    jump: function() {
        this.dx = -this.speed;
        this.dy = -this.speed;
    },
    move: function() {
        this.x += this.dx;
        this.y += this.dy;
    },
    collide: function(elem) {
        let x = this.x + this.dx;
        let y = this.y + this.dy;

        if( x + this.width > elem.x &&
            x < elem.x + elem.width &&
            y + this.height > elem.y &&
            y < elem.y + elem.height) {
            return true;
        }

        return false;
    },
    bumpBlock: function(block) {
        this.dy *= -1;
        block.isAlive = false;
        ++game.score;

        if(game.score >= game.blocks.length) {
            game.over('You win!');
        }
    },
    onTheLeftSide: function(platform) {
        return (this.x + this.width / 2) < (platform.x + platform.width / 2);
    },
    bumpPlatform: function(platform){
        this.dy = -this.speed;
        this.dx = this.onTheLeftSide(platform) ? -this.speed : this.speed;
    },
    checkBounds: function() {
        let x = this.x + this.dx;
        let y = this.y + this.dy;

        if(x < 0) {
            this.x = 0;
            this.dx = this.speed;
        } else if (x + this.width > game.width) {
            this.x = game.width - this.width;
            this.dx = -this.speed;
        } else if(y < 0) {
            this.y = 0;
            this.dy = this.speed;
        } else if(y + this.height > game.height) {
            // game over
            game.over('Game over(');
        }
    }
};

game.platform = {
    x: 268,
    y: 300,
    width: 104,
    height: 24,
    speed: 5,
    dx: 0,
    ball: game.ball,
    releaseBall: function() {
        if(this.ball) {
            this.ball.jump();
            this.ball = false;
        }
    },
    move: function() {
        this.x += this.dx;

        if(this.ball) {
            this.ball.x += this.dx;
        }
    },
    stop: function() {
        this.dx = 0;

        if(this.ball) {
            // this.ball.x += this.dx;
            // this.ball.dx = 0;
            // console.log('stop');
            // console.log(game);
        }
    }
};

window.addEventListener('load', function() {
    game.start();
    console.log(game);
});
window.addEventListener('load', function() {
    var canvas    = document.querySelector('canvas');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    var Squirts = {
        game: new GameLoop({
            world: new World({
                canvas       : canvas,
                extents      : new Rectangle(new Vector2d(0, 0), 2000, 2000),
                viewport     : new Rectangle(new Vector2d(0, 0), canvas.width, canvas.height),
                backgroundEl : document.documentElement
            })
        })
    };

    Squirts.game.world.clear();

    var buttons = document.querySelectorAll('[data-action=startGame]');
    var startScreen = document.querySelector('#startScreen');
    var replayScreen = document.querySelector('#replayScreen');
    var score = document.querySelector('#score');

    for(var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function(e) {
            e.preventDefault();

            if (Squirts.game.running) {
                Squirts.game.stop();
            }

            Squirts.game.world.generate({
                count  : 160,
                radius : 20,
                speed  : 80
            });

            Squirts.game.start();
            score.style.display = 'block';
            startScreen.style.display = 'none';
            replayScreen.style.display = 'none';
        }, false);
    }

    // Listen for the `playerDied` event to show the end screen
    Squirts.game.world.on('playerDied', function() {
        Squirts.game.stop();
        replayScreen.style.display = 'block';
        score.style.display = 'none';
    });

    // If any blob gets absorbed, we need to update the scoreboard
    Squirts.game.world.on('absorbed', function() {
        var blobs = Squirts.game.world.blobs.length - 1;
        score.querySelector('span').textContent = blobs;
        // If there are no more blobs (besides the player), we need
        // to show the end screen
        if (blobs <= 0) {
            Squirts.game.stop();
            replayScreen.style.display = 'block';
            score.style.display = 'none';     
        }
    });

    // If a player squirts a blob, it creates a new blob and we must
    // update the scoreboard
    Squirts.game.world.on('squirted', function() {
        score.querySelector('span').textContent = Squirts.game.world.blobs.length - 1;
    });

    // Handle time acceleration keys to slow down or speed up time
    // NOTE: this handler will be refactored into a separate Controller
    //       class that will issue commands to the game and the world.
    document.body.addEventListener('keydown', function(ev) {
        var key = String.fromCharCode(ev.keyCode);
        if (key.toLowerCase() == 'a') {
            Squirts.game.world.timeMultiplier = Math.max(0.125, Squirts.game.world.timeMultiplier / 2);
        } else if (key.toLowerCase() == 's') {
            Squirts.game.world.timeMultiplier = Math.min(8, Squirts.game.world.timeMultiplier * 2);
        }
    }, false);

    // Export the game
    this.Squirts = Squirts;

}, false);
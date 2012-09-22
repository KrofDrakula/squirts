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

    Squirts.game.world.clear(true);

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

    Squirts.game.world.on('playerDied', function() {
        Squirts.game.stop();
        replayScreen.style.display = 'block';
        score.style.display = 'none';
    });

    Squirts.game.world.on('absorbed', function() {
        var blobs = Squirts.game.world.blobs.length - 1;
        score.querySelector('span').textContent = blobs;
        if (blobs <= 0) {
            Squirts.game.stop();
            replayScreen.style.display = 'block';
            score.style.display = 'none';     
        }
    });

    Squirts.game.world.on('squirted', function() {
        score.querySelector('span').textContent = Squirts.game.world.blobs.length - 1;
    });

    document.body.addEventListener('keydown', function(ev) {
        var key = String.fromCharCode(ev.keyCode);
        if (key.toLowerCase() == 'a') {
            Squirts.game.world.timeMultiplier = Math.max(0.125, Squirts.game.world.timeMultiplier / 2);
        } else if (key.toLowerCase() == 's') {
            Squirts.game.world.timeMultiplier = Math.min(8, Squirts.game.world.timeMultiplier * 2);
        }
    }, false);

    this.Squirts = Squirts;

}, false);
(function() {
    var canvas    = document.querySelector('canvas');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    var Squirts = {
        game: new GameLoop({
            world: new World({
                canvas   : canvas,
                extents  : new Rectangle(new Vector2d(0, 0), 2000, 2000),
                viewport : new Rectangle(new Vector2d(0, 0), canvas.width, canvas.height)
            })
        })
    };

    Squirts.game.world.clear(true);

    var buttons = document.querySelectorAll('[data-action=startGame]');
    var startScreen = document.querySelector('#startScreen');
    var replayScreen = document.querySelector('#replayScreen');

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
            startScreen.style.display = 'none';
            replayScreen.style.display = 'none';
        });
    }

    Squirts.game.world.on('playerDied', function() {
        Squirts.game.stop();
        replayScreen.style.display = 'block';
    });

    document.body.addEventListener('keydown', function(ev) {
        var key = String.fromCharCode(ev.keyCode);
        if (key.toLowerCase() == 'a') {
            Squirts.game.world.timeMultiplier = Math.max(0.125, Squirts.game.world.timeMultiplier / 2);
        } else if (key.toLowerCase() == 's') {
            Squirts.game.world.timeMultiplier = Math.min(8, Squirts.game.world.timeMultiplier * 2);
        }
    });

    this.Squirts = Squirts;

})();
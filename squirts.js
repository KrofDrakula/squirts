(function() {
    var canvas    = document.querySelector('canvas');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    var Squirts = {
        game: new GameLoop({
            world: new World({
                canvas   : canvas,
                extents  : new Rectangle(new Vector2d(0, 0), canvas.width, canvas.height),
                viewport : new Rectangle(new Vector2d(0, 0), canvas.width, canvas.height)
            })
        })
    };

    Squirts.game.world.clear(true);

    var button = document.querySelector('#startGame');
    button.addEventListener('click', function() {
        if (Squirts.game.running) {
            Squirts.game.stop();
        }

        Squirts.game.world.generate({
            count  : 160,
            radius : 20,
            speed  : 10
        });

        Squirts.game.start();
        button.style.display = 'none';
    });

    Squirts.game.world.on('playerDied', function() {
        button.style.display = 'block';
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
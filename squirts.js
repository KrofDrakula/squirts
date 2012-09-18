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

    Squirts.game.world.generate({
        count  : 40,
        radius : 60
    })

    document.querySelector('#startGame').addEventListener('click', function() {
        Squirts.game.running ? Squirts.game.stop() : Squirts.game.start();
    });

    this.Squirts = Squirts;

})();
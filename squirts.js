(function() {
    var canvas    = document.querySelector('canvas');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    window.Squirts = {
        game: new GameLoop({
            world: new World({
                canvas   : canvas,
                extents  : new Rectangle(new Vector2d(0, 0), 2000, 2000),
                viewport : new Rectangle(new Vector2d(0, 0), canvas.width, canvas.height)
            })
        })
    };

    document.querySelector('#startGame').addEventListener('click', function() {
        Squirts.game.running ? Squirts.game.stop() : Squirts.game.start();
    });
    
})();
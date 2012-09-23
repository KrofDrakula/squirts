// Manages the updates to the game world and enables control
// of the game instance
function GameLoop(options) {
    this.world = options.world;
    this.tick = Common.bind(this, this.tick);
    this._lastUpdateTime = null;
    this._rafId = null;
}

// Starts the game loop
GameLoop.prototype.start = function() {
    this.running = true;
    this.tick();
};

// Stops the game loop and resets the world
GameLoop.prototype.stop = function() {
    if (!this.running) return;

    if (this._rafId)
        cancelAnimationFrame(this._rafId);
    this._rafId = null;

    this.running = false;
    this._lastUpdateTime = null;

    this.world.reset();
}

// Calculates the time delta from the last redraw and
// issues an update to the world.
GameLoop.prototype.tick = function() {
    this._rafId = requestAnimationFrame(this.tick);

    var currentTime = +new Date;
    if (this._lastUpdateTime == null)
        this._lastUpdateTime = currentTime;

    var elapsed = currentTime - this._lastUpdateTime;

    this.update(elapsed);
    this.draw();

    this._lastUpdateTime = currentTime;
};

// Updates the world state
GameLoop.prototype.update = function(elapsed) {
    this.world.stepSimulation(elapsed);
};

// Renders the world
GameLoop.prototype.draw = function() {
    this.world.draw();
};
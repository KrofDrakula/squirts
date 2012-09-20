function GameLoop(options) {
    this.world = options.world;
    this.tick = Common.bind(this, this.tick);
    this._lastUpdateTime = null;
    this._rafId = null;

    var self = this;
    this.world.on('playerDied', function() {
        self.stop();
        alert('You have died.\n\nGAME OVER');
    });
}

GameLoop.prototype.start = function() {
    this.running = true;
    this.tick();
};

GameLoop.prototype.stop = function() {
    if (!this.running) return;

    if (this._rafId)
        cancelAnimationFrame(this._rafId);
    this._rafId = null;

    this.running = false;
    this._lastUpdateTime = null;

    this.world.reset();
}

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

GameLoop.prototype.update = function(elapsed) {
    this.world.stepSimulation(elapsed);
};

GameLoop.prototype.draw = function() {
    this.world.draw();
};
// Represents a single particle emitted by the ParticleEmitter
function Particle(options) {
    this.position      = new Vector2d(0, 0);
    this.speed         = options.speed;
    this.color         = options.color;
    this.lifetime      = options.lifetime || 1000;
    this.size          = options.size || 2;
    this.age           = 0;
    this._lastPosition = this.position;
}

// Integrate the particle's motion equations
Particle.prototype.tick = function(dt) {
    this.age += dt;
    this._lastPosition = this.position;
    this.position = this.position.add(this.speed.scale(dt / 1000));
};

// Render the particle
Particle.prototype.render = function(ctx) {
    var intensity = 1 - this.age / this.lifetime;

    if (intensity <= 0) return;

    var currentSize = this.size * intensity;

    // Since we assume the particle exists in screen space, we simply
    // use the context to move to the screen position and render it
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = intensity * 2;
    ctx.beginPath();
    ctx.moveTo(this._lastPosition.x, this._lastPosition.y);
    ctx.lineTo(this.position.x, this.position.y);
    ctx.closePath();

    ctx.globalAlpha = intensity;
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.restore();
};
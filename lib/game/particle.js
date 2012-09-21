function Particle(options) {
    this.position      = new Vector2d(0, 0);
    this.speed         = options.speed;
    this.color         = options.color;
    this.lifetime      = options.lifetime || 1000;
    this.size          = options.size || 2;
    this.age           = 0;
    this._lastPosition = this.position;
}

Common.extend(Particle.prototype, EventEmitter);

Particle.prototype.tick = function(dt) {
    this.age += dt;
    this._lastPosition = this.position;
    this.position = this.position.add(this.speed.scale(dt / 1000));
};

Particle.prototype.render = function(ctx) {
    var intensity = 1 - this.age / this.lifetime;

    if (intensity <= 0) return;

    var currentSize = this.size * intensity;

    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = intensity * 1.5;
    ctx.beginPath();
    ctx.moveTo(this._lastPosition.x, this._lastPosition.y);
    ctx.lineTo(this.position.x, this.position.y);
    ctx.closePath();

    ctx.globalAlpha = intensity * 0.8;
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.restore();
};
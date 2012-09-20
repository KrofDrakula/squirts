function Particle(options) {
    this.position = new Vector2d(0, 0);
    this.speed    = options.speed;
    this.color    = options.color;
    this.lifetime = options.lifetime || 1000;
    this.size     = options.size || 2;
    this.age      = 0;
}

Common.extend(Particle.prototype, EventEmitter);

Particle.prototype.tick = function(dt) {
    this.age += dt;
    dt /= 1000;
    this.position = this.position.add(this.speed.scale(dt));
};

Particle.prototype.render = function(ctx) {
    var intensity = 1 - this.age / this.lifetime;

    if (intensity <= 0) return;

    var currentSize = this.size * intensity;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, currentSize, 0, 2 * Math.PI);
    ctx.closePath();

    ctx.globalAlpha = intensity * 0.6;
    ctx.fill();
    ctx.globalAlpha = 1;
};
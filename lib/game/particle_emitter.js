function ParticleEmitter(options) {
    this.position  = options.position;
    this.direction = options.direction;
    this.color     = options.color;
    this.lifetime  = options.lifetime;
    this.count     = options.count || 4;
    this.particles = [];

    this.speedScale = 250;
}

Common.extend(ParticleEmitter.prototype, EventEmitter);

ParticleEmitter.prototype.start = function() {
    var baseSpeed = this.direction.scale(this.speedScale);
    for (var i = 0; i < this.count; i++) {
        var speed = baseSpeed.add(Vector2d.random().scale(this.speedScale / 4));
        this.particles.push(new Particle({
            color    : Math.random() < 0.5 ? '#ff0000' : '#ff6600',
            lifetime : this.lifetime,
            speed    : i % 2 ? speed : speed.neg()
        }));
    }
};

ParticleEmitter.prototype.tick = function(dt) {
    this.particles.forEach(function(particle) {
        particle.tick(dt);
    });
    if (!this.hasLiveParticles()) this.emit('dead', this);
};

ParticleEmitter.prototype.hasLiveParticles = function() {
    return this.particles.reduce(function(u, v) { return (u.age < u.lifetime) || v; }, false);
};

ParticleEmitter.prototype.render = function(ctx) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    this.particles.forEach(function(particle) {
        particle.render(ctx);
    });
    ctx.restore();
};
function ParticleEmitter(options) {
    this.position  = options.position;
    this.color     = options.color;
    this.lifetime  = options.lifetime;
    this.count     = options.count || 6;
    this.particles = [];
}

Common.extend(ParticleEmitter.prototype, EventEmitter);

ParticleEmitter.prototype.start = function() {
    for (var i = 0; i < this.count; i++) {
        this.particles.push(new Particle({
            color    : this.color,
            lifetime : this.lifetime
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
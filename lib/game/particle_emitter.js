// Represents a source of particles for the renderer, manages
// the rendering of individual particles, their lifetimes and
// updates the particles. They are separate entities in the world,
// since they do not interact with other entities.
function ParticleEmitter(options) {
    this.position  = options.position;
    this.direction = options.direction;
    this.lifetime  = options.lifetime;
    this.mirrored  = (typeof options.mirrored == 'undefined') ? true : options.mirrored;
    this.count     = options.count || 16;
    this.clipping  = options.clipping || new Rectangle(new Vector2d(0, 0), window.innerWidth, window.innerHeight);
    this.particles = [];

    this.speedScale = 250;
}

// Add the EventEmitter API
Common.extend(ParticleEmitter.prototype, EventEmitter);

// Starting the particle emitter creates a number of particles with
// random direction and speed according to the passed parameter.
ParticleEmitter.prototype.start = function() {
    var baseSpeed = this.direction.scale(this.speedScale);
    for (var i = 0; i < this.count; i++) {
        var speed = baseSpeed.add(Vector2d.random().scale(this.speedScale / 4));
        this.particles.push(new Particle({
            color    : Math.random() < 0.5 ? '#ff0000' : '#ff6600',
            lifetime : this.lifetime,
            speed    : this.mirrored ? (i % 2 ? speed : speed.neg()) : speed
        }));
    }
};

// Steps the physics simulation for the particles. If the lifetimes
// of all particles have exceeded their lifetimes, it emits a `dead`
// event to signal all particles have extinguished.
ParticleEmitter.prototype.tick = function(dt) {
    this.particles.forEach(function(particle) {
        particle.tick(dt);
    });
    if (!this.hasLiveParticles()) this.emit('dead', this);
};

// Returns true or false if any of the particles are still live
ParticleEmitter.prototype.hasLiveParticles = function() {
    return this.particles.reduce(function(u, v) { return u || (v.age < v.lifetime); }, false);
};

// Renders the particle at the particle's screen position
ParticleEmitter.prototype.render = function(ctx) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    this.particles.forEach(function(particle) {
        particle.render(ctx);
    });
    ctx.restore();
};
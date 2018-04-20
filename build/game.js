(function() {

    // http://www.jspatterns.com/classical-inheritance/
    function inherit(P, C) {
        var F = function(){};
        F.prototype = P.prototype;
        C.prototype = new F();
        C.uber = P.prototype;
        C.uberConstructor = C.prototype.uberConstructor = P;
        // convenience function for constructor inheritance
        C.prototype.super = function() {
            this.uberConstructor.apply(this, arguments);
        };
        C.prototype.constructor = C;
        extend(C, P);
    }

    // Copies properties to `obj` from other objects passed in arguments[1...]
    function extend(obj) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            for (var name in source) if (source.hasOwnProperty(name))
                obj[name] = source[name];
        }
    }

    // Binds a function to a context
    function bind(ctx, fn) {
        return function() {
            fn.apply(ctx, arguments);
        };
    }

    // Exports
    this.Common = {
        inherit : inherit,
        extend  : extend,
        bind    : bind
    };

})();


// requestAnimationFrame implementation
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = 
            window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

// The EventEmitter API
window.EventEmitter = {
    on : function(type, handler) {
        this._ensureEvent(type);
        this._events[type].push(handler);
    },
    off : function(type, handler) {
        if (this._events && this._events[type]) {
            this._events[type] = this._events[type].filter(function(h) {
                return h !== handler;
            });
        }
    },
    emit: function(type) {
        var args = Array.prototype.slice.call(arguments, 1);
        this._ensureEvent(type);
        this._events[type].forEach(function(handler) {
            handler.apply(this, args);
        });
    },
    _ensureEvent: function(type) {
        if (!this._events) this._events = {};
        if (!this._events[type]) this._events[type] = [];
    }
};
// Represents an axis-aligned rectangle
function Rectangle(corner, width, height) {
    this.corner = corner;
    this.width = width;
    this.height = height;
}

Object.defineProperty(Rectangle.prototype, 'otherCorner', {
    get: function() { return new Vector2d(this.corner.x + this.width, this.corner.y + this.height); },
    set: function(value) {
        var diff = value.sub(this.corner);
        if (diff.x < 0) this.corner.x = value.x;
        if (diff.y < 0) this.corner.y = value.y;
        this.width = Math.abs(diff.x);
        this.height = Math.abs(diff.y);
    },
    enumerable: true
});

Object.defineProperty(Rectangle.prototype, 'center', {
    get: function() { return new Vector2d(this.corner.x + this.width / 2, this.corner.y + this.height/2); },
    set: function(value) {
        this.corner.x = value.x - this.width / 2;
        this.corner.y = value.y - this.height / 2;
    },
    enumerable: true
});

// Returns true/false whether a point is within the bounds of the rectangle
Rectangle.prototype.hitTest = function(point) {
    return
        this.corner.x <= point.x && point.x <= this.otherCorner.x &&
        this.corner.y <= point.y && point.y <= this.otherCorner.y;
};


// Checks for rectangles overlapping or touching
Rectangle.prototype.intersects = function(rectangle) {
    var a = this, b = rectangle;
    if (Math.max(a.corner.x, b.corner.x) <= Math.min(a.otherCorner.x, b.otherCorner.y)) {
        if (Math.max(a.corner.y, b.corner.y) <= Math.min(a.otherCorner.y, b.otherCorner.y)) {
            return true;
        }
    }
    return false;
};

// Constructs a new Rectangle which represents the area covered by
// two rectangles
Rectangle.prototype.intersect = function(rectangle) {
    if (this.intersects(rectangle)) {
        return new Rectangle(
            new Vector2d(Math.max(this.corner.x, rectangle.corner.x), Math.max(this.corner.y, rectangle.corner.y)),
            Math.min(this.otherCorner.x, rectangle.otherCorner.x) - this.otherCorner.x,
            Math.min(this.otherCorner.y, rectangle.otherCorner.y) - this.otherCorner.y
        );
    }
    return null;
};

// Returns true if `this` is completely within another triangle
// (the intersection of both rectangles is equal to `this`).
Rectangle.prototype.isContainedBy = function(rectangle) {
    return
        rectangle.hitTest(this.corner) &&
        rectangle.hitTest(this.corner.add(new Vector2d(this.width, this.height)));
};

// Interpolates two rectangles using the t parameter (t in [0, 1])
Rectangle.prototype.blend = function(target, t) {
    return new this.constructor(
        this.corner.sub(target.corner).scale(t).add(this.corner),
        this.width * (1-t) + target.width * t,
        this.height * (1-t) + target.height + t
    );
};
// Represents a 2D vector
function Vector2d(x, y) {
    this.x = x;
    this.y = y;
}

Object.defineProperty(Vector2d.prototype, 'length', {
    get        : function() { return Math.sqrt(this.x * this.x + this.y * this.y); },
    enumerable : true
});

Vector2d.prototype.add = function(v) {
    if (v instanceof this.constructor)
        return new this.constructor(this.x + v.x, this.y + v.y);
    else
        return new this.constructor(this.x + v, this.y + v);
};

Vector2d.prototype.sub = function(v) {
    if (v instanceof this.constructor)
        return this.add(v.neg());
    else
        return this.add(-v);
};

Vector2d.prototype.neg = function() {
    return new this.constructor(-this.x, -this.y);
};

Vector2d.prototype.scale = function(s) {
    return new this.constructor(this.x * s, this.y * s);
};

Vector2d.prototype.dot = function(v) {
    return this.x * v.x + this.y * v.y;
};

Vector2d.prototype.towards = function(other) {
    return other.sub(this).normalize();
};

Vector2d.prototype.normalize = function() {
    return this.scale(1 / this.length);
};

Vector2d.random = function(unit) {
    var r = Math.random() * Math.PI * 2,
        d = unit ? 1 : Math.random();
    return new this(
        d * Math.cos(r),
        d * Math.sin(r)
    );
};

Vector2d.randomWithin = function(rectangle) {
    return new this(
        rectangle.corner.x + Math.random() * rectangle.width,
        rectangle.corner.y + Math.random() * rectangle.height
    );
};

Vector2d.prototype.rotate = function(r) {
    return new this.constructor(
        this.x * Math.cos(r) - this.y * Math.sin(r),
        this.x * Math.sin(r) + this.y * Math.cos(r)
    );
};

Vector2d.prototype.clone = function() {
    return new this.constructor(this.x, this.y);
};
// Represents a blob in the game world. Includes interaction
// behaviour, intersection calculations, equilibrium calculation
// and rendering.
function Blob(options) {
    this.position     = options.position;
    this.radius       = options.radius || 0;
    this.speed        = options.speed || new Vector2d(0, 0);
    this.rotationRate = Math.random() * 500 + 200;
    this.isPlayer     = options.isPlayer || false;
    this.rotation     = this.isPlayer ? 0 : (options.rotation || (Math.random() - 0.5) * 4 * Math.PI);
    this._name        = 'Blob #' + (this.constructor.counter++);
}

// Add the EventEmitter API
Common.extend(Blob.prototype, EventEmitter);

Blob.counter = 0;
Blob.thrust = {
    speed  : 80,
    radius : 0.02
};

Blob.getImage = function(url) {
    var i = new Image;
    i.src = url;
    return i;
};

Blob.images = {
    player    : Blob.getImage('assets/yellow.png'),
    smaller   : Blob.getImage('assets/blue.png'),
    bigger    : Blob.getImage('assets/red.png'),
    highlight : Blob.getImage('assets/highlight.png')
};

// Calculates mass based on radius (effectively the circle's area)
// m = π * r^2
Object.defineProperty(Blob.prototype, 'mass', {
    get        : function() { return Math.PI * this.radius * this.radius; },
    set        : function(value) { this.radius = Math.sqrt(value / Math.PI); },
    enumerable : true
});

// Calculates momentum based on mass and velocity
// p = m * v
Object.defineProperty(Blob.prototype, 'momentum', {
    get        : function() { return this.speed.scale(this.mass); },
    set        : function(value) { this.speed = value.scale(1 / this.mass); },
    enumerable : true
});

Blob.prototype.toString = function() { return this._name; };

// Returns the bounding box for this entity, useful for visibility checks
Blob.prototype.getBoundingBox = function() {
    return new Rectangle(new Vector2d(this.position.x - this.radius, this.position.y - this.radius), this.radius * 2, this.radius * 2);
};

// Checks whether this blob overlaps with another
Blob.prototype.intersectsWith = function(blob) {
    return this.radius + blob.radius > blob.position.sub(this.position).length;
};

// This blob completely absorbs another blob and adds its mass
// and momentum to `this`.
Blob.prototype.absorb = function(blob) {
    this.mass += blob.mass;
    this.momentum = this.momentum.add(blob.momentum);
    blob.emit('absorbed', this, blob);
    return this;
};

// When two blobs overlap, calculate mass and momentum transfer
// using equilibrium constraints.
Blob.prototype.slurp = function(blob) {
    // Calculate equilibrium radius for the blobs (mass is preserved
    // during transfer). Assuming `this` is the larger of the two
    // blobs.
    // The equlibrium solution is one of the roots of the following
    // system of equations:
    // 1. r'(a) + r'(b) = d
    // 2. m(a) + m(b) = m(a+b)
    var d = this.position.sub(blob.position).length,
        r = 0.5 * (d + Math.sqrt(2 * (this.radius * this.radius + blob.radius * blob.radius) - d * d)),
        deltaR = r - this.radius,
        mass = Math.PI * deltaR * deltaR;

    // If the solution to the equilibrium is a radius greater than
    // or equal to the distance between centres, the blob should be
    // completely absorbed.
    if (r >= d) {
        this.absorb(blob);
        return;
    }

    // Update both blobs to reflect the new equilibrium point
    this.radius = r;
    blob.radius = d - r;
    this.momentum = this.momentum.add(blob.momentum.scale(mass / blob.mass));
    this.emit('slurped', this, blob);
    return this;
};

// Squirts part of the blob's mass to propel the player blob
// in the opposite direction of `target`. Note that this calculation
// violates the conservation of momentum in the system, but has been
// implemented such that it more closely follows a user's intuitive
// expectations. A similar thrust would require shooting the squirt
// at much higher speeds than is depicted in this game. It's more fun
// this way.
Blob.prototype.squirt = function(target) {

        // Calculate the direction based on the player blob's position
        // and the clicked target
    var direction = this.position.sub(target).normalize().neg(),
        // Calculate the squirt's position outside of the player blob
        center = direction.scale(this.radius * 1.2).add(this.position),
        // The new radius according to the thrust parameters set on
        // the class properties
        radius = this.radius * (1 - this.constructor.thrust.radius),
        squirt = new Blob({
            position : center,
            speed    : direction.scale(this.constructor.thrust.speed * 4).add(this.speed)
        });

    // Set the squirt's mass to the 
    squirt.mass = Math.PI * (this.radius * this.radius - radius * radius);

    // Update the player blob
    this.radius = radius;
    this.speed = this.speed.add(direction.neg().scale(this.constructor.thrust.speed));
    this.emit('squirt', this, squirt);
    return this;
};

// Return true/false if an absorbtion or slurp happens during an
// intersection.
Blob.prototype.intersect = function(blob) {
    var bigger     = this.radius > blob.radius ? this : blob,
        smaller    = this.radius <= blob.radius ? this : blob,
        dist       = smaller.position.sub(bigger.position).length,
        intersects = false;

    if (dist <= bigger.radius) {
        bigger.absorb(smaller);
        intersects = true;
    } else if(dist < smaller.radius + bigger.radius) {
        bigger.slurp(smaller);
        intersects = true;
    }
    return intersects;
};

// Returns the appropriate image based on the type of the blob
// and its relationship to the player blob.
Blob.prototype.getBlobImage = function(playerBlob) {
    if (this.isPlayer) {
        return this.constructor.images.player;
    } else if (playerBlob && this.radius > playerBlob.radius) {
        return this.constructor.images.bigger;
    } else {
        return this.constructor.images.smaller;
    }
};

// Renders the current blob state within the context passed.
// Assumes the center of the blob is at (0,0).
Blob.prototype.render = function(ctx, playerBlob) {
    if (!this._currentRotation) this._currentRotation = 0;
    this._currentRotation = Math.sin(+new Date / this.rotationRate) * Math.PI / 4 + this.rotation;

    var img = this.getBlobImage(playerBlob),
        highlight = this.constructor.images.highlight;

    // We draw the body of the blob rotated by the current rotation
    ctx.rotate(this._currentRotation);
    ctx.drawImage(img, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
    // ...but we keep the highlight fixed so that it appears to always
    // reflect a fixed light source
    ctx.rotate(-this._currentRotation);
    ctx.globalAlpha = 0.5;
    ctx.drawImage(highlight, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
    ctx.globalAlpha = 1;
};
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
// The world represents the abstract state of all object within the
// game world and is responsible for handling objects, simulating
// physics and notifying the host process of events relevant to the
// game rules.
function World(options) {
    this.viewport         = options.viewport;
    this.extents          = options.extents;
    this.canvas           = options.canvas;
    this.ctx              = this.canvas.getContext('2d');
    this.blobs            = [];
    this.particleEmitters = [];
    this.backgroundEl     = options.backgroundEl;
    
    this.timeMultiplier   = 1;

    var self = this;
    this.constructor.boundFunctions.forEach(function(fn) {
        self[fn] = Common.bind(self, self[fn]);
    });

    this.canvas.addEventListener('mousedown', this.handleMouseDown);
}

// Adds the EventEmitter API
Common.extend(World.prototype, EventEmitter);

// List of functions to be automatically bound to the world instance
World.boundFunctions = [
    'handleBlobAbsorbed', 'handleBlobSlurped', 'handleBlobSquirt',
    'handleMouseDown'
];

// Resets the world to a blank state
World.prototype.reset = function() {
    var self = this;
    setTimeout(function() {
        self.ctx.restore();
        self.clearBlobs();
        self.clearParticleEmitters();
        self.timeMultiplier = 1;
        self.clear();
    }, 0);
};

// Add a blob to the world and registers listeners for
// events that need to be handled by the world.
World.prototype.addBlob = function(blob) {
    blob.on('absorbed', this.handleBlobAbsorbed);
    blob.on('slurped', this.handleBlobSlurped);
    blob.on('squirt', this.handleBlobSquirt);
    this.blobs.push(blob);
};

// Removes a particular blob from the world
World.prototype.removeBlob = function(blob) {
    this.blobs = this.blobs.filter(function(b) { return b != blob; });
};

// Clears all blobs from the world
World.prototype.clearBlobs = function() {
    this.blobs = [];
};

// Filters the blobs array for player blobs
World.prototype.getPlayerBlobs = function() {
    return this.blobs.filter(function(b) {
        return b.isPlayer;
    });
};

// Handles all blob absorbtions and checks to see if the
// absorbed blob was a player blob. In this case, it emits
// a `playerDied` event, else it forwards an `absorbed` event
// to let the host process know.
World.prototype.handleBlobAbsorbed = function(eater, eaten) {
    this.removeBlob(eaten);
    if (eaten.isPlayer) this.emit('playerDied');
    else this.emit('absorbed', eater, eaten);
};

// Creates a particle emitter each time a blob slurps a chunk
// from another blob.
World.prototype.handleBlobSlurped = function(eater, eaten) {
    var self      = this,
        position  = eater.position.add(eater.position.towards(eaten.position).scale(eater.radius)),
        screenPos = this.mapWorldToScreen(position),
        emitter   = new ParticleEmitter({
            lifetime  : 1000,
            position  : screenPos,
            ctx       : this.ctx,
            direction : eater.position.towards(eaten.position).rotate(Math.PI / 2)
        });

    this.addParticleEmitter(emitter);
    emitter.start();
};

// Creates a particle emitter each time a player blob emits a
// `squirted` event. It also emits the event to any of the
// world's listeners (game loop or host process).
World.prototype.handleBlobSquirt = function(squirter, squirt) {
    this.addBlob(squirt);
    var squirtPos = this.mapWorldToScreen(squirt.position),
        emitter = new ParticleEmitter({
            lifetime  : 1000,
            position  : squirtPos,
            ctx       : this.ctx,
            direction : squirter.position.towards(squirt.position),
            mirrored  : false
        });

    this.addParticleEmitter(emitter);
    emitter.start();
    this.emit('squirted', squirter, squirt);
};

// Add a particle emitter to the world and register the 
// `dead` event to remove it after it's done emitting.
World.prototype.addParticleEmitter = function(emitter) {
    var self = this;
    this.particleEmitters.push(emitter);
    emitter.on('dead', function(em) {
        self.removeParticleEmitter(em);
    });
};

// Remove a particular particle emitter from the collection
World.prototype.removeParticleEmitter = function(emitter) {
    this.particleEmitters = this.particleEmitters.filter(function(e) {
        return e != emitter;
    });
};

// Clears all particle emitters from the world
World.prototype.clearParticleEmitters = function() {
    this.particleEmitters = [];
};

// Handles mousedown to trigger squirts from player blobs
World.prototype.handleMouseDown = function(ev) {
    ev.preventDefault();
    var x = ev.pageX, y = ev.pageY,
        real = this.mapScreenToWorld(new Vector2d(x, y));

    this.getPlayerBlobs().forEach(function(blob) {
        blob.squirt(real);
    });
};

// Generates a random world of blobs, including the player
World.prototype.generate = function(options) {
    for (var i = 0; i < options.count; i++) {
        this.addBlob(new Blob({
            position : i == 0 ? this.extents.center.clone() : Vector2d.randomWithin(this.extents),
            radius   : i == 0 ? options.radius * 0.5 : options.radius * 0.1 + Math.random() * options.radius * 0.9,
            speed    : Vector2d.random().scale(options.speed),
            isPlayer : i == 0
        }));
    }
};

// Clears the canvas contents
World.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

// Loops through all world entity graphics and hands off the
// transformed context for the graphics to render.
World.prototype.draw = function() {

    var self = this,
        playerBlob = this.getPlayerBlobs()[0],
        // Calculate the scale for blobs transformed
        // from world to screen space
        scale = this.mapScalarToScreen(1);

    // Clear the stage for the current frame
    this.clear();
    
    // Loop through the blobs and render them
    this.blobs.forEach(function(blob) {
        // Calculate the blob's position on the screen
        var mapped = self.mapWorldToScreen(blob.position);

        // Skip rendering the blob if outside of the current viewport
        if (mapped.x < -blob.radius || mapped.x > self.canvas.width + blob.radius) return;
        if (mapped.y < -blob.radius || mapped.y > self.canvas.height + blob.radius) return;

        // Each blob gets passed a transformed context to render itself
        self.ctx.save();
        self.ctx.translate(mapped.x, mapped.y);
        self.ctx.scale(scale, scale);
        blob.render(self.ctx, playerBlob);
        self.ctx.restore();
    });

    // Loop through the particle emitters and hand off the untransformed
    // context (particle emitters use screen space rather than world space
    // to render).
    this.particleEmitters.forEach(function(emitter) {
        emitter.render(self.ctx);
    });

    // Map world extents into screen space and render a border around the
    // game world
    var a = this.mapWorldToScreen(this.extents.corner),
        b = this.mapWorldToScreen(this.extents.otherCorner);

    this.ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);

    var bgPosition = this.mapWorldToScreen(this.extents.corner);
    this.backgroundEl.style.backgroundPosition = bgPosition.x + 'px ' + bgPosition.y + 'px';
};

// Maps coordinates from the world coordinate system to screen
// coordinates based on `this.viewport`
World.prototype.mapWorldToScreen = function(v) {
    return new Vector2d(
        (v.x - this.viewport.corner.x) / (this.viewport.width) * this.canvas.width,
        (v.y - this.viewport.corner.y) / (this.viewport.height) * this.canvas.height
    );
};

// Maps coordinates from screen space back onto the world coordinates
World.prototype.mapScreenToWorld = function(v) {
    return new Vector2d(
        (v.x / this.canvas.width) * this.viewport.width + this.viewport.corner.x,
        (v.y / this.canvas.height) * this.viewport.height + this.viewport.corner.y
    );
};

// Converts scalars to from world lengths to screen lengths
World.prototype.mapScalarToScreen = function(s) {
    return s / this.viewport.width * this.canvas.width;
};

// Updates the world state by stepping the physics simulation by the
// given step. Includes integrating the motion equations and updating
// blob intersections.
World.prototype.stepSimulation = function(dt) {
    var self = this;

    // update particle emitters
    this.particleEmitters.forEach(function(emitter) {
        emitter.tick(dt);
    });

    // integrate velocity to get updated positions
    this.blobs.forEach(function(blob) {

        blob.position = blob.position.add(blob.speed.scale(dt / 1000 * self.timeMultiplier));

        // flip the speed if out of bounds and heading outwards
        if (
            (blob.position.x - blob.radius < self.extents.corner.x && blob.speed.x < 0) ||
            (blob.position.x + blob.radius > self.extents.corner.x + self.extents.width && blob.speed.x > 0)
        ) {
            blob.speed.x *= -1;
        }

        if (
            (blob.position.y - blob.radius < self.extents.corner.y && blob.speed.y < 0) ||
            (blob.position.y + blob.radius > self.extents.corner.y + self.extents.height && blob.speed.y > 0)
        ) {
            blob.speed.y *= -1;
        }        
    });

    // Iterate over the set of all blob combinations
    // to find intersections and repeat the loop until
    // the whole loop runs without intersections, meaning
    // equilibrium has been reached.
    do {
        var intersectionsFound = false;
        for (var i = 0; i < this.blobs.length; i++) {
            for (var j = 0; j < this.blobs.length; j++) {
                // Skip checking for same blobs
                if (j == i) continue;
                // If a blob was slurped or absorbed, set the intersection flag to true
                if (this.blobs[i].intersect(this.blobs[j])) intersectionsFound = true;
            }
        }
    } while (intersectionsFound);

    // Update the viewport coordinates given the updated blob positions
    this.updateViewport();
};

// Makes the viewport follow the player
World.prototype.updateViewport = function() {
    var players = this.getPlayerBlobs(),
        player = players.length ? players[0] : false;

    if (player) {
        this.viewport.center = player.position;
    }
};
window.addEventListener('load', function() {
    var canvas    = document.querySelector('canvas');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    var Squirts = {
        game: new GameLoop({
            world: new World({
                canvas       : canvas,
                extents      : new Rectangle(new Vector2d(0, 0), 2000, 2000),
                viewport     : new Rectangle(new Vector2d(0, 0), canvas.width, canvas.height),
                backgroundEl : document.documentElement
            })
        })
    };

    Squirts.game.world.clear();

    var buttons = document.querySelectorAll('[data-action=startGame]');
    var startScreen = document.querySelector('#startScreen');
    var replayScreen = document.querySelector('#replayScreen');
    var score = document.querySelector('#score');

    for(var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function(e) {
            e.preventDefault();

            if (Squirts.game.running) {
                Squirts.game.stop();
            }

            Squirts.game.world.generate({
                count  : 160,
                radius : 20,
                speed  : 80
            });

            Squirts.game.start();
            score.style.display = 'block';
            startScreen.style.display = 'none';
            replayScreen.style.display = 'none';
        }, false);
    }

    // Listen for the `playerDied` event to show the end screen
    Squirts.game.world.on('playerDied', function() {
        Squirts.game.stop();
        replayScreen.style.display = 'block';
        score.style.display = 'none';
    });

    // If any blob gets absorbed, we need to update the scoreboard
    Squirts.game.world.on('absorbed', function() {
        var blobs = Squirts.game.world.blobs.length - 1;
        score.querySelector('span').textContent = blobs;
        // If there are no more blobs (besides the player), we need
        // to show the end screen
        if (blobs <= 0) {
            Squirts.game.stop();
            replayScreen.style.display = 'block';
            score.style.display = 'none';     
        }
    });

    // If a player squirts a blob, it creates a new blob and we must
    // update the scoreboard
    Squirts.game.world.on('squirted', function() {
        score.querySelector('span').textContent = Squirts.game.world.blobs.length - 1;
    });

    // Handle time acceleration keys to slow down or speed up time
    // NOTE: this handler will be refactored into a separate Controller
    //       class that will issue commands to the game and the world.
    document.body.addEventListener('keydown', function(ev) {
        var key = String.fromCharCode(ev.keyCode);
        if (key.toLowerCase() == 'a') {
            Squirts.game.world.timeMultiplier = Math.max(0.125, Squirts.game.world.timeMultiplier / 2);
        } else if (key.toLowerCase() == 's') {
            Squirts.game.world.timeMultiplier = Math.min(8, Squirts.game.world.timeMultiplier * 2);
        }
    }, false);

    // Export the game
    this.Squirts = Squirts;

}, false);
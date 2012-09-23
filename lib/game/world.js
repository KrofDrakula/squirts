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
function World(options) {
    this.viewport         = options.viewport;
    this.extents          = options.extents;
    this.canvas           = options.canvas;
    this.ctx              = this.canvas.getContext('2d');
    this.blobs            = [];
    this.particleEmitters = [];
    
    this.timeMultiplier   = options.timeMultiplier || 1;

    var self = this;
    this.constructor.boundFunctions.forEach(function(fn) {
        self[fn] = Common.bind(self, self[fn]);
    });

    this.canvas.addEventListener('mousedown', this.handleMouseDown);
}

Common.extend(World.prototype, EventEmitter);

World.boundFunctions = [
    'handleBlobAbsorbed', 'handleBlobSlurped', 'handleBlobSquirt',
    'handleMouseDown'
];

World.prototype.reset = function() {
    this.canvas.getContext('2d').restore();
    this.clearBlobs();
    this.particleEmitters = [];
    this.clear();
};

World.prototype.addBlob = function(blob) {
    blob.on('absorbed', this.handleBlobAbsorbed);
    blob.on('slurped', this.handleBlobSlurped);
    blob.on('squirt', this.handleBlobSquirt);
    this.blobs.push(blob);
};

World.prototype.removeBlob = function(blob) {
    this.blobs = this.blobs.filter(function(b) { return b != blob; });
};

World.prototype.clearBlobs = function() {
    this.blobs = [];
};

World.prototype.getPlayerBlobs = function() {
    return this.blobs.filter(function(b) {
        return b.isPlayer;
    });
};

World.prototype.handleBlobAbsorbed = function(eater, eaten) {
    this.removeBlob(eaten);
    if (eaten.isPlayer) this.emit('playerDied');
};

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
};

World.prototype.addParticleEmitter = function(emitter) {
    var self = this;
    this.particleEmitters.push(emitter);
    emitter.on('dead', function(em) {
        self.particleEmitters = self.particleEmitters.filter(function(e) {
            return e != em;
        });
    });
}

World.prototype.handleMouseDown = function(ev) {
    ev.preventDefault();
    var x = ev.pageX, y = ev.pageY,
        real = this.mapScreenToWorld(new Vector2d(x, y));

    this.getPlayerBlobs().forEach(function(blob) {
        blob.squirt(real);
    });
};

World.prototype.generate = function(options) {
    for (var i = 0; i < options.count; i++) {
        this.addBlob(new Blob({
            position : Vector2d.randomWithin(this.extents),
            radius   : i == 0 ? options.radius * 0.5 : options.radius * 0.1 + Math.random() * options.radius * 0.9,
            speed    : Vector2d.random().scale(options.speed),
            isPlayer : false // i == 0
        }));
    }
};

World.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

World.prototype.draw = function() {
    var self = this,
        playerBlob = this.getPlayerBlobs()[0],
        scale = this.mapScalarToScreen(1);

    this.clear();
    
    this.blobs.forEach(function(blob) {
        var mapped = self.mapWorldToScreen(blob.position);
        if (mapped.x < -blob.radius || mapped.x > self.canvas.width + blob.radius) return;
        if (mapped.y < -blob.radius || mapped.y > self.canvas.height + blob.radius) return;
        self.ctx.save();
        self.ctx.translate(mapped.x, mapped.y);
        self.ctx.scale(scale);
        blob.render(self.ctx, playerBlob);
        self.ctx.restore();
    });

    this.particleEmitters.forEach(function(emitter) {
        emitter.render(self.ctx);
    });

    var a = this.mapWorldToScreen(this.extents.corner),
        b = this.mapWorldToScreen(this.extents.otherCorner);

    this.ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
};

World.prototype.mapWorldToScreen = function(v) {
    return new Vector2d(
        (v.x - this.viewport.corner.x) / (this.viewport.width) * this.canvas.width,
        (v.y - this.viewport.corner.y) / (this.viewport.height) * this.canvas.height
    );
};

World.prototype.mapScreenToWorld = function(v) {
    return new Vector2d(
        (v.x / this.canvas.width) * this.viewport.width + this.viewport.corner.x,
        (v.y / this.canvas.height) * this.viewport.height + this.viewport.corner.y
    );
};

World.prototype.mapScalarToScreen = function(s) {
    return s / this.viewport.width * this.canvas.width;
};

World.prototype.stepSimulation = function(dt) {
    var self = this;

    // update particle emitters
    this.particleEmitters.forEach(function(emitter) {
        emitter.tick(dt);
    });

    var g = (new Vector2d(0, 6)).scale(dt / 1000 * self.timeMultiplier);

    // integrate velocity to get updated positions
    this.blobs.forEach(function(blob) {
        blob.position = blob.position
            .add(blob.speed.scale(dt / 1000 * self.timeMultiplier));
        blob.speed = blob.speed.add(g);

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
    // to find intersections and repeat while there are
    // still any intersections to be found.
    do {
        var intersectionsFound = false;
        for (var i = 0; i < this.blobs.length; i++) {
            for (var j = 0; j < this.blobs.length; j++) {
                if (j == i) continue;
                if (this.blobs[i].intersect(this.blobs[j])) intersectionsFound = true;
            }
        }
    } while (intersectionsFound);

    this.updateViewport();
};

World.prototype.updateViewport = function() {
    var players = this.getPlayerBlobs(),
        player = players.length ? players[0] : false;

    if (player) {
        this.viewport.center = player.position;
    }
};

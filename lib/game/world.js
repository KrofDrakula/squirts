function World(options) {
    this.viewport = options.viewport;
    this.extents  = options.extents;
    this.canvas   = options.canvas;
    this.blobs    = [];

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
    if (eaten.isPlayer) {
        this.emit('playerDied');
    }
};

World.prototype.handleBlobSlurped = function(eater, eaten) {
};

World.prototype.handleBlobSquirt = function(squirt) {
    this.addBlob(squirt);
};

World.prototype.handleMouseDown = function(ev) {
    ev.preventDefault();
    var x = ev.pageX, y = ev.pageY,
        real = this.mapScreenToWorld(new Vector2d(x, y));

    this.getPlayerBlobs().forEach(function(blob) {
        blob.squirt(real);
    });
};

World.prototype.generate = function(options) {
    var minX = this.extents.corner.x + options.radius,
        maxX = this.extents.corner.x + this.extents.width - options.radius,
        minY = this.extents.corner.y + options.radius,
        maxY = this.extents.corner.y + this.extents.height - options.radius;

    for (var i = 0; i < options.count; i++) {
        this.addBlob(new Blob({
            position : new Vector2d(Math.random() * (maxX - minX) + minX, Math.random() * (maxY - minY) + minY),
            radius   : i == 0 ? options.radius * 0.5 : options.radius * 0.1 + Math.random() * options.radius * 0.9,
            speed    : new Vector2d((Math.random() - 0.5) * options.speed * 2, (Math.random() - 0.5) * options.speed * 2),
            isPlayer : i == 0
        }));
    }
};

World.prototype.clear = function() {
    var ctx = this.canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

World.prototype.draw = function() {
    var self = this,
        ctx = this.canvas.getContext('2d'),
        playerBlob = this.getPlayerBlobs()[0],
        scale = this.mapScalarToScreen(1);

    this.clear();
    
    this.blobs.forEach(function(blob) {
        var mapped = self.mapWorldToScreen(blob.position);
        ctx.save();
        ctx.translate(mapped.x, mapped.y);
        ctx.scale(scale);
        blob.render(ctx, playerBlob);
        ctx.restore();
    });
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
    dt /= 1000;

    // integrate velocity to get updated positions
    this.blobs.forEach(function(blob) {
        blob.position.x += blob.speed.x * dt;
        blob.position.y += blob.speed.y * dt;
    });

    // Iterate over the set of all blob combinations
    // to find intersections and repeat while there are
    // still any intersections to be found.
    do {
        var intersectionsFound = false;
        for (var i = 0; i < this.blobs.length - 1; i++) {
            var a = this.blobs[i];
            for (var j = 0; j < this.blobs.length - 1; j++) {
                if (j == i) break;
                var b = this.blobs[j];
                if (a.intersectsWith(b)) {
                    intersectionsFound = true;
                    a.intersect(b);
                }
            }
        }
    } while (intersectionsFound);

};
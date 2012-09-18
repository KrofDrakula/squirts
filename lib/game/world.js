function World(options) {
    this.viewport = options.viewport;
    this.extents  = options.extents;
    this.canvas   = options.canvas;
    this.blobs    = [];

    this.handleBlobAbsorbed = Common.bind(this, this.handleBlobAbsorbed);
    this.handleBlobSlurped = Common.bind(this, this.handleBlobSlurped);
}

World.prototype.addBlob = function(blob) {
    blob.on('absorbed', this.handleBlobAbsorbed);
    blob.on('slurped', this.handleBlobSlurped);
    this.blobs.push(blob);
};

World.prototype.removeBlob = function(blob) {
    this.blobs = this.blobs.filter(function(b) { return b != blob; });
};

World.prototype.addBlobs = function(objects) {
    var self = this;
    this.blobs.forEach(function(blob) {
        self.addBlob(blob);
    });
};

World.prototype.clearBlobs = function() {
    this.blobs = [];
};

World.prototype.handleBlobAbsorbed = function(eater, eaten) {
    this.removeBlob(eaten);
};

World.prototype.handleBlobSlurped = function(eater, eaten) {
};

World.prototype.generate = function(options) {
    var minX = this.extents.corner.x + options.radius,
        maxX = this.extents.corner.x + this.extents.width - options.radius,
        minY = this.extents.corner.y + options.radius,
        maxY = this.extents.corner.y + this.extents.height - options.radius;

    for (var i = 0; i < options.count; i++) {
        this.addBlob(new Blob({
            position : new Vector2d(Math.random() * (maxX - minX) + minX, Math.random() * (maxY - minY) + minY),
            radius   : options.radius * 0.1 + Math.random() * options.radius * 0.9,
            speed    : (new Vector2d(Math.random() - 0.5, Math.random() - 0.5)).scale(30)
        }));
    }
};

World.prototype.clear = function() {
    var ctx = this.canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

World.prototype.drawCircle = function(v, radius) {
    var ctx = this.canvas.getContext('2d');
    v = this.mapWorldToScreen(v);
    ctx.beginPath();
    ctx.arc(v.x, v.y, this.mapScalarToScreen(radius), 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
};

World.prototype.draw = function() {
    var ctx = this.canvas.getContext('2d');
    this.clear();
    ctx.fillStyle = 'red';
    for (var i = 0; i < this.blobs.length; i++) {
        this.drawCircle(this.blobs[i].position, this.blobs[i].radius);
    };
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
        for (var i = 0; i < this.blobs.length - 2; i++) {
            var a = this.blobs[i];
            for (var j = i + 1; j < this.blobs.length - 1; j++) {
                var b = this.blobs[j];
                if (a.intersectsWith(b)) {
                    intersectionsFound = true;
                    a.intersect(b);
                }
            }
        }
    } while (intersectionsFound);

};
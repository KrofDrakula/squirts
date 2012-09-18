function Blob(options) {
    this.position = options.position;
    this.radius   = options.radius;
    this.speed    = options.speed || new Vector2d(0, 0);
    this._name    = 'Blob #' + (this.constructor.counter++);
}

Blob.counter = 0;

Object.defineProperty(Blob.prototype, 'mass', {
    get        : function() { return Math.PI * this.radius * this.radius; },
    set        : function(value) { this.radius = Math.sqrt(value / Math.PI); },
    enumerable : true
});

Object.defineProperty(Blob.prototype, 'momentum', {
    get        : function() { return this.speed.scale(this.mass); },
    set        : function(value) { this.speed = value.scale(1 / this.mass); },
    enumerable : true
})

Common.extend(Blob.prototype, EventEmitter);

Blob.prototype.toString = function() { return this._name; };

Blob.prototype.getBoundingBox = function() {
    return new Rectangle(new Vector2d(this.position.x - this.radius, this.position.y - this.radius), this.radius * 2, this.radius * 2);
};

Blob.prototype.intersectsWith = function(blob) {
    return this.radius + blob.radius > blob.position.sub(this.position).length;
};

Blob.prototype.absorb = function(blob) {
    this.mass += blob.mass;
    this.momentum = this.momentum.add(blob.momentum);
    blob.emit('absorbed', this, blob);
};

Blob.prototype.slurp = function(blob) {
    // Calculate equilibrium radius for the blobs (mass is preserved
    // during transfer). Assuming `this` is the larger of the two
    // blobs.
    var d = this.position.sub(blob.position).length,
        r = 0.5 * (d + Math.sqrt(2 * (this.radius * this.radius + blob.radius * blob.radius) - d * d)),
        deltaR = r - this.radius,
        mass = Math.PI * deltaR * deltaR;

    if (r > d) {
        this.absorb(blob);
        return;
    }

    this.radius = r;
    blob.radius = d - r;
    this.momentum = this.momentum.add(blob.momentum.scale(mass / blob.mass));
    this.emit('slurped', this, blob);
};

Blob.prototype.intersect = function(blob) {
    var bigger  = this.radius > blob.radius ? this : blob,
        smaller = this.radius <= blob.radius ? this : blob,
        dist    = smaller.position.sub(bigger.position).length;

    if (dist <= bigger.radius) {
        bigger.absorb(smaller);
    } else {
        bigger.slurp(smaller);
    }
};
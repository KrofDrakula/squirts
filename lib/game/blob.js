function Blob(options) {
    this.position = options.position;
    this.radius   = options.radius;
    this.speed    = options.speed || new Vector2d(0, 0);
    this.rotation = options.rotation || (Math.random() - 0.5) * 4 * Math.PI;
    this.isPlayer = options.isPlayer || false;
    this._name    = 'Blob #' + (this.constructor.counter++);
}

Blob.counter = 0;
Blob.thrust = {
    speed  : 10,
    radius : 0.02
};

Blob.images = {
    player  : 'assets/yellow_body.png',
    smaller : 'assets/blue_body.png',
    bigger  : 'assets/red_body.png'
};

Blob.eyes = {
    player  : 'assets/yellow_eyes.png',
    smaller : 'assets/blue_eyes.png',
    bigger  : 'assets/red_eyes.png'
};

Blob.getImage = function(url) {
    var i = new Image;
    i.src = url;
    return i;
};

Object.defineProperty(Blob.prototype, 'mass', {
    get        : function() { return Math.PI * this.radius * this.radius; },
    set        : function(value) { this.radius = Math.sqrt(value / Math.PI); },
    enumerable : true
});

Object.defineProperty(Blob.prototype, 'momentum', {
    get        : function() { return this.speed.scale(this.mass); },
    set        : function(value) { this.speed = value.scale(1 / this.mass); },
    enumerable : true
});

Common.extend(Blob.prototype, EventEmitter);

Object.keys(Blob.images).forEach(function(key) {
    Blob.images[key] = Blob.getImage(Blob.images[key]);
});

Object.keys(Blob.eyes).forEach(function(key) {
    Blob.eyes[key] = Blob.getImage(Blob.eyes[key]);
});

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
    return this;
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
    return this;
};

Blob.prototype.squirt = function(target) {
    var direction = this.position.sub(target).normalize().neg(),
        center = direction.scale(this.radius).add(this.position),
        radius = this.radius * (1 - this.constructor.thrust.radius),
        squirt = new Blob({
            position : center,
            radius   : this.radius - radius,
            speed    : direction.scale(this.constructor.thrust.speed).add(this.speed)
        });

    this.radius = radius;
    this.speed = this.speed.add(direction.neg().scale(this.constructor.thrust.speed));
    this.emit('squirt', squirt);
    return this;
};

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

Blob.prototype.getBlobImage = function(type, playerBlob) {
    if (this.isPlayer) {
        return this.constructor[type].player;
    } else if (playerBlob && this.radius > playerBlob.radius) {
        return this.constructor[type].bigger;
    } else {
        return this.constructor[type].smaller;
    }
};

// Renders the current blob state within the context passed.
// Assumes the center of the blob is at (0,0).
Blob.prototype.render = function(ctx, playerBlob) {
    if (!this._currentRotation) this._currentRotation = 0;
    this._currentRotation = Math.sin(+new Date / 2000) * Math.PI / 4 + this.rotation;

    var img = this.getBlobImage('images', playerBlob);
    var eyes = this.getBlobImage('eyes', playerBlob);
    ctx.drawImage(img, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
    ctx.rotate(this._currentRotation);
    ctx.drawImage(eyes, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
};
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
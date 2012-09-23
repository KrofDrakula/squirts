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
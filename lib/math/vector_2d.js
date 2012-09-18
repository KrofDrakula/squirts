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

Vector2d.prototype.normalize = function() {
    return this.scale(1 / this.length);
};
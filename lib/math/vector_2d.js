function Vector2d(x, y) {
    this.x = x;
    this.y = y;
}

Vector2d.prototype.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector2d.prototype.add = function(v) {
    return new this.constructor(this.x + v.x, this.y + v.y);
};

Vector2d.prototype.sub = function(v) {
    return this.add(v.neg());
};

Vector2d.prototype.neg = function() {
    return new this.constructor(-this.x, -this.y);
};

Vector2d.prototype.dot = function(v) {
    return this.x * v.x + this.y * v.y;
};
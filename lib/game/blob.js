function Blob(options) {
    this.x      = options.x;
    this.y      = options.y;
    this.radius = options.radius;
}

Blob.prototype.getBoundingBox = function() {
    return new Rectangle(new Vector2d(this.x - this.radius, this.y - this.radius), this.radius * 2, this.radius * 2);
};
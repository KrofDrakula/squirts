function Rectangle(corner, width, height) {
    this.corner = corner;
    this.width = width;
    this.height = height;
}

Rectangle.prototype.hitTest = function(point) {
    return
        this.corner.x <= point.x && point.x <= this.corner.x + this.width &&
        this.corner.y <= point.y && point.y <= this.corner.y + this.height;
};

Rectangle.prototype.intersects = function(rectangle) {
    var a = this, b = rectangle;
    if (Math.max(a.corner.x, b.corner.x) <= Math.min(a.corner.x + a.width, b.corner.x + b.width)) {
        if (Math.max(a.corner.y, b.corner.y) <= Math.min(a.corner.y + a.height, b.corner.y + b.height)) {
            return true;
        }
    }
    return false;
};
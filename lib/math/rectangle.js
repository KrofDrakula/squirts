// Represents an axis-aligned rectangle
function Rectangle(corner, width, height) {
    this.corner = corner;
    this.width = width;
    this.height = height;
}

Object.defineProperty(Rectangle.prototype, 'otherCorner', {
    get: function() { return new Vector2d(this.corner.x + this.width, this.corner.y + this.height); },
    set: function(value) {
        var diff = value.sub(this.corner);
        if (diff.x < 0) this.corner.x = value.x;
        if (diff.y < 0) this.corner.y = value.y;
        this.width = Math.abs(diff.x);
        this.height = Math.abs(diff.y);
    },
    enumerable: true
});

Object.defineProperty(Rectangle.prototype, 'center', {
    get: function() { return new Vector2d(this.corner.x + this.width / 2, this.corner.y + this.height/2); },
    set: function(value) {
        this.corner.x = value.x - this.width / 2;
        this.corner.y = value.y - this.height / 2;
    },
    enumerable: true
});

// Returns true/false whether a point is within the bounds of the rectangle
Rectangle.prototype.hitTest = function(point) {
    return
        this.corner.x <= point.x && point.x <= this.otherCorner.x &&
        this.corner.y <= point.y && point.y <= this.otherCorner.y;
};


// Checks for rectangles overlapping or touching
Rectangle.prototype.intersects = function(rectangle) {
    var a = this, b = rectangle;
    if (Math.max(a.corner.x, b.corner.x) <= Math.min(a.otherCorner.x, b.otherCorner.y)) {
        if (Math.max(a.corner.y, b.corner.y) <= Math.min(a.otherCorner.y, b.otherCorner.y)) {
            return true;
        }
    }
    return false;
};

// Constructs a new Rectangle which represents the area covered by
// two rectangles
Rectangle.prototype.intersect = function(rectangle) {
    if (this.intersects(rectangle)) {
        return new Rectangle(
            new Vector2d(Math.max(this.corner.x, rectangle.corner.x), Math.max(this.corner.y, rectangle.corner.y)),
            Math.min(this.otherCorner.x, rectangle.otherCorner.x) - this.otherCorner.x,
            Math.min(this.otherCorner.y, rectangle.otherCorner.y) - this.otherCorner.y
        );
    }
    return null;
};

// Returns true if `this` is completely within another triangle
// (the intersection of both rectangles is equal to `this`).
Rectangle.prototype.isContainedBy = function(rectangle) {
    return
        rectangle.hitTest(this.corner) &&
        rectangle.hitTest(this.corner.add(new Vector2d(this.width, this.height)));
};

// Interpolates two rectangles using the t parameter (t in [0, 1])
Rectangle.prototype.blend = function(target, t) {
    return new this.constructor(
        this.corner.sub(target.corner).scale(t).add(this.corner),
        this.width * (1-t) + target.width * t,
        this.height * (1-t) + target.height + t
    );
};
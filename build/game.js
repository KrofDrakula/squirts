(function() {

    // http://www.jspatterns.com/classical-inheritance/
    function inherit(P, C) {
        var F = function(){};
        F.prototype = P.prototype;
        C.prototype = new F();
        C.uber = P.prototype;
        C.uberConstructor = C.prototype.uberConstructor = P;
        // convenience function for constructor inheritance
        C.prototype.super = function() {
            this.uberConstructor.apply(this, arguments);
        };
        C.prototype.constructor = C;
        extend(C, P);
    }

    function extend(obj) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            for (var name in source) if (source.hasOwnProperty(name))
                obj[name] = source[name];
        }
    }

    function bind(ctx, fn) {
        return function() {
            fn.apply(ctx, arguments);
        };
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function unescapeHtml(str) {
        return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    }

    this.Common = {
        inherit      : inherit,
        extend       : extend,
        bind         : bind,
        escapeHtml   : escapeHtml,
        unescapeHtml : unescapeHtml
    };

})();


// requestAnimationFrame implementation
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = 
            window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
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
function Blob(options) {
    this.x      = options.x;
    this.y      = options.y;
    this.radius = options.radius;
}

Blob.prototype.getBoundingBox = function() {
    return new Rectangle(new Vector2d(this.x - this.radius, this.y - this.radius), this.radius * 2, this.radius * 2);
};
function GameLoop(options) {
    this.world = options.world;
    this.tick = Common.bind(this, this.tick);
    this._lastUpdateTime = null;
    this._rafId = null;
}

GameLoop.prototype.start = function() {
    this.running = true;
    this.tick();
};

GameLoop.prototype.stop = function() {
    if (!this.running) return;

    if (this._rafId)
        cancelAnimationFrame(this._rafId);
    this._rafId = null;

    this.running = false;
}

GameLoop.prototype.tick = function() {
    this._rafId = requestAnimationFrame(this.tick);

    var currentTime = +new Date;
    if (this._lastUpdateTime == null)
        this._lastUpdateTime = +new Date;

    var elapsed = currentTime - this._lastUpdateTime;

    this.update(elapsed);
    this.draw();

    this._lastUpdateTime = currentTime;
};

GameLoop.prototype.update = function(elapsed) {
    this.world.stepSimulation(elapsed);
};

GameLoop.prototype.draw = function() {
    this.world.draw();
};
function World(options) {
    this.viewport = options.viewport;
    this.extents  = options.extents;
    this.canvas   = options.canvas;
    this.blobs    = [];
}

World.prototype.addBlob = function(blob) {
    this.blobs.push(blob);
};

World.prototype.removeBlob = function(blob) {
    this.blobs = this.blobs.filter(function(b) { return b !== blob; });
};

World.prototype.addBlobs = function(objects) {
    var self = this;
    this.blobs.forEach(function(blob) {
        self.addBlob(blob);
    });
};

World.prototype.clear = function() {
    var ctx = this.canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
}

World.prototype.draw = function() {
    var ctx = this.canvas.getContext('2d');
    this.clear();
    ctx.fillStyle = 'red';
    ctx.fillRect(Math.random()*1000, Math.random()*1000, Math.random()*1000, Math.random()*1000);
};

World.prototype.stepSimulation = function(dt) {
    
};
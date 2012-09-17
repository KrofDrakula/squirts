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
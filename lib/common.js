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

    // Copies properties to `obj` from other objects passed in arguments[1...]
    function extend(obj) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            for (var name in source) if (source.hasOwnProperty(name))
                obj[name] = source[name];
        }
    }

    // Binds a function to a context
    function bind(ctx, fn) {
        return function() {
            fn.apply(ctx, arguments);
        };
    }

    // Exports
    this.Common = {
        inherit : inherit,
        extend  : extend,
        bind    : bind
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

// The EventEmitter API
window.EventEmitter = {
    on : function(type, handler) {
        this._ensureEvent(type);
        this._events[type].push(handler);
    },
    off : function(type, handler) {
        if (this._events && this._events[type]) {
            this._events[type] = this._events[type].filter(function(h) {
                return h !== handler;
            });
        }
    },
    emit: function(type) {
        var args = Array.prototype.slice.call(arguments, 1);
        this._ensureEvent(type);
        this._events[type].forEach(function(handler) {
            handler.apply(this, args);
        });
    },
    _ensureEvent: function(type) {
        if (!this._events) this._events = {};
        if (!this._events[type]) this._events[type] = [];
    }
};
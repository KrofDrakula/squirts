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
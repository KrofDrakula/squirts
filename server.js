var static = require('node-static'),
    file = new(static.Server)('.');

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    });
}).listen(8000);
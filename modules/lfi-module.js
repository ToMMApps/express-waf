(function() {
    var fs = require('fs');
    var _patterns = [/\.\.\//];
    var _blocker;
    var _logger;
    var _routes = [];
    var _app;
    var _publicPath;
    var _config;

    function LFI(config, blocker, logger) {
        _app = config.appInstance;
        _config = config;
        _publicPath = config.publicPath;
        _blocker = blocker;
        _logger = logger;
    };

    LFI.prototype.check = function(req, res, cb) {
        var _validPattern = true;
        if (req.method === 'GET' || req.method === 'DELETE') {
            _validPattern = checkGetOrDeleteRequest(req, res, cb);
        }

        if(_validPattern) {
            checkPath();
        } else{
            _config.attack.handle(req, res);
        }

        function checkGetOrDeleteRequest(req, res, cb){
            var valid = true;
            var _url = req.url;
            _patterns.forEach(function(pattern) {
                if (pattern.test(_url)) {
                    valid = false;
                }
            });
            return valid;
        }

        function checkPath(){
            var validRoute = checkRoute(req.method);

            if(!validRoute){
                checkFileSystem(function (valid) {
                    if (!valid) {
                        _config.attack.handle(req, res);
                    } else if (cb) {
                        cb();
                    }
                });
            } else if (cb) {
                cb();
            }
        }

        function checkRoute(method){
            if (_routes.length == 0) {
                routeArrayForExpress4();
            }

            var valid = false;
            for (var i = 0; i < _routes.length; i++) {

                if (_routes[i].method === method && _routes[i].path === req.url.split('?')[0]) {
                    valid = true;
                    break;
                }
            }
            return valid;
        }

        function checkFileSystem(callback){
            fs.exists(_publicPath+req.originalUrl.split('?')[0],function(exists){
                callback(exists);
            });

        }

        /*
        function routeArrayForExpress3(){
            var routes = _app.get_router();

            _routes = [];
            for(var i in _app.routes) {
                for(var y in _app.routes[i]) {
                    _routes.push({
                        method: _app.routes[i][y].method.toUpperCase(),
                        path: _app.routes[i][y].path,
                        regexp: _app.routes[i][y].regexp.source
                    })

                }
            }
        }*/

        function routeArrayForExpress4(){
            _app._router.stack.forEach(function(a){
                var route = a.route;
                if(route){
                    route.stack.forEach(function(r){
                        if(r.method && route.path && r.regexp){
                            _routes.push({
                                method: r.method.toUpperCase(),
                                path: route.path,
                                regexp: r.regexp.source
                            });
                        }
                    });
                }
            });
        }
    };

    module.exports = LFI;
})();

(function() {

    var _config;
    var _patterns = [];
    var _blocker;
    var _logger;

    function XSSModule(config, blocker, logger) {
        _config = config;
        var _xemplar = require('xemplar');
        _patterns.push(_xemplar.security.xss.simple);
        _patterns.push(_xemplar.security.xss.img);
        _patterns.push(_xemplar.security.xss.paranoid);
        _patterns.push(/(\%22)(\%20)*[a-z0-9=\%22]*/i);
        _patterns.push(/" [a-z]*="/i)
        _blocker = blocker;
        _logger = logger;
    };

    XSSModule.prototype.check = function(req, res, cb) {
        var _host = _config.ipService(req);

        if (req.method === 'GET' || req.method === 'DELETE') {
            checkGetOrDeleteRequest(req, res, cb);
        } else if (req.method === 'POST' || req.method === 'PUT') {
            checkPostOrPutRequest(req, res, cb);
        }
        
        function checkPostOrPutRequest(req, res, cb) {
            var _keys;
            var _reqElement;

            if (req.body) {
                _keys = Object.keys(req.body);
                _keys.forEach(function (keyElement) {
                    _reqElement = req.body[keyElement];
                    //console.log(/" [a-z]*="/i.spec(_reqElement));
                    _patterns.forEach(function (pattern) {
                        if (pattern.test(_reqElement) && _blocker.blockHost) {
                            handleAttack(_host);
                        }
                    });
                });
            }
            if (cb) {
                cb();
            }
        }

        function checkGetOrDeleteRequest(req, res, cb) {
            var _url = req.url;
            _patterns.forEach(function(pattern) {
                if (pattern.test(_url) && _blocker.blockHost) {
                    handleAttack(_host);
                }
            });
            if (cb) {
                cb();
            }
        };

        function handleAttack(_host) {
            _blocker.blockHost(_host);
            _logger.logAttack('XSSAttack', _host);
            res.status(403).end();
        };
    };

    module.exports = XSSModule;

})();
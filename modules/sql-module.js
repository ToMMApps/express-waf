/**
 * Provides an SQL Injection protection against many kinds of attacks.
 */
(function() {
    var _config;
    var _patternSql  = [];
    var _blocker;
    var _logger;

    function SqlModule(config, blocker, logger) {
        _config = config;
        _blocker = blocker;
        _logger = logger;

        var _xemplar = require('xemplar');
        _patternSql.push(_xemplar.security.sql);
        //TODO (a big one) all these keywords could be packed in a better RegExp
        //_patternSql.push(/and/i); //TODO These keywords might appear in normal url
        //_patternSql.push(/or/i); //TODO These keywords might appear in normal url
        _patternSql.push(/SELECT/i);
        _patternSql.push(/UNION/i);
        _patternSql.push(/JOIN/i);
        _patternSql.push(/ORDER/i);
        _patternSql.push(/GROUP/i);
        _patternSql.push(/INSERT/i);
        //_patternSql.push(/UPDATE/i);
        _patternSql.push(/\/\*/i);
        _patternSql.push(/\*\//i);
        _patternSql.push(/--/i);
        _patternSql.push(/SUBSTRING/i);
        _patternSql.push(/SLEEP/i);
    }

    /**
     * Checks whether there is an SQL Injection Attack in the request.
     * Checks the url and the body.
     *
     * @param req request from host
     * @param res response to host
     * @param cb to get back to the app
     */
    SqlModule.prototype.check = function (req, res, cb) {
        if (req.method === 'GET' || req.method === 'DELETE') {
            checkGetOrDeleteRequest(req, res, cb);
        } else if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            checkPostOrPutOrPatchRequest(req, res, cb);
        }

        // TODO maybe add error handling for unknown request methods

        function checkPostOrPutOrPatchRequest(req, res, cb) {
            if (req.body) {
                for(var i in req.body) {
                    for(var j in _patternSql){
                        if (_patternSql[j].test(req.body[i]) && _blocker.blockHost) {
                            _config.attack.handle(req, res);
                            cb = undefined;
                            break;
                        }
                    }
                    if(!cb){
                        break;
                    }
                }
            }
            if (cb) {
                cb();
            }
        }

        function checkGetOrDeleteRequest(req, res, cb) {
            var _url = req.url;
            for(var i in _patternSql){
                if (_patternSql[i].test(_url)) {
                    _config.attack.handle(req, res);
                    cb = undefined;
                    break;
                }
            }
            if (cb) {
                cb();
            }
        }
    };

    module.exports = SqlModule;

})();
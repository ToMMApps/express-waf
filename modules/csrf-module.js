(function() {

    var _config;
    var _blocker;
    var _logger;

    function CSRF(config, blocker, logger) {
        _config = config;
        _blocker = blocker;
        _logger = logger;
    }

    /**
     * This method is default called method by express-waf
     * @param req
     * @param res
     * @param next
     */
    CSRF.prototype.check = function (req, res, next) {
        var _host = _config.ipService(req);
        var _referer = req.headers['referer'] || req.headers['x-referer'];

        //filters by allowed origins
        if (!filterByOrigin(req)) {
            handleAttack(_host,res);
            return;
        }

        //filters by referer independent urls
        if (filterByUrls(req.url)) {
            next();
            return;
        }

        //filters methods by configured blacklist or whitelist
        if (!filterByMethods(req)) {
            handleAttack(_host,res);
            return;
        }

        //allows everything that has no user-agent
        if (!req.headers['user-agent']) {
            next();
            return;
        }

        //allows everything that has no referer
        if (!_referer) {
            next();
            return;
        }

        //forbids the referer to be anything else than the host
        if (_referer && !new RegExp(_referer).test(req.headers.host) && !new RegExp(req.headers.host).test(_referer)) {
            handleAttack(_host,res);
            return;
        }

        next();
    };


    function filterByOrigin(req){
        //handle cors request
        if(_config.allowedOrigins && req.headers['origin']){
            if(_config.allowedOrigins.indexOf(req.headers['origin']) > -1){
                return true;
            } else return false;
        } else{
            return true;
        }
    }

    /**
     * This method checks by configured whitelist, if the url is in the list of allowed urls without a
     * referer in the header
     * @param url
     * @returns {boolean}
     */
    function filterByUrls(url) {
        if(_config.refererIndependentUrls) {
            var isRefererIndependend = false;
            for(var i in _config.refererIndependentUrls) {
                if(new RegExp(_config.refererIndependentUrls[i]).test(url.split('?')[0])) {
                    isRefererIndependend = true;
                    break;
                }
            }
            return isRefererIndependend;
        } else {
            return url === '/';
        }
    }

    /**
     * This Method checks by configured black or whitelist, if the REST-Method is allowed or not
     * If no black or whitelist exists it allows method by default
     * @param req
     * @returns {boolean}
     */
    function filterByMethods(req) {
        if(_config.allowedMethods) {
            return _config.allowedMethods.indexOf(req.method) > -1;
        } else if(_config.blockedMethods){
            return !(_config.blockedMethods.indexOf(req.method) > -1);
        } else {
            return true;
        }
    }

    /**
     * This Method handle attack by user
     * @param _host
     */
    function handleAttack(host, res) {
        _logger.logAttack('CSRF', host)
        _blocker.blockHost(host);
        res.status(403).end();
    }

    module.exports = CSRF;
})();
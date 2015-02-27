(function() {
    var _modules = [];
    var _blocker;
    var _logger;

    function ExpressWAF(blockerConfig) {
        var LoggerClass = require('./logger');
        var BlockerClass = require('./blocker');

        _logger = new LoggerClass();
        blockerConfig.ipService = getIP;
        _blocker = new BlockerClass(blockerConfig);
        _modules.push(_blocker);
    };

    ExpressWAF.prototype.addModule = function (moduleName, config, callback) {
        var FirewallModuleClass = require('./' + moduleName); //search for modules in this directory
        var firewallModule;
        config.ipService = getIP;

        if (FirewallModuleClass.prototype.check) {
            firewallModule = new FirewallModuleClass(config, _blocker, _logger);
            _modules.push(firewallModule);
        } else {
            callback(moduleName + ' does not define a check and an init function!');
        }
    };

    ExpressWAF.prototype.check = function (req, res, cb) {
        recursiveCall(0, function () {
            cb();
        });

        /**
         * This iterates over all modules and run on them function check
         * @param i {int} iterator
         * @param callback {function} Callback after iteration ended
         */
        function recursiveCall(i, callback) {
            if(i >= _modules.length) {
                callback();
            } else {
                _modules[i].check(req, res, function () {
                    recursiveCall(++i, callback);
                })
            }
        }
    };

    function getIP(req) {
        var ip = req.ip;
        //if ip starts with 127 try to find a not localhost url
        if(ip.indexOf('127') === 0) {
            ip = req.headers['x-client-ip'] || req.headers['x-forwarded-for'] || ip;
        }
        return ip;
    }

    module.exports.ExpressWAF = ExpressWAF;

    module.exports.MongoDBWrapper = require('./mongodbWrapper');
})();
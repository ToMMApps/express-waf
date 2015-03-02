(function() {
    var _modules = [];
    var _blocker;
    var _logger;

    function ExpressWAF(config) {
        var Logger = require('./logger');
        if(config.log === undefined){
            config.log = true;
        }
        _logger = new Logger(config.log);

        var Blocker = require('./blocker');
        config.blocker.ipService = ipService;
        _blocker = new Blocker(config.blocker, _logger);
    };

    ExpressWAF.prototype.addModule = function (moduleName, config, callback) {
        var FirewallModuleClass = require('./modules/' + moduleName); //search for modules in this directory
        var firewallModule;
        config.attack = new AttackHandler(moduleName);

        if (FirewallModuleClass.prototype.check) {
            firewallModule = new FirewallModuleClass(config, _blocker, _logger);
            _modules.push(firewallModule);
        } else {
            callback(moduleName + ' does not define a check and an init function!');
        }
    };

    ExpressWAF.prototype.check = function (req, res, cb) {
        _blocker.check(req, res, function(){
            recursiveCall(0, function () {
                cb();
            });
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

    /**
     * Removes any additional module from the firewall.
     */
    ExpressWAF.prototype.removeAll = function(cb){
        _modules = [_blocker];
        cb();
    };

    function ipService(req) {
        var ip = req.ip;
        //if ip starts with 127 try to find a not localhost url
        if(ip.indexOf('127') === 0) {
            ip = req.headers['x-client-ip'] || req.headers['x-forwarded-for'] || ip;
        }
        return ip;
    }

    function AttackHandler(module){
        this._module = module;

        this.handle = function(req, res){
            var _host = ipService(req);
            _logger.logAttack(this._module, _host);
            _blocker.blockHost(_host);
            res.status(403).end();
        }
    }



    module.exports.ExpressWAF = ExpressWAF;

})();
(function() {

    var _logger;
    var _enabled;

    function Logger(enabled) {
        var log4js = require('log4js');
        _logger = log4js.getLogger();
        _enabled = enabled;
    }

    Logger.prototype.logAttack = function(module, host) {
        if(_enabled){
            _logger.warn(module + ' detected attack from host ' + host);
        }
    };

    Logger.prototype.log = function(str) {
        if(_enabled){
            _logger.info(str);
        }
    };

    Logger.prototype.isEnabled = function(cb){
        cb(_enabled);
    };

    module.exports = Logger;

})();
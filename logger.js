(function() {

    var _logger;

    function Logger() {
        var log4js = require('log4js');
        _logger = log4js.getLogger();
    };

    Logger.prototype.logAttack = function(attackType, host) {
        _logger.warn('Attack: ' + attackType + ' detected from host: ' + host);
    };

    Logger.prototype.log = function(str) {
        _logger.info(str);
    }

    module.exports = Logger;

})();
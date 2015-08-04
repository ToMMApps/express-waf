/**
 * BlockMe is a service that adds clients to the block list which visit a specific url.
 * This service is meant to be used for testing purposes and nothing else!
 * Author: Henning Gerrits
 */

(function() {

    var _config;
    var _blocker;
    var _logger;

    function BlockMe(config, blocker, logger) {
        _config = config;
        _blocker = blocker;
        _logger = logger;
    }

    BlockMe.prototype.check = function(req, res, cb) {
        if(_config.url && req.url === _config.url){
            _config.attack.handle(req, res);
        }
        else cb();
    };

    module.exports = BlockMe;

})();
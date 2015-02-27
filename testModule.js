(function() {

    var _config;
    var _blocker;
    var _logger;

    function TestModule(config, blocker, logger) {
        _config = config;
        _blocker = blocker;
        _logger = logger;
    };

    TestModule.prototype.check = function(req, res, cb) {
        _logger.log('testAttack' + req.url);
        if (cb) {
            cb();
        }
    };

    module.exports = TestModule;

})();

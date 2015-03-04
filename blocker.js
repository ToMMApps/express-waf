(function() {

    var _config;
    var _logger;

    /**
     * The Blocker class realizes an IP blocklist that allows other modules to block attackers.
     * @param config must contain at least an object named db that must have an add, remove and contains function.
     * Furthermore it allow the user to specifiy a blockTime. If blockTime is not set, entries will never be removed
     * from Blocklist.
     * @constructor
     */
    function Blocker(config, logger) {

        //DB must define an add, remove and contains function!
        if(!(config.db && config.db.add && config.db.remove && config.db.contains)){
            throw "db must define an add, remove and contains function";
        };

        _config = config;
        _logger = logger;
    }

    /**
     * Adds a new ip to the Blocklist.
     */
    Blocker.prototype.blockHost = function(ip) {
        _config.db.add(ip, function(err){
            //removes this entry after an specific time
            if(_config.blockTime != undefined){  //check for undefined
                setTimeout(function(){
                    _config.db.remove(ip, function(){
                        _logger.log("removed host " + ip + " from blacklist after timeout");
                    });
                }, _config.blockTime)
            }
        });
    };

    /*
    Blocker.prototype.isHostBlocked = function(cb){
        var ip = _config.ipService(req);
        _config.db.contains(ip, function(isBlocked){
            cb(isBlocked);
        });
    };*/

    /**
     * Checks with the contains function if the request ip is on the Blocklist. If so
     * the callback won't be called.
     */
    Blocker.prototype.check = function(req, res, cb) {
        var ip = _config.ipService(req);
        _config.db.contains(ip, function(err, isBlocked){
            if(!isBlocked){
                cb();
            } else{
                res.status(403).send('Blocked');
            }
        })
    };


    module.exports = Blocker;

})();
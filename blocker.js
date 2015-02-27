(function() {

    var _config;

    /**
     * The Blocker class realizes an IP blocklist that allows other modules to block attackers.
     * @param config must contain at least an object named db that must have an add, remove and contains function.
     * Furthermore it allow the user to specifiy a blockTime. If blockTime is not set, entries will never be removed
     * from Blocklist.
     * @constructor
     */
    function Blocker(config) {

        //db must be configured
        if(!config.db){
            console.error("config has no member named db");
        }
        else{
            if(!config.db.add || !config.db.remove || !config.db.contains){
                console.error(config.db + "does not define an add, remove and/or contains function!");
            }
        }

        _config = config;
    }

    /**
     * Adds a new ip to the Blocklist.
     */
    Blocker.prototype.blockHost = function(ip, cb) {
        _config.db.add(ip, function(){
            //removes this entry after an specific time
            if(_config.blockTime != undefined){  //check for undefined
                setTimeout(function(){
                    _config.db.remove(ip, function(){
                    });
                }, _config.blockTime)
            }
            if(cb)
                cb();
        });
    };

    Blocker.prototype.isHostBlocked = function(cb){
        var ip = _config.ipService(req);
        _config.db.contains(ip, function(isBlocked){
            cb(isBlocked);
        });
    };

    /**
     * Checks with the contains function if the request ip is on the Blocklist. If so
     * the callback won't be called.
     */
    Blocker.prototype.check = function(req, res, cb) {
        var ip = _config.ipService(req);
        _config.db.contains(ip, function(isBlocked){
            if(!isBlocked){
                cb();
            }
            else{
                res.status(403).send('Blocked');
            }
        })
    };


    module.exports = Blocker;

})();
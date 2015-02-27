(function(){
    var _data = [];

    function TestDB(host, port, database, collection, username, password){
    }

    TestDB.prototype.open = function(cb){
        //do nothing
    };

    /**
     * Adds the ip to the Blocklist.
     */
    TestDB.prototype.add = function(ip, cb) {
        _data[_data.length] = ip;
        cb();
    };

    /**
     * Calls cb with true if the Blocklist contains the specified ip.
     */
    TestDB.prototype.contains = function(ip, cb) {
        cb(_data.indexOf(ip) > -1);
    };

    /**
     * Removes ip from Blocklist.
     */
    TestDB.prototype.remove = function(ip, cb) {
        var index = _data.indexOf(ip);

        if(index != -1){
            _data.splice(index, 1);
        }

        cb();
    };

    /**
     * Remove all hosts from blocklist.
     */
    TestDB.prototype.removeAll = function (cb) {
        _data = [];
        cb();
    };

    module.exports = TestDB;

})();
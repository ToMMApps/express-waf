/**
 * TestDB emulates a database for testing purposes.
 * Author: Henning Gerrits
 */

(function(){
    var _data = [];

    function EmulatedDB(){}

    EmulatedDB.prototype.open = function(cb){cb();};

    EmulatedDB.prototype.add = function(ip, cb) {
        if(_data.indexOf(ip) === -1){
            _data[_data.length] = ip;
        }

        if(cb){cb();}
    };

    EmulatedDB.prototype.contains = function(ip, cb) {
        cb(_data.indexOf(ip) > -1);
    };

    EmulatedDB.prototype.remove = function(ip, cb) {

        var index = _data.indexOf(ip);

        if(index !== -1){
            _data.splice(index, 1);
        }

        if(cb){cb();}
    };

    EmulatedDB.prototype.removeAll = function (cb) {
        _data = [];
        if(cb){cb();}
    };

    module.exports = EmulatedDB;
})();
/**
 * TestDB emulates a database for testing purposes.
 * Author: Henning Gerrits
 */

module.exports = function EmulatedDB(){
    this._data = [];

    this.add = function(ip,cb){
        if(this._data.indexOf(ip) === -1){
            this._data[this._data.length] = ip;
        }

        if(cb){cb();}
    };

    this.contains = function(ip,cb){
        cb(null, this._data.indexOf(ip) > -1);
    };

    this.remove = function(ip,cb){
        var index = this._data.indexOf(ip);

        if(index !== -1){
            this._data.splice(index, 1);
        }

        if(cb){cb();}
    };
};

(function(){

    var Db = require('mongodb').Db;
    var Server = require('mongodb').Server;

    var DEFAULT_COLLECTION_NAME = 'blocklist';

    var _self;
    var _collection;
    var _db;
    var _host;
    var _username;
    var _password;
    var _isOpen = false;


    /**
     * Wrapper class for MongoDB for use with the Blocker modules.
     * Host and port specify on which computer MongoDB is running.
     * @param host Host of the database which shall be used for the Blocklist.
     * @param port Number of the port which shall be used for the Blocklist.
     * @param database Name of the database which shall be used for the Blocklist.
     * @param collection Name of the collection that shall be used for the Blocklist.
     * @param username optional parameter for username to connect to database.
     * @param password optional parameter for password to connect to database.
     * @attention This class is permanently holding a connection to the database.
     */
    function MongoDB(host, port, database, collection, username, password){
        _self = this;

        if(arguments < 3){
            throw ("MongoDB constructor requires at least three arguments!");
        }

        if(collection){
            _collection = collection;
        } else{
            _collection = DEFAULT_COLLECTION_NAME;
        }

        _username = username;
        _password = password;

        _host = host;

        //create new database connection
        _db = new Db(database, new Server(host, port), {safe:false}, {auto_reconnect: true});
    }

    MongoDB.prototype.open = function(cb){

        if(_isOpen){
            cb(null);
        }
        else{
            _db.open(function(err, db){
                if(err){
                    cb(err);
                } else if(_username && _password) {
                    _db.authenticate(_username, _password, function (err) {
                        if(err){
                            cb(err);
                        } else {
                            _isOpen = true;
                            cb();
                        }
                    });
                } else {
                    _isOpen = true;
                    cb(null);
                }
            });
        }
    };

    /**
     * Gets the Blocklist collection from the MongoDB instance.
     */
    var _getBlockList = function(cb){

        if(!_isOpen){
            _self.open(function () {
                _self.removeAll(function() {
                    getCollection(cb);
                });
            });
        } else {
            getCollection(cb);
        }

        function getCollection(cb) {
            _db.collection(_collection, cb);
        }
    };

    /**
     * Adds the ip to the Blocklist.
     */
    MongoDB.prototype.add = function(ip, cb) {
        _getBlockList(function (err, blocklist) {
            if(err){
                cb(err);
            } else {
                blocklist.insert({ipEntry: ip}, cb);
            }
        });
    };

    /**
     * Calls cb with true if the Blocklist contains the specified ip.
     * Callback must have params err and item
     */
    MongoDB.prototype.contains = function(ip, cb) {
        _getBlockList(function (err,blocklist) {
            if(err){
                cb(err);
            } else {
                blocklist.findOne({ipEntry: ip}, cb);
            }
        });
    };

    /**
     * Removes ip from Blocklist.
     */
    MongoDB.prototype.remove = function(ip, cb) {
        _getBlockList(function (err, blocklist) {
            if(err){
                cb(err);
            } else{
                blocklist.remove({ipEntry: ip}, cb);
            }
        });
    };

    /**
     * Remove all hosts from blocklist.
     */
    MongoDB.prototype.removeAll = function (cb) {
        _getBlockList(function (err, blocklist) {
            if(err){
                cb(err);
            } else {
                blocklist.remove({}, cb);
            }
        })
    };

    MongoDB.prototype.close = function(cb){
        _db.close(cb);
    };

    module.exports = MongoDB;

})();
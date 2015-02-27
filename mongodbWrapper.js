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
     * Wrapper class for MongoDB for use with the Blocker module.
     * Host and port specify on which computer MongoDB is running.
     * @param host Host of the database which shall be used for the Blocklist.
     * @param port Number of the port which shall be used for the Blocklist.
     * @param database Name of the database which shall be used for the Blocklist.
     * @param collection Name of the collection that shall be used for the Blocklist.
     * @param username optional parameter for username to connect to database.
     * @param password optional parameter for password to connect to database.
     * @attention This class is permanently holding a connection to the database.
     */
    function MongoDBWrapper(host, port, database, collection, username, password){
        _self = this;

        if(arguments < 3){
            throw new Error("MongoDBWrapper constructor requires at least three arguments!");
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

    MongoDBWrapper.prototype.open = function(cb){

        if(_isOpen){
            console.log('Connection is already open!'); cb();
        }
        else{
            _db.open(function(err, db){
                if(err){
                    console.log('Could not open MongoDB on host: ' + _host);
                } else {
                    console.log('Successfully connected to MongoDB on host: ' + _host);
                }

                if(_username && _password) {
                    _db.authenticate(_username, _password, function (err, result) {
                        if(err) {
                            console.log('Could not authenticate on MongoDB');
                        } else {
                            console.log('Successfully authenticated to MongoDB');
                        }

                        _isOpen = true;
                        cb();
                    })
                } else {
                    _isOpen = true;
                    cb();
                }


            });
        }
    }

    /**
     * Gets the Blocklist collection from the MongoDB instance.
     */
    var _getBlockList = function(cb){

        if(!_isOpen){
            _self.open(function () {
                _self.removeAll(function() {
                    getCollection();
                });
            })
        } else {
            getCollection();
        }

        function getCollection() {
            _db.collection(_collection, function (err, blocklist) {
                if (err) {
                    console.log("Error while accessing collection: " + _collection);
                }
                else {
                    cb(blocklist);
                }
            });
        }
    }

    /**
     * Adds the ip to the Blocklist.
     */
    MongoDBWrapper.prototype.add = function(ip, cb) {
        _getBlockList(function (blocklist) {
            blocklist.insert({ipEntry: ip}, function (err) {
                if (err) {
                    console.log("Error while inserting: " + ip);
                } else {
                    console.log(ip + " successfully added to Blocklist");
                }

                cb();
            });
        });
    }

    /**
     * Calls cb with true if the Blocklist contains the specified ip.
     */
    MongoDBWrapper.prototype.contains = function(ip, cb) {
        _getBlockList(function (blocklist) {
            blocklist.findOne({ipEntry: ip}, function(err, item){
                if(err){
                    console.log("Error while accessing collection: " + _collection);
                } else{
                    cb(item != null);
                }
            });
        });
    }

    /**
     * Removes ip from Blocklist.
     */
    MongoDBWrapper.prototype.remove = function(ip, cb) {
        _getBlockList(function (blocklist) {
            blocklist.remove({ipEntry: ip}, function(err, records){
                if(err){
                    console.log("Error while removing " + ip + " from Blocklist");
                } else{
                    console.log("Removed " + ip + " from Blocklist on host " + _host);
                }

                cb();
            });
        });
    };

    /**
     * Remove all hosts from blocklist.
     */
    MongoDBWrapper.prototype.removeAll = function (cb) {
        _getBlockList(function (blocklist) {
            blocklist.remove({}, function (err) {
                if(err) {
                    console.log("Error while removing all hosts from Blocklist");
                } else {
                    console.log("Removed all Hosts from Blocklist")
                }
                if(cb)
                    cb();
            })
        })
    }

    module.exports = MongoDBWrapper;

})();
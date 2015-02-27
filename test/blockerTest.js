var MongoDBWrapper = require('./../mongodbWrapper');
var Blocker = require('./../blocker');

var mongodbwrapper = new MongoDBWrapper('localhost', 27017, 'blocklist', 'blocklist');
var _blockTime = 0;
var blocker = new Blocker({db: mongodbwrapper, blockTime: _blockTime});

exports.testMongoDBWrapper = function(test){

    test.expect(3);

    var ip = 'localhost';

    mongodbwrapper.open(function(err){
        test.equals(err, null, 'open should throw no error');
        mongodbwrapper.add(ip, function(){
            mongodbwrapper.contains(ip, function(isBlocked){
                test.equals(true, isBlocked, 'add an element to the blocklist');
                mongodbwrapper.remove(ip, function(){
                    mongodbwrapper.contains(ip, function(isBlocked){
                        test.equals(false, isBlocked, 'remove an element from the database');
                        test.done();
                    })
                });
            });
        });
    });
}


/**
 * Adds an ip to the Blocklist and calls the check-method with a request from this ip.
 */
exports.testCheck01 = function(test){

    test.expect(1);

    var _ip = 'localhost';

    blocker.blockHost(_ip, function(){

        var req = {ip: _ip};
        var res = {
            send: function () {
                test.done();
            },
            status: function(code) {
                test.equals(code, 403);
                return this;
            }
        };

        blocker.check(req, res);
    });
}

/**
 * Removes an ip from the Blocklist and calls the check method with a request from this ip.
 */
exports.testCheck02 = function(test){

    test.expect(0);

    var _ip = 'localhost';

    mongodbwrapper.remove(_ip, function(){
        var req = {ip: _ip};
        var res = {
            send: function () {
                test.equals(true, false);
            },
            status: function(code) {
                test.equals(true, false);
                return this;
            }
        };

        blocker.check(req, res, function(){
            test.done();
        });
    })
}

exports.testBlockTime = function(test){
    test.expect(0);

    mongodbwrapper.open(function(){
        var _ip = 'localhost';

        blocker.blockHost(_ip, function(){
            setTimeout(function(){

                var req = {ip: _ip};
                var res = {
                    send: function () {
                    test.equals(true, false);
                    },
                    status: function(code) {
                        test.equals(true, false);
                        return this;
                    }
                };

                blocker.check(req, res, function(){
                    test.done();
                });
            }, _blockTime + 5000);
        });
    });
}
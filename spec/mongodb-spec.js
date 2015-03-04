var port = process.env.port? process.env.port : 8080;
var server, mongodb, waf, request;

var blockme = function(cb){
    request.get("http://localhost:" + port + "/blockme", function(req, res){
        expect(res.statusCode).toEqual(403);
        cb();
    });
};

var isBlocked = function(cb){
    request.get("http://localhost:" + port, function(req, res){
        cb(res.statusCode === 403);
    });
};

var removeEntry = function(db, entry, cb){
    db.remove(entry, function(err){
        expect(err).toEqual(null);
        cb();
    });
};

var close = function(db, server, waf, cb){
    server.close(function(){
        db.removeAll(function(err){
            expect(err).toEqual(null);
            db.close(function(){
                waf.removeAll(cb);
            });
        });
    });
};

describe("mongodb", function(){

    it("should load properly", function(done){
        request = require('request');
        express = require('express');
        MongoDB = require('./../database/mongo-db');
        ExpressWaf = require('./../express-waf').ExpressWAF;
        mongodb = new MongoDB('localhost', 27017, 'blacklist', 'blacklist', 'expresswaf', 'pass');
        var app = express();
        waf = new ExpressWaf({
            blocker: {
                db: mongodb,
                blockTime: 1000
            },
            log: false
        });

        waf.addModule("blockme-module", {
            url: "/blockme"
        });

        app.use(waf.check);

        app.get('/', function(req, res) {
            res.status(200).end();
        });

        server = app.listen(port, done);
    });


    it("must open a connection", function(done){
        mongodb.open(function(err){
            expect(err).toEqual(null);
            done();
        });
    });

    it("must block an ip on the blacklist", function(done){
        blockme(function() {
            isBlocked(function (res) {
                expect(res).toEqual(true);

                removeEntry(mongodb, "127.0.0.1", done);
            });
        });
    });

    it("must not block an ip that is not on the blacklist", function(done){
        isBlocked(function(res){
            expect(res).toEqual(false);
            done();
        });
    });

    it("should close properly", function(done){
        close(mongodb, server, waf, done);
    });
});

describe("mongodb with invalid configuration", function(){

    it("should throw an error if the you use less than three arguments for the constructor", function(done){
        var MongoDB = require('./../database/mongo-db');
        try{
            var mongodb = new MongoDB();
        } catch(e){
            done();
        }
    });
});

describe("mongodb with default collection name", function(){
    var server, mongodb, request, waf;

    it("should load properly", function(done){
        request = require('request');
        express = require('express');
        MongoDB = require('./../database/mongo-db');
        mongodb = new MongoDB('localhost', 27017, 'blacklist');

        var app = express();

        waf = new ExpressWaf({
            blocker: {
                db: mongodb,
                blockTime: 1000
            },
            log: false
        });

        waf.addModule("blockme-module", {
            url: "/blockme"
        });

        app.use(waf.check);

        app.get('/', function(req, res) {
            res.status(200).end();
        });

        server = app.listen(port, done);
    });


    //skip open a connection

    it("must block an ip on the blacklist", function(done){
        blockme(function() {
            isBlocked(function (res) {
                expect(res).toEqual(true);

                removeEntry(mongodb, "127.0.0.1", done);
            });
        });
    });

    it("must not block an ip that is not on the blacklist", function(done){
        isBlocked(function(res){
            expect(res).toEqual(false);
            done();
        });
    });

    it("should close properly", function(done){
        close(mongodb, server, waf, done);
    });
});

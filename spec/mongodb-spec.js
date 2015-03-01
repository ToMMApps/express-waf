describe("mongodbwrapper", function(){
    var server, mongodbwrapper, request, waf;

    it("should load properly", function(done){
        request = require('request');
        var express = require('express');
        var MongoDBWrapper = require('./../database/mongo-db');
        mongodbwrapper = new MongoDBWrapper('localhost', 27017, 'blacklist', 'blacklist');

        var app = express();

        var ExpressWaf = require('./../express-waf').ExpressWAF;
        var BLOCK_TIME = 1000;
        waf = new ExpressWaf({
            db: mongodbwrapper,
            blockTime: BLOCK_TIME
        });

        waf.addModule("blockme-module", {
            url: "/blockme"
        });

        app.use(waf.check);

        app.get('/', function(req, res) {
            res.status(200).end();
        });

        app.get('/blockme', function(req, res) {
            res.status(200).end();
        });
        server = app.listen(8080, function(){
            done();
        });
    });

    it("must open a connection", function(done){
        mongodbwrapper.open(function(err){
            expect(err).toEqual(null);
            done();
        })
    });

    it("must block an ip on the blacklist", function(done){
        mongodbwrapper.open(function(){
            mongodbwrapper.add("127.0.0.1", function(){ //add entry to blacklist
                request.get("http://localhost:8080", function(err, res){
                    expect(res.statusCode).toEqual(403);
                    mongodbwrapper.remove("127.0.0.1", function(){  //remove entry from blacklist
                        done();
                    });
                });
            });
        });
    });

    it("must not block an ip that is not on the blacklist", function(done){
        request.get("http://localhost:8080", function(err, res){
            expect(res.statusCode).toEqual(200);
            done();
        });
    });

    it("should close properly", function(done){
        mongodbwrapper.removeAll(function(){
            mongodbwrapper.close(function(){
                waf.removeAll(function(){
                    server.close(function(){
                        done();
                    });
                });
            });
        });
    });
});


describe("blocker", function(){
    var server, emudb, BLOCK_TIME, request, waf, port;
    port = process.env.port? process.env.port : 8080;

    it("should load properly", function(done){
        request = require('request');
        var express = require('express');
        var app = express();

        var TestDB = require('./../database/emulated-db');
        emudb = new TestDB();

        var ExpressWaf = require('./../express-waf').ExpressWAF;

        BLOCK_TIME = 1000;
        waf = new ExpressWaf({
            blocker: {
                db: emudb,
                blockTime: BLOCK_TIME
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

        server = app.listen(port, function(){
            done();
        });
    });

    it("must block clients that visit blockme", function(done){
        request.get("http://localhost:" + port + "/blockme", function(err,res){
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function(){  //remove entry from blacklist
                done();
            });
        });
    });

    it("should throw an error when using an invalid db", function(done){
        var DB = function(){};
        var Blocker = require('./../blocker');

        try{

            var blocker = new Blocker({
                db: new DB(),
                blockTime: 1000
            });
        } catch(e){
            done();
        }
    });

    it("must block clients on the blacklist that visit other sites", function(done){
        request.get("http://localhost:" + port + "/blockme", function(err,res){ //add to blacklist
            request.get("http://localhost:" + port + "/", function(err, res){
                expect(res.statusCode).toEqual(403);
                emudb.remove("127.0.0.1", function(){  //remove entry from blacklist
                    done();
                });
            });
        });
    });

    it("must not block clients that are not on the blacklist", function(done){
        request.get("http://localhost:" + port, function(err,res){
            expect(res.statusCode).toEqual(200);
            done();
        });
    });

    it("must remove clients from the blacklist after blockTime", function(done){
        request.get("http://localhost:" + port + "/blockme", function(err,res) { //add to blacklist
            setTimeout(function(){
                request.get("http://localhost:" + port, function(err,res){
                    expect(res.statusCode).toEqual(200);
                    done();
                });
            }, BLOCK_TIME);
        });
    });

    it("should close properly", function(done){
        waf.removeAll(function(){
            server.close(function(){
                done();
            });
        });
    });
});

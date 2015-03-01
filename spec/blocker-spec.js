describe("blocker", function(){
    var server, testdb, BLOCK_TIME, request, waf;

    it("should load properly", function(done){
        request = require('request');
        var express = require('express');
        var app = express();

        var TestDB = require('./../database/emulated-db');
        testdb = new TestDB();

        var ExpressWaf = require('./../express-waf').ExpressWAF;

        BLOCK_TIME = 1000;
        waf = new ExpressWaf({
            db: testdb,
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

    it("must block clients that visit blockme", function(done){
        request.get("http://localhost:8080/blockme", function(err,res){
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function(){  //remove entry from blacklist
                done();
            });
        });
    });

    it("must block clients on the blacklist that visit other sites", function(done){
        request.get("http://localhost:8080/blockme", function(err,res){ //add to blacklist
            request.get("http://localhost:8080/", function(err, res){
                expect(res.statusCode).toEqual(403);
                testdb.remove("127.0.0.1", function(){  //remove entry from blacklist
                    done();
                });
            });
        });
    });

    it("must not block clients that are not on the blacklist", function(done){
        request.get("http://localhost:8080", function(err,res){
            expect(res.statusCode).toEqual(200);
            done();
        });
    });

    it("must remove clients from the blacklist after blockTime", function(done){
        request.get("http://localhost:8080/blockme", function(err,res) { //add to blacklist
            setTimeout(function(){
                request.get("http://localhost:8080", function(err,res){
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

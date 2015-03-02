describe("emudb", function(){
    var server, emudb, request, waf;

    it("should load properly", function(done){
        var EmulatedDB = require('./../database/emulated-db');
        emudb = new EmulatedDB();
        request = require('request');
        var express = require('express');

        var app = express();

        var ExpressWaf = require('./../express-waf').ExpressWAF;
        waf = new ExpressWaf({
            blocker: {
                db: emudb,
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

        app.get('/blockme', function(req, res) {
            res.status(200).end();
        });
        server = app.listen(8080, function(){
            done();
        });
    });

    it("must add an ip to the blacklist and remove it", function(done){
        request.get('http://localhost:8080/blockme', function(err, res){
            expect(res.statusCode).toEqual(403);
            emudb.contains("127.0.0.1", function(err, res){
                expect(res).toEqual(true);
                emudb.remove("127.0.0.1", function(){
                    emudb.contains("127.0.0.1", function(err, res){
                        expect(res).toEqual(false);
                        done();
                    });
                })
            });
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
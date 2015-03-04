describe("emudb", function(){
    var server, emudb, request, waf, port;
    if(process.env.port){
        port = process.env.port;
    } else {
        port = 8080;
    }

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

        server = app.listen(port, function(){
            done();
        });
    });

    it("must add an ip to the blacklist and remove it", function(done){
        request.get('http://localhost:' + port + '/blockme', function(err, res){
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
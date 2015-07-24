describe("https", function(){

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

        waf.addModule("https-redirect-module", {
            url: "/https"
        });

        app.use(waf.check);

        app.get('/', function(req, res) {
            res.status(200).end();
        });

        server = app.listen(port, function(){
            done();
        });
    });

    it("must redirect clients that visit https via http protocol", function(done){
        request.get("http://localhost:" + port + "/https", function(err,res){
            expect(res.statusCode).toEqual(200);
            // TODO write real test criteria
            done();
        });
    });

    it("must not redirect clients that visit https via https protocol", function(done){
        request.get("http://localhost:" + port + "/https", function(err,res){
            expect(res.statusCode).toEqual(200);
            // TODO write real test criteria
            done();
        });
    });

    it("must redirect clients that visit https on an openShift server", function(done){
        request.get("http://localhost:" + port + "/https", function(err,res){
            expect(res.statusCode).toEqual(200);
            // TODO write real test criteria
            done();
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
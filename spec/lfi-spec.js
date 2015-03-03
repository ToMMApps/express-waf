describe("lfi", function(){
    var server, emudb, request, waf, port;
    if(process.env.port){
        port = process.env.port;
    } else {
        port = 8080;
    }

    it("should load properly", function(done){
        request = require('request');
        var express = require('express');

        var EmulatedDB = require('./../database/emulated-db');
        emudb = new EmulatedDB();

        var app = express();

        var ExpressWaf = require('./../express-waf').ExpressWAF;
        var BLOCK_TIME = 1000;
        waf = new ExpressWaf({
            blocker: {
                db: emudb,
                blockTime: BLOCK_TIME
            },
            log: false
        });

        waf.addModule('lfi-module', {appInstance: app, publicPath: "./public"}, function(error) {
            console.log(error);
        });

        app.use(waf.check);
        app.use(express.static("./public"));

        app.get('/', function(req, res) {
            res.status(200).end();
        });

        app.get('/route', function(req, res) {
            res.status(200).end();
        });

        app.delete('/', function(req, res) {
            res.status(200).end();
        });

        app.post('/', function(req, res) {
            res.status(200).end();
        });

        app.put('/', function(req, res) {
            res.status(200).end();
        });

        server = app.listen(port, function(){
            done();
        });
    });

    it("testGetParentDirParam", function(done){
        request.get('http://localhost:' + port + '/spec?file="../../passwd"', function(err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function(){
                done();
            });
        });
    });

    it("testGetParentDir", function(done){
        request.get('http://localhost:' + port + '/../logger.js', function(err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function(){
                done();
            });
        });
    });

    it("testGetParentDir", function(done){
        request.get('http://localhost:' + port + '/subdir/../spec.html', function(err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function(){
                done();
            });
        });
    });

    it("testGetValidFile", function(done){
        request.get('http://localhost:' + port + '/test.html', function(err, res) {
            expect(res.statusCode).toEqual(200);
            done();
        });
    });

    it("testGetValidFile2", function(done){
        request.get('http://localhost:' + port + '/subdir/test.html', function(err, res) {
            expect(res.statusCode).toEqual(200);
            done();
        });
    });

    it("testGetUnknownFile", function(done){
        request.get('http://localhost:' + port + '/unknown.html', function(err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function(){
                done();
            });
        });
    });

    it("testGetUnknownFile2", function(done){
        request.get('http://localhost:' + port + '/subdir/unknown.html', function(err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function(){
                done();
            });
        });
    });

    it("testGetUnknownRoute", function(done){
        request.get('http://localhost:' + port + '/unknown', function(err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function(){
                done();
            });
        });
    });

    it("testGetUnknownRoute", function(done){
        request.get('http://localhost:' + port + '/unknown', function(err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function(){
                done();
            });
        });
    });

    it("testGetValidRoute", function(done){
        request.get('http://localhost:' + port + '/route', function(err, res) {
            expect(res.statusCode).toEqual(200);
            done();
        });
    });

    it("testPostValidRoute", function(done){
        request.post('http://localhost:' + port + '/route', function(err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function(){
                done();
            });
        });
    });

    it("testPostRoute", function(done){
        request.post('http://localhost:' + port + '/unknown', function(err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function(){
                done();
            });
        });
    });

    it("testPutValidRoute", function(done){
        request.put('http://localhost:' + port + '/route', function(err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function(){
                done();
            });
        });
    });

    it("testPutRoute", function(done){
        request.put('http://localhost:' + port + '/unknown', function(err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function(){
                done();
            });
        });
    });

    it("testDelParentDirParam", function(done){
        request.del('http://localhost:' + port + '/spec?file="../../passwd"', function(err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function(){
                done();
            });
        });
    });

    it("testDelParentDir", function(done){
        request.del('http://localhost:' + port + '/../logger.js', function(err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function(){
                done();
            });
        });
    });

    it("testDelParentDir2", function(done){
        request.del('http://localhost:' + port + '/subdir/../spec.html', function(err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function(){
                done();
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
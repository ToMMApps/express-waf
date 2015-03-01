describe("csrf", function(){
    var server, testdb, request, waf;

    it("should load properly", function(done){
        request = require('request');
        var express = require('express');
        var TestDB = require('./../database/emulated-db');
        testdb = new TestDB();

        var app = express();

        var ExpressWaf = require('./../express-waf').ExpressWAF;
        var BLOCK_TIME = 1000;
        waf = new ExpressWaf({
            db: testdb,
            blockTime: BLOCK_TIME
        });

        waf.addModule('csrf-module', {
            allowedMethods:['GET', 'POST'],
            refererIndependentUrls: ['/'],
            allowedOrigins: ['www.example.com']
        }, function (error) {

        });

        app.use(waf.check);

        app.get('/', function(req, res) {
            res.status(200).end();
        });
        app.get('/spec', function(req, res) {
            res.status(200).end();
        });
        app.post('/spec', function(req, res) {
            res.status(200).end();
        });
        app.put('/spec', function(req, res) {
            res.status(200).end();
        });

        server = app.listen(8080, function(){
            done();
        });
    });

    it("must not block referrer independent urls", function(done){
        request.get('http://localhost:8080', function (err, res) {
            expect(res.statusCode).toEqual(200);
            done();
        });
    });

    it("must allow everything that has no referrer", function(done){
        request.get('http://localhost:8080/spec', function (err, res) {
            expect(res.statusCode).toEqual(200);
            done();
        });
    });


    it("must allow a request with a referrer header", function(done){
        var headers = {
            'Referer': 'http://localhost:8080/'
        };
        request.get({
            url: 'http://localhost:8080/spec',
            headers: headers
        },function (err, res) {
            expect(res.statusCode).toEqual(200);
            done();
        });
    });

    it("must refuse a blacklisted method", function(done){
        var headers = {
            'Referer': 'http://localhost:8080/'
        };
        request.put({
            url: 'http://localhost:8080/spec',
            headers: headers
        }, function (err, res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function(){  //remove entry in blacklist
                done();
            });
        });
    });

    it("must allow a request with a referrer header and a not blacklisted method", function(done){
        var headers = {
            'Referer': 'http://localhost:8080/'
        };
        request.post({
            url: 'http://localhost:8080/spec',
            headers: headers
        }, function (err, res) {
            expect(res.statusCode).toEqual(200);
            done();
        });
    });

    it("must forbid a cors request with an unknown origin", function(done){
        var headers = {
            'Origin': 'www.evil.com'
        };
        request.get({
            url: 'http://localhost:8080',
            headers: headers
        }, function(err, res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function(){  //remove entry in blacklist
                done();
            });
        });
    });

    it("must allow a cors request with a known origin", function(done){
        var headers = {
            'Origin': 'www.example.com'
        };
        request.get({
            url: 'http://localhost:8080',
            headers: headers
        }, function(err, res) {
            expect(res.statusCode).toEqual(200);
            testdb.remove("127.0.0.1", function(){  //remove entry in blacklist
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
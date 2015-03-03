describe("csrf", function(){
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

        waf.addModule('csrf-module', {
            allowedMethods:['GET', 'POST'],
            refererIndependentUrls: ['/referer_independent'],
            allowedOrigins: ['www.example.com']
        }, function (error) {

        });

        app.use(waf.check);

        app.get('/', function(req, res) {
            res.status(200).end();
        });
        app.get('/referer_independent', function(req, res) {
            res.status(200).end();
        });
        app.get('/referer_dependent', function(req, res) {
            res.status(200).end();
        });
        app.put('/referer_dependent', function(req, res) {
            res.status(200).end();
        });
        app.put('/referer_independent', function(req, res) {
            res.status(200).end();
        });

        server = app.listen(port, function(){
            done();
        });
    });

    it("must not block referer independent urls", function(done){
        request.get('http://localhost:' + port + '/referer_independent', function (err, res) {
            expect(res.statusCode).toEqual(200);
            done();
        });
    });

    it("must allow everything that has no referer but has an user-agent entry", function(done){
        var _headers = {
          'User-Agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)'
        };
        request.get({
            url:'http://localhost:' + port + '/referer_dependent',
            headers: _headers
        }, function (err, res) {
            expect(res.statusCode).toEqual(200);
            done();
        });
    });

    it("must allow everything that has neither a referer nor an user-agent entry", function(done){
        request.get('http://localhost:' + port + '/referer_dependent', function (err, res) {
            expect(res.statusCode).toEqual(200);
            done();
        });
    });

    it("must forbid requests to an referer dependent url which have a referer that is not equal to the host", function(done){
        var _headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)',
            'Referer': 'evil.com'
        };
        request.get({
            url:'http://localhost:' + port + '/referer_dependent',
            headers: _headers
        }, function (err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function(){
                done();
            });
        });
    });

    it("must allow requests to an referer dependent url which have a referer that is equal to the host", function(done){
        var _headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)',
            'Referer': 'localhost'
        };
        request.get({
            url:'http://localhost:' + port + '/referer_dependent',
            headers: _headers
        }, function (err, res) {
            expect(res.statusCode).toEqual(200);
            done();
        });
    });

    it("must forbid a blacklisted method on referer dependent url", function(done){
        var _headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)',
            'Referer': 'localhost'
        };
        request.put({
            url:'http://localhost:' + port + '/referer_dependent',
            headers: _headers
        }, function (err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function(){
                done();
            });
        });
    });

    it("must allow a blacklisted method on a referer independent url", function(done){
        var _headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)',
            'Referer': 'localhost'
        };
        request.put({
            url:'http://localhost:' + port + '/referer_independent',
            headers: _headers
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
            url: 'http://localhost:' + port + '/referer_independent',
            headers: headers
        }, function(err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function(){  //remove entry in blacklist
                done();
            });
        });
    });

    it("must allow a cors request with a known origin", function(done){
        var headers = {
            'Origin': 'www.example.com'
        };
        request.get({
            url: 'http://localhost:' + port + '/referer_independent',
            headers: headers
        }, function(err, res) {
            expect(res.statusCode).toEqual(200);
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
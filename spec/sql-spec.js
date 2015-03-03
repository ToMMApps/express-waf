describe("sql", function(){
    var server, request, emudb, waf, port;
    if(process.env.port){
        port = process.env.port;
    } else {
        port = 8080;
    }

    it("should load properly", function(done){
        var express = require('express');
        request = require('request');

        var bodyParser = require('body-parser');

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

        waf.addModule('sql-module', {}, function(error) {
            console.log(error);
        });

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
            extended: true
        }));

        app.use(waf.check);
        app.use(express.static("./"));

        app.get('/', function(req, res) {
            res.status(200).end();
        });

        app.get('/spec', function(req, res) {
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

    it("testGetApostropheSqlInj", function(done){
        request.get('http://localhost:' + port +'/spec?user=\'').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetSimpleSqlInj", function(done){
        request.get('http://localhost:' + port +'/spec?user=\' or 1 = \'1').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetLogicSqlInjection", function(done){
        request.get('http://localhost:' + port +'/spec?user=1 or 1 = \'1\'').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    /* Removed from module because it may block valid urls
    it("testGetLogic2SqlInjection", function(done){
        request.get('http://localhost:' + port +'/spec?user=1 or 1 = (2-1)').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });
    */

    it("testGetCommentCrash1SqlInj", function(done){
        request.get('http://localhost:' + port +'/spec?user= --').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetUsual", function(done){
        request.get('http://localhost:' + port +'/').on('response', function(res) {
            expect(res.statusCode).toEqual(200);
            done();
        });
    });


    it("testGetCommentCrash2SqlInjection", function(done){
        request.get('http://localhost:' + port +'/spec?user=/*').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetCommentCrash3SqlInjection", function(done){
        request.get('http://localhost:' + port +'/spec?user=1;/*').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetMultipleQuerySqlInjection", function(done){
        request.get('http://localhost:' + port +'/spec?user=1; INSERT INTO users').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetUnionSqlInjection", function(done){
        request.get('http://localhost:' + port +'/spec?user=1 UNION ALL SELECT creditCardNr FROM table').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostSimpleSqlInj", function(done){
        request.post('http://localhost:' + port +'/spec', { form: { user: '1; INSERT INTO users' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostLogicSqlInjection", function(done){
        request.post('http://localhost:' + port +'/spec', { form: { user: '1 or 1 = \'1\'' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    /* Removed from module because it may block valid urls
    it("testPostLogic2SqlInjection", function(done){
        request.post('http://localhost:' + port +'/spec', { form: { user: '1 or 1 = (2-1)' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });*/

    it("testPostCommentCrash1SqlInj", function(done){
        request.post('http://localhost:' + port +'/spec', { form: { user: '--' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostCommentCrash2SqlInjection", function(done){
        request.post('http://localhost:' + port +'/spec', { form: { user: '/*' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostCommentCrash3SqlInjection", function(done){
        request.post('http://localhost:' + port +'/spec', { form: { user: '1;/*' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostMultipleQuerySqlInjection", function(done){
        request.post('http://localhost:' + port +'/spec', { form: { user: '1; INSERT INTO users' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostUnionSqlInjection", function(done){
        request.post('http://localhost:' + port +'/spec', { form: { user: '1; INSERT INTO users' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteApostropheSqlInj", function(done){
        request.del('http://localhost:' + port +'/spec?user=\'').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteSimpleSqlInj", function(done){
        request.del('http://localhost:' + port +'/spec?user=\' or 1 = \'1').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteLogicSqlInjection", function(done){
        request.del('http://localhost:' + port +'/spec?user=1 or 1 = \'1\'').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    /* Removed from module because it may block valid urls
    it("testDeleteLogic2SqlInjection", function(done){
        request.del('http://localhost:' + port +'/spec?user=1 or 1 = (2-1)').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });*/

    it("testDeleteCommentCrash1SqlInj", function(done){
        request.del('http://localhost:' + port +'/spec?user= --').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteCommentCrash2SqlInjection", function(done){
        request.del('http://localhost:' + port +'/spec?user=/*').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteCommentCrash3SqlInjection", function(done){
        request.del('http://localhost:' + port +'/spec?user=1;/*').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteMultipleQuerySqlInjection", function(done){
        request.del('http://localhost:' + port +'/spec?user=1; INSERT INTO users').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteUnionSqlInjection", function(done){
        request.del('http://localhost:' + port +'/spec?user=1 UNION ALL SELECT creditCardNr FROM table').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutSimpleSqlInj", function(done){
        request.put('http://localhost:' + port +'/spec', { form: { user: '1; INSERT INTO users' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutLogicSqlInjection", function(done){
        request.put('http://localhost:' + port +'/spec', { form: { user: '1 or 1 = \'1\'' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    /* Removed from module because it may block valid urls
    it("testPutLogic2SqlInjection", function(done){
        request.put('http://localhost:' + port +'/spec', { form: { user: '1 or 1 = (2-1)' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });*/

    it("testPutCommentCrash1SqlInj", function(done){
        request.put('http://localhost:' + port +'/spec', { form: { user: '--' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutCommentCrash2SqlInjection", function(done){
        request.put('http://localhost:' + port +'/spec', { form: { user: '/*' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutCommentCrash3SqlInjection", function(done){
        request.put('http://localhost:' + port +'/spec', { form: { user: '1;/*' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutMultipleQuerySqlInjection", function(done){
        request.put('http://localhost:' + port +'/spec', { form: { user: '1; INSERT INTO users' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutUnionSqlInjection", function(done){
        request.put('http://localhost:' + port +'/spec', { form: { user: '1; INSERT INTO users' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            emudb.remove("127.0.0.1", function () {
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
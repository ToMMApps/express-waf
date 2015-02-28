/**
 * Specifications for the SQL-Module.
 */

var express = require('express');
var request = require('request');

var bodyParser = require('body-parser');

var TestDB = require('./../database/emulated-db');
var testdb = new TestDB();

var app = express();

var ExpressWaf = require('./../express-waf').ExpressWAF;
var BLOCK_TIME = 1000;
var waf = new ExpressWaf({
    db: testdb,
    blockTime: BLOCK_TIME
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

var server = app.listen(8080);



describe("sql", function(){

    it("testGetApostropheSqlInj", function(done){
        request.get('http://localhost:8080/spec?user=\'').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetSimpleSqlInj", function(done){
        request.get('http://localhost:8080/spec?user=\' or 1 = \'1').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetLogicSqlInjection", function(done){
        request.get('http://localhost:8080/spec?user=1 or 1 = \'1\'').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetLogic2SqlInjection", function(done){
        request.get('http://localhost:8080/spec?user=1 or 1 = (2-1)').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetCommentCrash1SqlInj", function(done){
        request.get('http://localhost:8080/spec?user= --').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetCommentCrash2SqlInjection", function(done){
        request.get('http://localhost:8080/spec?user=/*').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetCommentCrash3SqlInjection", function(done){
        request.get('http://localhost:8080/spec?user=1;/*').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetMultipleQuerySqlInjection", function(done){
        request.get('http://localhost:8080/spec?user=1; INSERT INTO users').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testGetUnionSqlInjection", function(done){
        request.get('http://localhost:8080/spec?user=1 UNION ALL SELECT creditCardNr FROM table').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostSimpleSqlInj", function(done){
        request.post('http://localhost:8080/spec', { form: { user: '1; INSERT INTO users' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostLogicSqlInjection", function(done){
        request.post('http://localhost:8080/spec', { form: { user: '1 or 1 = \'1\'' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostLogic2SqlInjection", function(done){
        request.post('http://localhost:8080/spec', { form: { user: '1 or 1 = (2-1)' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostCommentCrash1SqlInj", function(done){
        request.post('http://localhost:8080/spec', { form: { user: '--' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostCommentCrash2SqlInjection", function(done){
        request.post('http://localhost:8080/spec', { form: { user: '/*' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostCommentCrash3SqlInjection", function(done){
        request.post('http://localhost:8080/spec', { form: { user: '1;/*' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostMultipleQuerySqlInjection", function(done){
        request.post('http://localhost:8080/spec', { form: { user: '1; INSERT INTO users' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPostUnionSqlInjection", function(done){
        request.post('http://localhost:8080/spec', { form: { user: '1; INSERT INTO users' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteApostropheSqlInj", function(done){
        request.del('http://localhost:8080/spec?user=\'').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteSimpleSqlInj", function(done){
        request.del('http://localhost:8080/spec?user=\' or 1 = \'1').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteLogicSqlInjection", function(done){
        request.del('http://localhost:8080/spec?user=1 or 1 = \'1\'').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteLogic2SqlInjection", function(done){
        request.del('http://localhost:8080/spec?user=1 or 1 = (2-1)').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteCommentCrash1SqlInj", function(done){
        request.del('http://localhost:8080/spec?user= --').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteCommentCrash2SqlInjection", function(done){
        request.del('http://localhost:8080/spec?user=/*').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteCommentCrash3SqlInjection", function(done){
        request.del('http://localhost:8080/spec?user=1;/*').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteMultipleQuerySqlInjection", function(done){
        request.del('http://localhost:8080/spec?user=1; INSERT INTO users').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testDeleteUnionSqlInjection", function(done){
        request.del('http://localhost:8080/spec?user=1 UNION ALL SELECT creditCardNr FROM table').on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutSimpleSqlInj", function(done){
        request.put('http://localhost:8080/spec', { form: { user: '1; INSERT INTO users' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutLogicSqlInjection", function(done){
        request.put('http://localhost:8080/spec', { form: { user: '1 or 1 = \'1\'' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutLogic2SqlInjection", function(done){
        request.put('http://localhost:8080/spec', { form: { user: '1 or 1 = (2-1)' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutCommentCrash1SqlInj", function(done){
        request.put('http://localhost:8080/spec', { form: { user: '--' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutCommentCrash2SqlInjection", function(done){
        request.put('http://localhost:8080/spec', { form: { user: '/*' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutCommentCrash3SqlInjection", function(done){
        request.put('http://localhost:8080/spec', { form: { user: '1;/*' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutMultipleQuerySqlInjection", function(done){
        request.put('http://localhost:8080/spec', { form: { user: '1; INSERT INTO users' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("testPutUnionSqlInjection", function(done){
        request.put('http://localhost:8080/spec', { form: { user: '1; INSERT INTO users' } }).on('response', function(res) {
            expect(res.statusCode).toEqual(403);
            testdb.remove("127.0.0.1", function () {
                done();
            });
        });
    });

    it("should close properly", function(done){
        server.close();
        done();
    });

});
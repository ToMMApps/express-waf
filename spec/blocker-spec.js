/**
 * Specifications for the Blocker.
 * The test makes use of the module blockme which adds a host to the blacklist.
 * Author: Henning Gerrits
 */

var express = require('express');
var request = require('request');

var TestDB = require('./../database/emulated-db');
var testdb = new TestDB();

var app = express();

var ExpressWaf = require('./../express-waf').ExpressWAF;
var BLOCK_TIME = 1000;
var waf = new ExpressWaf({
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

var server = app.listen(8080);

describe("blocker", function(){

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
        server.close();
        done();
    });
});

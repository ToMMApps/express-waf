/**
 * Specifications for the MongoDBWrapper.
 * This test requires an mongodb-instance running on the test environment!
 * Author: Henning Gerrits
 */

var express = require('express');
var request = require('request');

var MongoDBWrapper = require('./../database/mongo-db');
var mongodbwrapper = new MongoDBWrapper('localhost', 27017, 'blacklist', 'blacklist');

var app = express();

var ExpressWaf = require('./../express-waf').ExpressWAF;
var BLOCK_TIME = 1000;
var waf = new ExpressWaf({
    db: mongodbwrapper,
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

describe("mongodbwrapper", function(){

    it("must open a connection", function(done){
        mongodbwrapper.open(function(err){
            expect(err).toEqual(null);
            done();
        })
    });

    it("must block an ip on the blacklist", function(done){
        mongodbwrapper.open(function(){
            mongodbwrapper.add("127.0.0.1", function(){ //add entry to blacklist
                request.get("http://localhost:8080", function(err, res){
                    expect(res.statusCode).toEqual(403);
                    mongodbwrapper.remove("127.0.0.1", function(){  //remove entry from blacklist
                        done();
                    });
                });
            });
        });
    });

    it("must not block an ip that is not on the blacklist", function(done){
        request.get("http://localhost:8080", function(err, res){
            expect(res.statusCode).toEqual(200);
            done();
        });
    });

    it("should close properly", function(done){
        server.close();

        mongodbwrapper.removeAll(function(){
            mongodbwrapper.close(function(){
                done();
            });
        });
    });
});


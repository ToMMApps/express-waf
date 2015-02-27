var express = require('express');
var app = express();
var request = require('request');

var ExpressWAF = require('./../express-waf').ExpressWAF;
var TestDB = require('./../testDB');
var testDB = new TestDB();
var waf = new ExpressWAF({
    blockTime: 10,
    db: testDB
});

waf.addModule('./CSRF', {
    allowedMethods:['GET', 'POST'],
    refererIndependentUrls: ['/'],
    allowedOrigins: ['www.example.com']
}, function (error) {

});

app.use(waf.check);


app.get('/', function(req, res) {
    res.status(200).send('Hello World');
});
app.get('/test', function(req, res) {
    res.status(200).send('Hello World');
});
app.post('/test', function(req, res) {
    res.status(200).send('Hello World');
});
app.put('/test', function(req, res) {
    res.status(200).send('Hello World');
});

var server = app.listen(8080);


/**
 * This test checks, if the referer independent Urls, that not need a referer header works and the status code is 200
 * If not the independent urls were ignored in module
 * @param test
 */
exports.testRefererIndependentUrl = function(test) {
    request.get('http://localhost:8080', function (err, r) {
        test.equals(r.statusCode, 200, 'The referer independent Urls were ignored!');
        test.done();
    })
};

/**
 * Allow everything that has no referer ?! crazy...
 * @param test
 */
exports.textAllowedWithoutRefererInHeader = function (test) {
    request.get('http://localhost:8080/test', function (err, r) {
        test.equals(r.statusCode, 200, 'Requests without an referer should be allowed!');
        test.done();
    });
};

/**
 * This test checks, if a Request with a referer header is accepted
 * If not there is an Error in Check
 * @param test
 */
exports.testWithRefererInHeader = function (test) {
    var headers = {
        'Referer': 'http://localhost:8080/'
    };
    request.get({
        url: 'http://localhost:8080/test',
        headers: headers
    }, function (err, r) {
        test.equals(r.statusCode, 200, 'This URL is normally allowed, when sending a referer in header!');
        test.done();
    })
};

/**
 * This test checks, if a Request with a referer header and a blacklisted Method will be refused
 * If not the blacklist of Methods will be ignored
 * @param test
 */

exports.testNotAllowedMethod = function (test) {
    var headers = {
        'Referer': 'http://localhost:8080/'
    };
    request.put({
        url: 'http://localhost:8080/test',
        headers: headers
    }, function (err, r) {
        test.equals(r.statusCode, 403, 'This URL is normally not allowed, when sending a referer but method is blacklisted!');

        testDB.remove("127.0.0.1", function(){  //remove the block entry for the next test
            test.done();
        });
    });
};


/**
 * This test checks, if a Request with a referer header and a not blacklisted Method will be allowed
 * It not there is an error in check of blacklisted methods
 * @param test
 */

exports.testAllowedMethod = function (test) {
    var headers = {
        'Referer': 'http://localhost:8080/'
    };
    request.post({
        url: 'http://localhost:8080/test',
        headers: headers
    }, function (err, r) {
        test.equals(r.statusCode, 200, 'This URL is normally allowed, when sending a referer and a whitelisted method');
        test.done();
    });
};


exports.testForbiddendCorsRequest = function(test){
    var headers = {
        'Origin': 'www.evil.com'
    };
    request.get({
        url: 'http://localhost:8080',
        headers: headers
    }, function(err, r) {
        test.equal(r.statusCode, 403, 'This cors request should not be allowed');

        testDB.remove("127.0.0.1", function(){  //remove the block entry for the next test
            test.done();
        });
    });
};

exports.testAllowedCorsRequest = function(test){
    var headers = {
        'Origin': 'www.example.com'
    };
    request.get({
        url: 'http://localhost:8080',
        headers: headers
    }, function(err, r) {
        test.equal(r.statusCode, 200, 'This cors request should not be allowed');
        test.done();
    });
};

exports.closeServer = function (test) {
    server.close();
    test.done();
};
var request = require('request');
var express = require('express');
var app = express();
var ExpressWAF = require('./../express-waf');
var waf = new ExpressWAF({
    blockTime: 7200 * 1000
});

waf.addModule('./LFIModule', {appInstance: app, publicPath: "./test"}, function(error) {
    console.log(error);
});
app.use(waf.check)

app.use(express.static("./test"));

app.get('/', function(req, res) {
    res.status(200).end('Hello world!');
});

app.get('/route', function(req, res) {
    res.status(200).end('Hello world!');
});

app.delete('/', function(req, res) {
    res.status(200).end('Hello world!');
});

app.post('/', function(req, res) {
    res.status(200).end('Hello world!');
});
app.put('/', function(req, res) {
    res.status(200).end('Hello world!');
});

app.listen(8080);

exports.testGetParentDirParam = function(test) {
    test.expect(1);

    request.get('http://localhost:8080/test?file="../../passwd"').on('response', function(res) {
        test.equals(403, res.statusCode, 'An LFI get attack like: file="../../passwd" should return HTTP status code 403.');
        test.done();
    });
};

exports.testGetParentDir = function(test) {
    test.expect(1);

    request.get('http://localhost:8080/../logger.js').on('response', function(res) {
        test.equals(403, res.statusCode, 'An LFI get attack like: /test/../logger.js should return HTTP status code 403.');
        test.done();
    });
};

exports.testGetParentDir2 = function(test) {
    test.expect(1);

    request.get('http://localhost:8080/subDir/../test.html').on('response', function(res) {
        test.equals(403, res.statusCode, 'An LFI get attack like: subDir/../test.html should return HTTP status code 403.');
        test.done();
    });
};

exports.testGetValidFile = function(test) {
    test.expect(1);

    request.get('http://localhost:8080/test.html').on('response', function(res) {
        test.equals(200, res.statusCode, 'A usual get request to a existing file should return HTTP status code 200.');
        test.done();
    });
};

exports.testGetValidFile = function(test) {
    test.expect(1);

    request.get('http://localhost:8080/subDir/test2.html').on('response', function(res) {
        test.equals(200, res.statusCode, 'A usual get request to a existing file should return HTTP status code 200.');
        test.done();
    });
};

exports.testGetUnknownFile= function(test) {
    test.expect(1);

    request.get('http://localhost:8080/unknown.html').on('response', function(res) {
        test.equals(403, res.statusCode, 'An LFI get attack like: /unknown.html should return HTTP status code 403.');
        test.done();
    });
};

exports.testGetUnknownFile2= function(test) {
    test.expect(1);

    request.get('http://localhost:8080/subDir/unknown.html').on('response', function(res) {
        test.equals(403, res.statusCode, 'An LFI get attack like: /subDir/unknown.html should return HTTP status code 403.');
        test.done();
    });
};

exports.testGetUnknownRoute= function(test) {
    test.expect(1);

    request.get('http://localhost:8080/unknown').on('response', function(res) {
        test.equals(403, res.statusCode, 'An LFI get attack like: /unknown should return HTTP status code 403.');
        test.done();
    });
};

exports.testGetValidRoute= function(test) {
    test.expect(1);

    request.get('http://localhost:8080/route').on('response', function(res) {
        test.equals(200, res.statusCode, 'A usual get request to a valid route should return HTTP status code 200.');
        test.done();
    });
};

exports.testPostValidRoute = function(test) {
    test.expect(1);

    request.post('http://localhost:8080/route').on('response', function (res) {
        test.equals(403, res.statusCode, 'A usual get request to a valid route should return HTTP status code 200.');
        test.done();
    });
};

exports.testPostRoute = function(test) {
    test.expect(1);

    request.post('http://localhost:8080/unknown').on('response', function (res) {
        test.equals(403, res.statusCode, 'An LFI get attack like: /unknown should return HTTP status code 403.');
        test.done();
    });
};

exports.testPutValidRoute = function(test) {
    test.expect(1);

    request.put('http://localhost:8080/route').on('response', function (res) {
        test.equals(403, res.statusCode, 'A usual get request to a valid route should return HTTP status code 200.');
        test.done();
    });
};

exports.testPutRoute = function(test) {
    test.expect(1);

    request.put('http://localhost:8080/unknown').on('response', function (res) {
        test.equals(403, res.statusCode, 'An LFI get attack like: /unknown should return HTTP status code 403.');
        test.done();
    });
};

exports.testDelParentDirParam = function(test) {
    test.expect(1);

    request.del('http://localhost:8080/test?file="../../passwd"').on('response', function(res) {
        test.equals(403, res.statusCode, 'An LFI get attack like: file="../../passwd" should return HTTP status code 403.');
        test.done();
    });
};

exports.testDelParentDir = function(test) {
    test.expect(1);

    request.del('http://localhost:8080/../logger.js').on('response', function(res) {
        test.equals(403, res.statusCode, 'An LFI get attack like: /test/../logger.js should return HTTP status code 403.');
        test.done();
    });
};

exports.testDelParentDir2 = function(test) {
    test.expect(1);

    request.del('http://localhost:8080/subDir/../test.html').on('response', function(res) {
        test.equals(403, res.statusCode, 'An LFI get attack like: subDir/../test.html should return HTTP status code 403.');
        test.done();
    });
};
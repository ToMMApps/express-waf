var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var ExpressWAF = require('./express-waf').ExpressWAF;

var mongoDBWrapper = require('./express-waf').MongoDBWrapper;
var wrapper = new mongoDBWrapper('localhost', 27017, 'block', 'blocklist');
var waf = new ExpressWAF({
    db: wrapper,
    blockTime: 10
});

waf.addModule('testModule', {}, function(error) {
    console.log(error);
});
waf.addModule('XSSModule', {}, function(error) {
    console.log(error);
});
waf.addModule('LFIModule', {appInstance: app, publicPath: __dirname+"/test"}, function(error) {
    console.log(error);
});
waf.addModule('SqlModule', {}, function(error) {
    console.log(error);
});

waf.addModule('CSRF', {
    allowedMethods:['GET', 'POST'],
    refererIndependentUrls: ['^\\/\\/?$']
}, function (error) {
    console.log(error);
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(waf.check);

app.get('/', function(req, res) {
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
app.get('/users', function (req, res) {
    res.status(200).end('Hello world!');
})

app.listen(8080);

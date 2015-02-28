var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var ExpressWAF = require('./express-waf').ExpressWAF;

var mongoDBWrapper = require('./express-waf').MongoDBWrapper;
var wrapper = new mongoDBWrapper('localhost', 27017, 'block', 'blocklist');
var waf = new ExpressWAF({
    db: wrapper,
    blockTime: 10000
});


waf.addModule('xss-module', {}, function(error) {
    console.log(error);
});
waf.addModule('lfi-module', {appInstance: app, publicPath: "./public"}, function(error) {
    console.log(error);
});
waf.addModule('sql-module', {}, function(error) {
    console.log(error);
});

waf.addModule('csrf-module', {
    allowedMethods:['GET', 'POST'],
    refererIndependentUrls: ['/']
}, function (error) {
    console.log(error);
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(waf.check);
app.use(express.static("./public"));

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

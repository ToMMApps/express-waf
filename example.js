//init
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var ExpressWAF = require('./express-waf').ExpressWAF;

var EmulatedDB = require('./../database/emulated-db');
var emudb = new EmulatedDB();

//construct firewall with configuration options
//at least the database and the blacklist timeout have to be set
var waf = new ExpressWAF({
    db: emudb,
    blockTime: 10000
});

//add modules to the firewall
//name and configuration for the specific module have to be set
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
});

//body parser is necessary for some modules
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//add the configured firewall to your express environment
app.use(waf.check);
app.use(express.static("./public"));

//some example routes
app.get('/', function(req, res) {
    res.status(200).end('Hello world!');
});

app.listen(8080);

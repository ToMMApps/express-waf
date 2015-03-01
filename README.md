express-waf
===========

A small web application firewall for the NodeJS Express framework.

Usage
----------
The constructor expects the blacklist timeout (after that timeout the host will be removed from the blacklist) and
the used database for the blacklist as parameters.
In the folder "/database" you can find predefined database connectors. If you don't find the connector you need, you may
define your own database connector. This connector must define an add-, a remove- and a contains-function.
```
var waf = new ExpressWAF({
    db: emudb,
    blockTime: 10000
});
```

After that you can add additional modules to the firewall. Without these modules the firewall won't block
any attacks. The basic functionality only includes a blacklist for evil hosts and a logging mechanism for attacks.

Additional modules can be found in the folder "/modules". This includes, for example a module against SQL Injection attacks or
a module against CSRF attacks.

For example, this is how to add the CSRF module:
```
waf.addModule('csrf-module', {
    allowedMethods:['GET', 'POST'],
    refererIndependentUrls: ['/'],
    allowedOrigins: ['www.example.com']
}, function (error) {
    console.log(error);
});
```

Don't forget to finally add the check method of express-waf as middleware:
```
app.use(waf.check);
```
If you forget this step your firewall won't do anything!
This is it. Your firewall is now configured to be used with your node.js/express application.

Code-Quality
---------
All modules can be tested by using the jasmine-node testing framework:
```
jasmine-node spec/
```

Code coverage can be calculated with istanbul:
```
istanbul cover jasmine-node spec/
```
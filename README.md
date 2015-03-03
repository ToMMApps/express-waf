express-waf
===========

A small web application firewall for the NodeJS Express framework.

Installation
----------
```
npm install --save express-waf
```

Usage
----------
The constructor expects the configuration for the blocker and optional settings as parameters.
Blocker configuration includes:
- blockTime: A blacklist timeout which indicates the time after that entries from the blacklist will be removed.
- db: The used database for the blacklist. In the folder "/database" you can find predefined database connectors. If you don't find the connector you need, you may define your own database connector. This connector must define an add-, a remove- and a contains-function.
```
var ExpressWaf = require('express-waf');

var emudb = new ExpressWaf.EmulatedDB();
var waf = new ExpressWaf.ExpressWaf({
    blocker:{
        db: emudb,
        blockTime: 1000
    },
    log: true
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

List of Modules
---------

- csrf-module: https://www.owasp.org/index.php/CSRF
- lfi-module: https://www.owasp.org/index.php/Testing_for_Local_File_Inclusion
- sql-module: https://www.owasp.org/index.php/SQL_Injection
- xss-module: https://www.owasp.org/index.php/Cross-site_Scripting_%28XSS%29

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

Code-Quality
--------
Current jenkins report for this project:

- ![BuildStatus](http://jenkins.tomm-apps.de/buildStatus/icon?job=tommapps_express-waf)
- ![Test](http://jenkins.tomm-apps.de:3434/badge/tommapps_express-waf/test)
- ![LastBuild](http://jenkins.tomm-apps.de:3434/badge/tommapps_express-waf/lastbuild)
- ![Coverage](http://jenkins.tomm-apps.de:3434/badge/tommapps_express-waf/coverage)

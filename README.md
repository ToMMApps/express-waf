express-waf
===========

A small web application firewall for the NodeJS Express framework.

Usage
----------
A commented example how to configure and use the firewall with your node.js/express application is shown in "example.js".

Basic Functionality
---------
The basic functionality includes a blacklist for evil hosts and a logging mechanism for attacks.

Additional Modules
---------
This firewall is modularized. This means that you can add additional modules to the basic functionality.
Additional modules can be found in the folder "/modules". This includes, for example a module against SQL Injection attacks or
a module against CSRF attacks.

Testing
---------
All modules can be tested by using the jasmine-node testing framework.
For example, this will check the lfi-module:
```
jasmine-node spec/lfi-spec.js
```
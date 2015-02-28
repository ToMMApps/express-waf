/**
 * Main-file for the npm-paket manager.
 */

module.exports.ExpressWaf = require('./express-waf').ExpressWAF;
module.exports.EmulatedDB = require('./database/emulated-db');
module.exports.MongoDB = require('./database/mongo-db');
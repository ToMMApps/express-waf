describe("express-waf", function(){
    var ExpressWaf = require('./../express-waf').ExpressWAF;

    it("should throw an error when adding an invalid module", function(done){
        var EmulatedDB = require('./../database/emulated-db');
        var emudb = new EmulatedDB();

        var waf = new ExpressWaf({
            blocker: {
                db: emudb,
                blockTime: 1000
            },
            log: true
        });

        waf.addModule('invalid-module', {}, function(err){
            expect(!err).toEqual(false);
            done();
        });
    });

    it("should enable logging if requested", function(done){
        var EmulatedDB = require('./../database/emulated-db');
        var emudb = new EmulatedDB();

        var waf = new ExpressWaf({
            blocker: {
                db: emudb,
                blockTime: 1000
            },
            log: true
        });

        waf.isLoggingEnabled(function(res){
            expect(res).toEqual(true);
            done();
        });
    });

    it("should enable logging if not specified in constructor", function(done){
        var EmulatedDB = require('./../database/emulated-db');
        var emudb = new EmulatedDB();

        var waf = new ExpressWaf({
            blocker: {
                db: emudb,
                blockTime: 1000
            }
        });

        waf.isLoggingEnabled(function(res){
            expect(res).toEqual(true);
            done();
        });
    });
});
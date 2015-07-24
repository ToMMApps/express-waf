describe("https", function(){

    var HttpsModule = require('../modules/https-redirect-module');

    it("must redirect clients that visit httpstest via proxy and http protocol", function(done){
        var redirecter = new HttpsModule();

        var req = {
            headers: {
                'x-forwarded-proto': 'http'
            }
        };

        redirecter.check(req, {
            redirect: function(){
                expect(true).toBeTruthy();
                done();
            }
        }, function(){
            expect(false).toBeTruthy();
            done();
        });
    });

    it("must work for clients that visit httpstest via proxy and https protocol", function(done){
        var redirecter = new HttpsModule();

        var req = {
            headers: {
                'x-forwarded-proto': 'https'
            }
        };

        redirecter.check(req, {
            redirect: function(){
                expect(false).toBeTruthy();
                done();
            }
        }, function(){
            expect(true).toBeTruthy();
            done();
        });
    });

    it("must redirect clients that visit httpstest without proxy and https protocol", function(done){
        
        var redirecter = new HttpsModule();

        var req = {
            secure: true,
            headers: {}
        };

        redirecter.check(req, {
            redirect: function(){
                expect(true).toBeFalsy();
                done();
            }
        }, function(){
            expect(true).toBeTruthy();
            done();
        });
    });

    it("must redirect clients that visit httpstest without proxy and http protocol", function(done){
        var redirecter = new HttpsModule();

        var req = {
            secure: false,
            headers: {}
        };

        redirecter.check(req, {
            redirect: function(){
                expect(true).toBeTruthy();
                done();
            }
        }, function(){
            expect(true).toBeFalsy();
            done();
        });
    });
});
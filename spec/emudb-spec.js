describe("testdb", function(){
    var TestDB = require('./../database/emulated-db');
    var testdb = new TestDB();

    it("must add an ip to the blacklist", function(done){
        testdb.add("127.0.0.1", function(){
            testdb.contains("127.0.0.1", function(res){
                expect(res).toEqual(true);
                done();
            });
        });
    });

    it("must remove an ip from the blacklist", function(done){
        testdb.remove("127.0.0.1", function(){
            testdb.contains("127.0.0.1", function(res){
                expect(res).toEqual(false);
                done();
            });
        });
    });
});
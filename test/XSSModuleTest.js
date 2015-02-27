var request = require('request');

exports.testGetSimpleXSS = function(test) {
    test.expect(1);

    request.get('http://localhost:8080/test?user=<script>alert(123)</script>').on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS get attack like: <script>alert(123)</script> should return HTTP status code 403.');
        test.done();
    });
};

exports.testGetTagAttributeValue = function(test) {
    test.expect(1);

    request.get('http://localhost:8080/?user=" onfocus="alert(document.cookie)').on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS get attack like: " onfocus="alert(document.cookie) should return HTTP status code 403.');
        test.done();
    });
};

exports.testGetDifferentSyntaxOrEncoding_1 = function(test) {
    test.expect(1);

    request.get('http://localhost:8080/?user="><script >alert(document.cookie)</script >').on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS get attack like: ><script >alert(document.cookie)</script > should return HTTP status code 403.');
        test.done();
    });
};

exports.testGetDifferentSyntaxOrEncoding_2 = function(test) {
    test.expect(1);

    request.get('http://localhost:8080/?user="><ScRiPt>alert(document.cookie)</ScRiPt>').on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS get attack like: "><ScRiPt>alert(document.cookie)</ScRiPt> should return HTTP status code 403.');
        test.done();
    });
};

exports.testGetDifferentSyntaxOrEncoding_3 = function(test) {
    test.expect(1);

    request.get('http://localhost:8080/?user="%3cscript%3ealert(document.cookie)%3c/script%3e').on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS get attack like: "%3cscript%3ealert(document.cookie)%3c/script%3e should return HTTP status code 403.');
        test.done();
    });
};

exports.testGetNonRecursiveFiltering = function(test) {
    test.expect(1);

    request.get('http://localhost:8080/?user=<scr<script>ipt>alert(document.cookie)</script>').on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS get attack like: <scr<script>ipt>alert(document.cookie)</script> should return HTTP status code 403.');
        test.done();
    });
};

exports.testGetIncludingExternalScripts_1 = function(test) {
    test.expect(1);

    request.get('http://localhost:8080/?user=<script src="http://attacker/xss.js"></script>').on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS get attack like: <script src="http://attacker/xss.js"></script> should return HTTP status code 403.');
        test.done();
    });
};

exports.testGetIncludingExternalScripts_2 = function(test) {
    test.expect(1);

    request.get('http://localhost:8080/?user=<SCRIPT%20a=">"%20SRC="http://attacker/xss.js"></SCRIPT> ').on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS get attack like: <SCRIPT%20a=">"%20SRC="http://attacker/xss.js"></SCRIPT> should return HTTP status code 403.');
        test.done();
    });
};

exports.testGetHTTPParameterPollution = function(test) {
    test.expect(1);

    request.get('http://localhost:8080/?user=<script&param=>[...]</&param=script>"></SCRIPT> ').on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS get attack like: <script&param=>[...]</&param=script> should return HTTP status code 403.');
        test.done();
    });
};

exports.testGetUsual = function(test) {
    test.expect(1);

    request.get('http://localhost:8080/').on('response', function(res) {
        test.equals(200, res.statusCode, 'A usual get request should return HTTP status code 200.');
        test.done();
    });
};

exports.testDeleteSimpleXSS = function(test) {
    test.expect(1);

    request.del('http://localhost:8080/test?user=<script>alert(123)</script>').on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS delete attack like: <script>alert(123)</script> should return HTTP status code 403.');
        test.done();
    });
};

exports.testDeleteTagAttributeValue = function(test) {
    test.expect(1);

    request.del('http://localhost:8080/?user=" onfocus="alert(document.cookie)').on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS delete attack like: " onfocus="alert(document.cookie) should return HTTP status code 403.');
        test.done();
    });
};

exports.testDeleteDifferentSyntaxOrEncoding_1 = function(test) {
    test.expect(1);

    request.del('http://localhost:8080/?user="><script >alert(document.cookie)</script >').on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS delete attack like: ><script >alert(document.cookie)</script > should return HTTP status code 403.');
        test.done();
    });
};

exports.testDeleteDifferentSyntaxOrEncoding_2 = function(test) {
    test.expect(1);

    request.del('http://localhost:8080/?user="><ScRiPt>alert(document.cookie)</ScRiPt>').on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS delete attack like: "><ScRiPt>alert(document.cookie)</ScRiPt> should return HTTP status code 403.');
        test.done();
    });
};

exports.testDeleteDifferentSyntaxOrEncoding_3 = function(test) {
    test.expect(1);

    request.del('http://localhost:8080/?user="%3cscript%3ealert(document.cookie)%3c/script%3e').on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS delete attack like: "%3cscript%3ealert(document.cookie)%3c/script%3e should return HTTP status code 403.');
        test.done();
    });
};

exports.testDeleteNonRecursiveFiltering = function(test) {
    test.expect(1);

    request.del('http://localhost:8080/?user=<scr<script>ipt>alert(document.cookie)</script>').on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS delete attack like: <scr<script>ipt>alert(document.cookie)</script> should return HTTP status code 403.');
        test.done();
    });
};

exports.testDeleteIncludingExternalScripts_1 = function(test) {
    test.expect(1);

    request.del('http://localhost:8080/?user=<script src="http://attacker/xss.js"></script>').on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS delete attack like: <script src="http://attacker/xss.js"></script> should return HTTP status code 403.');
        test.done();
    });
};

exports.testDeleteIncludingExternalScripts_2 = function(test) {
    test.expect(1);

    request.del('http://localhost:8080/?user=<SCRIPT%20a=">"%20SRC="http://attacker/xss.js"></SCRIPT> ').on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS delete attack like: <SCRIPT%20a=">"%20SRC="http://attacker/xss.js"></SCRIPT> should return HTTP status code 403.');
        test.done();
    });
};

exports.testDeleteHTTPParameterPollution = function(test) {
    test.expect(1);

    request.del('http://localhost:8080/?user=<script&param=>[...]</&param=script>"></SCRIPT> ').on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS delete attack like: <script&param=>[...]</&param=script> should return HTTP status code 403.');
        test.done();
    });
};

exports.testDeleteUsual = function(test) {
    test.expect(1);

    request.del('http://localhost:8080/').on('response', function(res) {
        test.equals(200, res.statusCode, 'A usual delete request should return HTTP status code 200.');
        test.done();
    });
};

exports.testPostSimpleXSS = function(test) {
    test.expect(1);

    request.post('http://localhost:8080/test', { form: { user: "<script>alert(123)</script>" } }).on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS post attack like: <script>alert(123)</script> should return HTTP status code 403.');
        test.done();
    });
};

exports.testPostTagAttributeValue = function(test) {
    test.expect(1);

    request.post('http://localhost:8080/test', { form: { user: "\" onfocus=\"alert(document.cookie)" } }).on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS post attack like: " onfocus="alert(document.cookie) should return HTTP status code 403.');
        test.done();
    });
};

exports.testPostDifferentSyntaxOrEncoding_1 = function(test) {
    test.expect(1);

    request.post('http://localhost:8080/test', { form: { user: "><script >alert(document.cookie)</script >" } }).on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS post attack like: ><script >alert(document.cookie)</script > should return HTTP status code 403.');
        test.done();
    });
};

exports.testPostDifferentSyntaxOrEncoding_2 = function(test) {
    test.expect(1);

    request.post('http://localhost:8080/test', { form: { user: "\"><ScRiPt>alert(document.cookie)</ScRiPt>" } }).on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS post attack like: "><ScRiPt>alert(document.cookie)</ScRiPt> should return HTTP status code 403.');
        test.done();
    });
};

exports.testPostDifferentSyntaxOrEncoding_3 = function(test) {
    test.expect(1);

    request.post('http://localhost:8080/test', { form: { user: "\"%3cscript%3ealert(document.cookie)%3c/script%3e" } }).on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS post attack like: "%3cscript%3ealert(document.cookie)%3c/script%3e should return HTTP status code 403.');
        test.done();
    });
};

exports.testPostNonRecursiveFiltering = function(test) {
    test.expect(1);

    request.post('http://localhost:8080/test', { form: { user: "<scr<script>ipt>alert(document.cookie)</script>" } }).on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS post attack like: <scr<script>ipt>alert(document.cookie)</script> should return HTTP status code 403.');
        test.done();
    });
};

exports.testPostIncludingExternalScripts_1 = function(test) {
    test.expect(1);

    request.post('http://localhost:8080/test', { form: { user: "<script src=\"http://attacker/xss.js\"></script>" } }).on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS post attack like: <script src="http://attacker/xss.js"></script> should return HTTP status code 403.');
        test.done();
    });
};

exports.testPostIncludingExternalScripts_2 = function(test) {
    test.expect(1);

    request.post('http://localhost:8080/test', { form: { user: "<SCRIPT%20a=\">\"%20SRC=\"http://attacker/xss.js\"></SCRIPT> " } }).on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS post attack like: <SCRIPT%20a=">"%20SRC="http://attacker/xss.js"></SCRIPT> should return HTTP status code 403.');
        test.done();
    });
};

exports.testPostHTTPParameterPollution = function(test) {
    test.expect(1);

    request.post('http://localhost:8080/test', { form: { user: "<script&param=>[...]</&param=script>\"></SCRIPT> " } }).on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS post attack like: <script&param=>[...]</&param=script> should return HTTP status code 403.');
        test.done();
    });
};

exports.testPostUsual = function(test) {
    test.expect(1);

    request.post('http://localhost:8080/').on('response', function(res) {
        test.equals(200, res.statusCode, 'A usual post request should return HTTP status code 200.');
        test.done();
    });
};

exports.testPutSimpleXSS = function(test) {
    test.expect(1);

    request.put('http://localhost:8080/test', { form: { user: "<script>alert(123)</script>" } }).on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS put attack like: <script>alert(123)</script> should return HTTP status code 403.');
        test.done();
    });
};

exports.testPutTagAttributeValue = function(test) {
    test.expect(1);

    request.put('http://localhost:8080/test', { form: { user: "\" onfocus=\"alert(document.cookie)" } }).on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS put attack like: " onfocus="alert(document.cookie) should return HTTP status code 403.');
        test.done();
    });
};

exports.testPutDifferentSyntaxOrEncoding_1 = function(test) {
    test.expect(1);

    request.put('http://localhost:8080/test', { form: { user: "><script >alert(document.cookie)</script >" } }).on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS put attack like: ><script >alert(document.cookie)</script > should return HTTP status code 403.');
        test.done();
    });
};

exports.testPutDifferentSyntaxOrEncoding_2 = function(test) {
    test.expect(1);

    request.put('http://localhost:8080/test', { form: { user: "\"><ScRiPt>alert(document.cookie)</ScRiPt>" } }).on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS put attack like: "><ScRiPt>alert(document.cookie)</ScRiPt> should return HTTP status code 403.');
        test.done();
    });
};

exports.testPutDifferentSyntaxOrEncoding_3 = function(test) {
    test.expect(1);

    request.put('http://localhost:8080/test', { form: { user: "\"%3cscript%3ealert(document.cookie)%3c/script%3e" } }).on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS put attack like: "%3cscript%3ealert(document.cookie)%3c/script%3e should return HTTP status code 403.');
        test.done();
    });
};

exports.testPutNonRecursiveFiltering = function(test) {
    test.expect(1);

    request.put('http://localhost:8080/test', { form: { user: "<scr<script>ipt>alert(document.cookie)</script>" } }).on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS put attack like: <scr<script>ipt>alert(document.cookie)</script> should return HTTP status code 403.');
        test.done();
    });
};

exports.testPutIncludingExternalScripts_1 = function(test) {
    test.expect(1);

    request.put('http://localhost:8080/test', { form: { user: "<script src=\"http://attacker/xss.js\"></script>" } }).on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS put attack like: <script src="http://attacker/xss.js"></script> should return HTTP status code 403.');
        test.done();
    });
};

exports.testPutIncludingExternalScripts_2 = function(test) {
    test.expect(1);

    request.put('http://localhost:8080/test', { form: { user: "<SCRIPT%20a=\">\"%20SRC=\"http://attacker/xss.js\"></SCRIPT> " } }).on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS put attack like: <SCRIPT%20a=">"%20SRC="http://attacker/xss.js"></SCRIPT> should return HTTP status code 403.');
        test.done();
    });
};

exports.testPutHTTPParameterPollution = function(test) {
    test.expect(1);

    request.put('http://localhost:8080/test', { form: { user: "<script&param=>[...]</&param=script>\"></SCRIPT> " } }).on('response', function(res) {
        test.equals(403, res.statusCode, 'An XSS put attack like: <script&param=>[...]</&param=script> should return HTTP status code 403.');
        test.done();
    });
};

exports.testPutUsual = function(test) {
    test.expect(1);

    request.put('http://localhost:8080/').on('response', function(res) {
        test.equals(200, res.statusCode, 'A usual put request should return HTTP status code 200.');
        test.done();
    });
};

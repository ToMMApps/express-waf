(function() {

    var _config;
    var _blocker;
    var _logger;

    function https_redirect(config, blocker, logger) {
        _config = config;
        _blocker = blocker;
        _logger = logger;
    }

    https_redirect.prototype.check = function(req, res, next) {

        // TODO check for openshift headers
        var is_open_shift = req.headers.hasOwnProperty("x-forwarded-proto");


        if (is_open_shift) {
            // TODO redirect to openShift https
            if (req.headers["x-forwarded-proto"] !== "https") {
                res.redirect("https://" + req.headers.host + req.url);
            } else {
                next();
            }
        } else {
            // TODO check if is https
            var is_https_req = req.secure;
            if (is_https_req) {
                // Do nothing
                next();
            } else {
                res.redirect("https://" + req.headers.host + req.url);
            }
        }
    };

    module.exports = https_redirect;

})();
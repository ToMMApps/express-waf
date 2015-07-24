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

        var has_proxy_header = req.headers.hasOwnProperty("x-forwarded-proto");

        if (has_proxy_header) {
            if (req.headers["x-forwarded-proto"] !== "https") {
                res.redirect("https://" + req.headers.host + req.url);
            } else {
                next();
            }
        } else {
            // 
            var is_https_req = req.secure;
            if (is_https_req) {
                next();
            } else {
                res.redirect("https://" + req.headers.host + req.url);
            }
        }
    };

    module.exports = https_redirect;

})();
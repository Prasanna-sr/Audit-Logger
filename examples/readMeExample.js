var express = require('express');
var app = express();
app.listen(3000);
var auditLogger = require('./../index.js');

auditLogger(app, {
    responseTime: httpResponseTime(500)
}, function loggingCallback(req, res) {
    //log your application data here
    console.log(req.headers);
    console.log(req.timers.value);
});

app.use(function testMiddleware(req, res, next) {
    setTimeout(function() {
        next();
    }, 200)
});
app.get('/', function defaultRoute(req, res) {
    privateFunction(req, function() {
        res.status(500).send('ok');
    });
});

function privateFunction(req, callback) {
	req.timers.start('privateFunction');
    setTimeout(function() {
    	req.timers.stop('privateFunction');
    	callback();
    }, 501);
}

function httpResponseTime(milliseconds) {
    //req.timers.$finalTimer contains total time for the request
    return function(req, res) {
        return req.timers.value.some(function(timer) {
            if (timer.$finalTimer > milliseconds) {
                return true;
            }
        });
    }
}

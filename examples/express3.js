var express = require('express');
var app = express();
app.listen(3000);
// var auditLogger = require('auditlogger');
var auditLogger = require('./../index.js');

auditLogger(app, {
    responseTime: httpResponseTime(500)
}, function loggingCallback(req, responseArgs) {
    //log your application data here
    console.log(req.headers);
    console.log(res);
});

app.use('/', function(req, res) {
    setTimeout(function() {
        res.send(200, 'ok');
    }, 501);
});

function httpResponseTime(milliseconds) {
    //req.timers.$finalTimer contains total time for the request
    return function(req, res) {
        return req.timers.value.some(function(timer) {
            if (timer.$finalTimer > milliseconds) {
                return true;
            }
        });
    }
};

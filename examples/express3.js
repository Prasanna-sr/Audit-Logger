var express = require('express');
var app = express();
app.listen(3000);
// var auditLogger = require('auditlogger');
var auditLogger = require('./../index.js');

auditLogger(express, app, {
    responseTime: httpResponseTime(500)
}, function loggingCallback(req, responseArgs) {
    //log your application data here
    // console.log(req.headers);
    logData(req, responseArgs)
});

app.get('/test', function(req, res) {
    setTimeout(function() {
        res.send(200, 'ok');
    }, 501);
});

function logData(req, res) {
    console.log('/***********************************************************/');
    console.log('/********************** REQUEST HEADERS *********************/');
    console.log('/************************************************************/');
    console.log(req.headers);
    console.log('URL route :' + req.originalUrl);
    console.log('\n');
    console.log('/***************************************************************/');
    console.log('/********************* MIDDLEWARE TIMERS ***********************/');
    console.log('/***************************************************************/');
    console.log(req.timers.value);

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
};

//Express 4.X example
var express = require('express');
var app = express();
var router = express.Router();
var auditLogger = require('./../index.js');
//server runs at port 3000
app.listen(3000);

//Initiate the logger
// logger is passed two rules, responseTime and responseCode400s,
// the logger is turned on (or logs) only when one of the rules fails
auditLogger(app, {
    responseTime: auditLogger.httpResponseTime(500),
    responseCode400s: auditLogger.httpResponseCode([404])
}, function(req, res) {
    //log your application data here
    logData(req, res);
});

app.use(function prkApp1(req, res, next) {
    next();
});

app.use(function prkApp2(req, res, next) {
    setTimeout(function() {
        middlewarePrivateFunction(req);
        next();
    }, 111);

});
app.use(router);

router.use(function prkRouterMiddelware1(req, res, next) {
    //timeout to make the route longer than 500 milliseconds
    setTimeout(function() {
        next();
    }, 500);

});

//test route which fails 'responseTime' rule
router.get('/test', function test(req, res, next) {
    privateFunction(req);
    privateFunction1(req);
    res.status(200).send('Test Page');
});

//test route which fails 'responseCode400s' rule
router.get('/test/httpresponse', function test(req, res, next) {
    setTimeout(function() {
        res.status(404).send('404 Page');
    }, 0);
});

function middlewarePrivateFunction(req, cb) {
    req.timers.start('mwPrivateFunction');
    req.timers.stop();
}

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

function privateFunction(req, cb) {
    req.timers.start('privateFunction');
    var t = new Date().getTime();
    setTimeout(function() {
        req.timers.stop();
    }, 555)
}

function privateFunction1(req, cb) {
    req.timers.start('privateFunction1');
    req.timers.stop();
}

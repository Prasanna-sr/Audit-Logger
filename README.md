## Audit Logger 


[![Build Status](https://travis-ci.org/Prasanna-sr/Audit-Logger.svg?branch=master)](https://travis-ci.org/Prasanna-sr/Audit-Logger)

[![Dependencies](https://david-dm.org/Prasanna-sr/Audit-Logger.svg)](https://david-dm.org/Prasanna-sr/Audit-Logger)

[![Coverage Status](https://coveralls.io/repos/Prasanna-sr/Audit-Logger/badge.svg?branch=master&service=github)](https://coveralls.io/github/Prasanna-sr/Audit-Logger?branch=master)


Provides more control to your logging.

## Why
When running in production, you may wish you could have certain information avaialble for certain request.
It is not efficient to log all information parameters for all requests. This library helps you to create application specific rules and provides request information data only when the application fails certain rules.

## Install [![npm version](https://badge.fury.io/js/auditlogger.svg)](http://badge.fury.io/js/auditlogger)

	$ npm install auditlogger

## How to use
Initialize auditlogger constructor

	auditLogger(app, {ruleName1: function, ruleName2: function}, notifyCallback);

- Parameter 1 -  express application object.
- Parameter 2 -  Object, to specify logger rules. There can be any number of rules, each property consist of rule name and rule function. 
Module provides httpResponseCode, and httpResponseTime rules which can be configured. 
Custom rule function can be provided, if function return true, the rule is treated as failed
and logger is turned on.
- Parameter 3 - callback function which gets called if any of the rule fails.  Function is invoked with express req object, res object and body passed to send.

AuditLogger automatically captures time taken for all middlewares and routes.

- **req.timer.value** - gives time taken for all middleware and routes.
- **req.timer.start(name)** and **req.timer.stop(name)** - could be used any time during the request to log private functions. 
- **req.timer.value** contains special **$finalTimer** key which contains total time taken for the request.

#####Note: name your middleware functions to get better timer results.

## Usage
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
###Output
  *req.headers*
     
    { host: '127.0.0.1:3000',  'user-agent': 'curl/7.43.0',  accept: '*/*' }

*req.timers.value*

    [ { testMiddleware: 201 },  { defaultRoute: 506 }, { 'defaultRoute -> privateFunction': 505 }, { '$finalTimer': 708 } ]
## Examples

Examples are avaialbe [here](https://github.com/Prasanna-sr/Audit-Logger/tree/master/examples)

## Tests
	$ npm install
	$ npm test

## License

[The MIT License](http://opensource.org/licenses/MIT)

## Audit Logger 


[![Build Status](https://travis-ci.org/Prasanna-sr/Audit-Logger.svg?branch=master)](https://travis-ci.org/Prasanna-sr/Audit-Logger)

[![Dependencies](https://david-dm.org/Prasanna-sr/Audit-Logger.svg)](https://david-dm.org/Prasanna-sr/Audit-Logger)

[![Coverage Status](https://coveralls.io/repos/Prasanna-sr/Audit-Logger/badge.svg?branch=master)](https://coveralls.io/r/Prasanna-sr/Audit-Logger?branch=master)

Provides more control to your logging.

## Why
When running in production, you may wish you could have certain data avaialble for certain request.
It is not efficient to log all parameters for all requests. This library helps you to create application specific rules and provides all application data only when the application fails certain rules.

## Install [![npm version](https://badge.fury.io/js/auditlogger.svg)](http://badge.fury.io/js/auditlogger)

	$ npm install auditlogger

## How to use
Initialize auditlogger constructor

	auditLogger(app, {ruleName1: function, ruleName2: function}, notifyCallback);

- Parameter 1 -  express application object.
- Parameter 2 -  Object which contain logger rules. There can be any number of rules, rule function should return true when the rule fails. notifyCallback is a function which get called when the first rule fails.
- Parameter 3 - function which gets called when the rules fails. Function where you would log. Function is called with express req object and response arguments.(http response code and response data)

## Usage

	var express = require('express');
	var app = express();
	app.listen(3000);
	// var auditLogger = require('auditlogger');
	var auditLogger = require('./../index.js');

	auditLogger(app, {
	    responseTime: httpResponseTime(500)
	}, function loggingCallback(req, res) {
	    //log your application data here
	    console.log(req.headers);
	});

	app.use('/', function(req, responseArgs) {
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

## Tests
	$ npm install
	$ npm test

## License

[The MIT License](http://opensource.org/licenses/MIT)

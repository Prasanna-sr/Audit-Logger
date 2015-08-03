## Audit Logger 


[![Build Status](https://travis-ci.org/Prasanna-sr/Audit-Logger.svg?branch=master)](https://travis-ci.org/Prasanna-sr/Audit-Logger)

[![Dependencies](https://david-dm.org/Prasanna-sr/Audit-Logger.svg)](https://david-dm.org/Prasanna-sr/Audit-Logger)

[![Coverage Status](https://coveralls.io/repos/Prasanna-sr/Audit-Logger/badge.svg?branch=master)](https://coveralls.io/r/Prasanna-sr/Audit-Logger?branch=master)

Provides more control to your logging.

## Why
When running in production, you may wish you could have certain data avaialble for certain request.
It is not efficient to log all parameters for all requests. This library helps you to create application specific rules and provides all application data only when the application fails certain rules.


## How to use
Initialize your application by requiring the module and calling the constructor with the application object. 


## Tests
	$ npm install
	$ npm test

## License

[The MIT License](http://opensource.org/licenses/MIT)

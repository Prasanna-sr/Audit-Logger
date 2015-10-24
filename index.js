var expressSendMethods = ['send', 'json', 'jsonp', 'redirect',
    'sendStatus', 'render', 'sendfile', 'sendFile'
];

var httpResponseTime = require('./rules/httpResponseTime');
var httpResponseCode = require('./rules/httpResponseCode');
var express = require('express');
module.exports = auditLogger;
auditLogger.httpResponseTime = httpResponseTime;
auditLogger.httpResponseCode = httpResponseCode;

function auditLogger(app, rulesObj, notifyCallback) {

    app.use(function(req, res, next) {
        req.timers = function() {};
        req.timers.value = [];
        req.timers.startTime = new Date().getTime();
        req.timers.start = function(name) {
            for (var i = req.timers.value.length - 1; i >= 0; i--) {
                var tempObj = req.timers.value[i];
                var key = Object.keys(tempObj)[0];
                var value = tempObj[key];
                if (key.indexOf('->') === -1 && value.init === -1) {
                    key = key + ' -> ' + name;
                    var timerObj = {};
                    timerObj[key] = {};
                    timerObj[key]['time'] = new Date().getTime();
                    timerObj[key]['init'] = -1;
                    req.timers.value.push(timerObj);
                    break;
                }
            }
        }

        req.timers.stop = function(name) {
            for (var i = req.timers.value.length - 1; i >= 0; i--) {
                var tempObj = req.timers.value[i];
                var key = Object.keys(tempObj)[0];
                var tempKeyArr = key.split('->');
                var tempKey = tempKeyArr[1] ? tempKeyArr[1].trim() : key;
                var value = tempObj[key]['init'];
                var timerObj = {};
                if (name && name === tempKey && value === -1) {
                    timerObj[key] = new Date().getTime() - req.timers.value[i][key]['time'];
                    req.timers.value[i] = timerObj;
                }
            }
        }
        next();
    });

    // overrideMethods(express.response, expressSendMethods, responseSend);
    overrideMethods(express.response.status(), expressSendMethods, responseSend);
    overrideMethod(app, 'use', appMiddleware);
    overrideMethod(app, 'get', routerHttpMethods);
    overrideMethod(app, 'post', routerHttpMethods);
    overrideMethod(app, 'put', routerHttpMethods);
    overrideMethod(app, 'delete', routerHttpMethods);


    function responseSend(responseFn) {
        return function() {
            var that = this;
            if (!that.req.timers['$finalTimer']) {
                var args = Array.prototype.slice.call(arguments);
                that.req.timers['$finalTimer'] = true;
                that.req.timers.value.push({
                    '$finalTimer': (new Date().getTime() - that.req.timers.startTime)
                });
                for (var $i = that.req.timers.value.length - 1; $i >= 0; $i--) {
                    var $key = Object.keys(that.req.timers.value[$i])[0];
                    if (that.req.timers.value[$i][$key].init === -1) {
                        that.req.timers.value[$i][$key] = new Date().getTime() - that.req.timers.value[$i][$key]['time'];
                        break;
                    }
                }
                var keys = Object.keys(rulesObj);
                var shouldNotify = keys.some(function(key) {
                    var fn = rulesObj[key];
                    return fn(that.req, that, args);
                });
                if (shouldNotify) {
                    notifyCallback(that.req, that, arguments);
                }
            }
            responseFn.apply(this, arguments);
        }
    }

    function appMiddleware(appUseFn) {
        return function() {
            var appFn = arguments[0];
            if (typeof appFn === 'function' && typeof appFn.use === 'function') {
                handleRouterMethods(appFn);
            } else if (typeof appFn === 'function') {
                arguments[0] = middlewareHandler(appFn);
            }
            return appUseFn.apply(this, arguments);
        }
    }

    //router is used or sub middleware are used
    function handleRouterMethods(router) {
        overrideMethod(router, "use", routerMiddleware);
        overrideMethod(router, 'get', routerHttpMethods);
        overrideMethod(router, 'post', routerHttpMethods);
        overrideMethod(router, 'put', routerHttpMethods);
        overrideMethod(router, 'delete', routerHttpMethods);
    }

    function routerMiddleware(routerUse) {
        return function() {
            var routerFn = arguments[0];
            arguments[0] = middlewareHandler(routerFn);
            return routerUse.apply(this, arguments);
        }
    }

    function routerHttpMethods(routerFn) {
        return function() {
            var middlewareFn = arguments[1];
            var route = arguments[0];
            arguments[1] = middlewareHandler(middlewareFn, route);
            return routerFn.apply(this, arguments);
        }
    }

    function middlewareHandler(middlewareFn, route) {
        if (middlewareFn && middlewareFn.length === 4) {
            return function(err, req, res, next) {
                return middlewareFn.apply(this, arguments);
            }
        } else {
            return function() {
                var $obj = {};
                $obj["timerObj"] = {};
                $obj.req = arguments[0];
                $obj.counter = new Date().getTime();
                var $name;
                var nextFn = arguments[2];
                if (middlewareFn.name || route) {
                    $obj.name = middlewareFn.name || route;
                } else {
                    $obj.name = 'anonymous';
                }
                $obj["timerObj"][$obj.name] = {
                    init: -1,
                    time: new Date().getTime()
                };
                $obj.req.timers.value.push($obj["timerObj"]);
                arguments[2] = function() {
                    for (var $i = $obj.req.timers.value.length - 1; $i >= 0; $i--) {
                        var $key = Object.keys($obj.req.timers.value[$i])[0];
                        if ($obj.req.timers.value[$i][$key] && $obj.req.timers.value[$i][$key].init === -1) {
                            $obj.req.timers.value[$i][$key] = new Date().getTime() - $obj.counter;
                            break;
                        }
                    }
                    nextFn.apply(this, arguments);
                }
                return middlewareFn.apply(this, arguments);
            }
        }
    }

    function overrideMethods(object, methodsArr, callback) {
        methodsArr.forEach(function(method) {
            object[method] = callback(object[method]);
        });
    }

    function overrideMethod(object, methodName, callback) {
        object[methodName] = callback(object[methodName]);
    }
}

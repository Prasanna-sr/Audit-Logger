//If the module return true, 
//final notify callback is called (or the logger is turned on)
module.exports = function() {
    var args = Array.prototype.slice.call(arguments)[0];
    return function(req, res, originalArgs) {
        var requestStatus = res.statusCode;
        // No args -> do nothing, else match code or range
        return (!args.length || args.some(function(range) {
            return requestStatus === range;
        }));
    }
};

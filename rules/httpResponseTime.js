//If the module return true, 
//rule is matched and logger is turned on
module.exports = function(milliseconds) {
    return function(req, res) {
        return req.timers.value.some(function(timer) {
            if (timer.$finalTimer > milliseconds) {
                return true;
            }
        });
    }
};
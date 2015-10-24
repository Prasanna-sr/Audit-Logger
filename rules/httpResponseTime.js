//If the module return true, 
//final notify callback is called
module.exports = function(milliseconds) {
    return function(req, res) {
        return req.timers.value.some(function(timer) {
            if (timer.$finalTimer > milliseconds) {
                return true;
            }
        });
    }
};
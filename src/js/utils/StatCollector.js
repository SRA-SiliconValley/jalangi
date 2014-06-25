(function (sandbox) {

    var timers = {};
    var counters = {};
    var accumulators = {};
    var StatCollector = {};
    var STATS_FILE_NAME = "jalangi_stats";

    StatCollector.resumeTimer = function (timerName) {
        var timer;
        if (!(timer = timers[timerName])) {
            timers[timerName] = {begin:-1, total:0};
        }
        if (timer.begin >= 0) {
            throw new Error("Trying to resume active timer " + timerName);
        }
        timer.begin = Date.now();
    };

    StatCollector.suspendTimer = function (timerName) {
        var timer, now = Date.now();
        if (!(timer = timers[timerName])) {
            throw new Error("Trying to suspend a non-existent timer " + timerName);
        }
        timer.total += (now - timer.begin);
        timer.begin = -1;
    };

    StatCollector.addToAccumulator = function (accumulatorName, val) {
        var accumulator;
        if (!(accumulator = accumulators[accumulatorName])) {
            accumulators[accumulatorName] = {count:0, sum:0, max:undefined, min:undefined};
        }
        accumulator.count++;
        accumulator.sum += val;
        if (accumulator.max === undefined) {
            accumulator.max = val;
        } else if (val > accumulator.max) {
            accumulator.max = val;
        }
        if (accumulator.min === undefined) {
            accumulator.min = val;
        } else if (val < accumulator.max) {
            accumulator.min = val;
        }
    };

    StatCollector.addToCounter = function (counterName) {
        counters[counterName] = (counters[counterName] | 0) + 1;
    };

    StatCollector.loadStats = function () {
        try {
            var tmp = JSON.parse(require('fs').readFileSync(STATS_FILE_NAME, "utf8"));
            timers = tmp.timers;
            counters = tmp.counters;
            accumulators = tmp.accumulators;
        } catch (e) {
        }
    };

    StatCollector.storeStats = function () {
        require('fs').writeFileSync(STATS_FILE_NAME, JSON.stringify({timers:timers, counters:counters, accumulators:accumulators}), "utf8");
    };

    sandbox.exports = StatCollector;
}(module));
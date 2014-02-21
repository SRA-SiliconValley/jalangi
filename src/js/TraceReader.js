if (typeof J$ === 'undefined') {
    J$ = {};
}

(function (sandbox) {

    sandbox.TraceReader = function () {
        var Constants = (typeof sandbox.Constants === 'undefined' ? require('./Constants.js') : sandbox.Constants);
        var Globals = Constants.load('Globals');
        var Config = Constants.load('Config');

        var F_SEQ = Constants.F_SEQ;
        var decodeNaNandInfForJSON = Constants.decodeNaNandInfForJSON;
        var fixForStringNaN = Constants.fixForStringNaN;
        var debugPrint = Constants.debugPrint;

        var traceArray = [];
        var traceIndex = 0;
        var currentIndex = 0;
        var frontierIndex = 0;
        var MAX_SIZE = 1024;
        var traceFh;
        var done = false;
        var curRecord = null;

        function cacheRecords() {
            var i = 0, flag, record;

            if (Constants.isBrowserReplay) {
                return;
            }
            if (currentIndex >= frontierIndex) {
                if (!traceFh) {
                    var FileLineReader = require('./utils/FileLineReader');
                    traceFh = new FileLineReader(Globals.traceFileName);
                    // change working directory to wherever trace file resides
                    var pth = require('path');
                    var traceFileDir = pth.dirname(pth.resolve(process.cwd(), Globals.traceFileName));
                    process.chdir(traceFileDir);
                }
                traceArray = [];
                while (!done && (flag = traceFh.hasNextLine()) && i < MAX_SIZE) {
                    record = JSON.parse(traceFh.nextLine(), decodeNaNandInfForJSON);
                    fixForStringNaN(record);
                    traceArray.push(record);
                    debugPrint(i + ":" + JSON.stringify(record /*, encodeNaNandInfForJSON*/));
                    frontierIndex++;
                    i++;
                }
                if (!flag && !done) {
                    traceFh.close();
                    done = true;
                }
            }
        }

        this.addRecord = function (line) {
            var record = JSON.parse(line, decodeNaNandInfForJSON);
            fixForStringNaN(record);
            traceArray.push(record);
            debugPrint(JSON.stringify(record /*, encodeNaNandInfForJSON*/));
            frontierIndex++;
        };

        this.getAndNext = function () {
            if (curRecord !== null) {
                var ret = curRecord;
                curRecord = null;
                return ret;
            }
            cacheRecords();
            var j = Constants.isBrowserReplay ? currentIndex : currentIndex % MAX_SIZE;
            var record = traceArray[j];
            if (record && record[F_SEQ] === traceIndex) {
                currentIndex++;
            } else {
                record = undefined;
            }
            traceIndex++;
            return record;
        };

        this.getNext = function () {
            if (curRecord !== null) {
                throw new Error("Cannot do two getNext() in succession");
            }
            var tmp = this.getAndNext();
            var ret = this.getCurrent();
            curRecord = tmp;
            return ret;
        };

        this.getCurrent = function () {
            if (curRecord !== null) {
                return curRecord;
            }
            cacheRecords();
            var j = Constants.isBrowserReplay ? currentIndex : currentIndex % MAX_SIZE;
            var record = traceArray[j];
            if (!(record && record[F_SEQ] === traceIndex)) {
                record = undefined;
            }
            return record;
        };

        this.next = function () {
            if (curRecord !== null) {
                curRecord = null;
                return;
            }
            cacheRecords();
            var j = Constants.isBrowserReplay ? currentIndex : currentIndex % MAX_SIZE;
            var record = traceArray[j];
            if (record && record[F_SEQ] === traceIndex) {
                currentIndex++;
            }
            traceIndex++;
        };

        this.getPreviousIndex = function () {
            if (curRecord !== null) {
                return traceIndex - 2;
            }
            return traceIndex - 1;
        };

    }

    if (typeof module !== 'undefined') {
        module.exports = sandbox.TraceReader;
    }

})(J$);

if (typeof J$ === 'undefined') {
    J$ = {};
}

(function (sandbox) {

    sandbox.TraceReader = function () {
        var Constants = sandbox.Constants;
        var Globals = sandbox.Globals;
        var Config = sandbox.Config;

        var F_SEQ = Constants.F_SEQ;
        var F_TYPE = Constants.F_TYPE;
        var F_VALUE = Constants.F_VALUE;
        var F_IID = Constants.F_IID;
        var F_FUNNAME = Constants.F_FUNNAME;
        var N_LOG_LOAD = Constants.N_LOG_LOAD;
        var N_LOG_HASH = Constants.N_LOG_HASH;

        var T_OBJECT = Constants.T_OBJECT;
        var T_FUNCTION = Constants.T_FUNCTION;
        var T_ARRAY = Constants.T_ARRAY;


        var decodeNaNandInfForJSON = Constants.decodeNaNandInfForJSON;
        var fixForStringNaN = Constants.fixForStringNaN;
        var debugPrint = Constants.debugPrint;

        var traceArray = [];
        this.traceIndex = 0;
        var currentIndex = 0;
        var frontierIndex = 0;
        var MAX_SIZE = 1024;
        var traceFh;
        var done = false;
        var curRecord = null;

        var count = 0;
        var count2 = 0;

        this.objectIdLife = [];

        this.populateObjectIdLife = function () {
            if (Constants.isBrowserReplay) {
                return;
            }
            var type;
            var FileLineReader = require('./utils/FileLineReader');
            var traceFh = new FileLineReader(Globals.traceFileName);
            while (traceFh.hasNextLine()) {
                var record = JSON.parse(traceFh.nextLine(), decodeNaNandInfForJSON);
                if (((type = record[F_TYPE]) === T_OBJECT || type === T_ARRAY || type === T_FUNCTION) && record[F_FUNNAME] !== N_LOG_HASH && record[F_VALUE] !== Constants.UNKNOWN) {
                    this.objectIdLife[record[F_VALUE]] = record[F_SEQ];
                }
                if (record[F_FUNNAME] === N_LOG_LOAD && record[F_VALUE] !== Constants.UNKNOWN) {
                    this.objectIdLife[record[F_VALUE]] = record[F_SEQ];
                }
            }
            traceFh.close();
        };

        this.hasFutureReference = function (id) {
            var ret = (this.objectIdLife[id] >= this.traceIndex);
            return ret;
        };

        this.canDeleteReference = function (recordedArray) {
            var ret = (this.objectIdLife[recordedArray[F_VALUE]] === recordedArray[F_SEQ]);
            return ret;
        };

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
            if (record && record[F_SEQ] === this.traceIndex) {
                currentIndex++;
            } else {
                record = undefined;
            }
            this.traceIndex++;
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
            if (!(record && record[F_SEQ] === this.traceIndex)) {
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
            if (record && record[F_SEQ] === this.traceIndex) {
                currentIndex++;
            }
            this.traceIndex++;
        };

        this.getPreviousIndex = function () {
            if (curRecord !== null) {
                return this.traceIndex - 2;
            }
            return this.traceIndex - 1;
        };


    };

})(J$);

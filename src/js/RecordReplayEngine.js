//----------------------------------- Record Replay Engine ---------------------------------

// create / reset J$ global variable to hold analysis runtime
if (typeof J$ === 'undefined') {
    J$ = {};
}

(function (sandbox) {

    //----------------------------------- Record Replay Engine ---------------------------------

    sandbox.RecordReplayEngine = function() {

        // get the constants in local variables for faster access

        var Globals = sandbox.Globals;
        var Config = sandbox.Config;
        var Constants = sandbox.Constants;

        var SPECIAL_PROP = Constants.SPECIAL_PROP;
        var SPECIAL_PROP2 = Constants.SPECIAL_PROP2;
        var SPECIAL_PROP3 = Constants.SPECIAL_PROP3;


        var MODE_RECORD = Constants.MODE_RECORD,
            MODE_REPLAY = Constants.MODE_REPLAY;

        var T_NULL = Constants.T_NULL,
            T_NUMBER = Constants.T_NUMBER,
            T_BOOLEAN = Constants.T_BOOLEAN,
            T_STRING = Constants.T_STRING,
            T_OBJECT = Constants.T_OBJECT,
            T_FUNCTION = Constants.T_FUNCTION,
            T_UNDEFINED = Constants.T_UNDEFINED,
            T_ARRAY = Constants.T_ARRAY;

        var F_TYPE = Constants.F_TYPE,
            F_VALUE = Constants.F_VALUE,
            F_IID = Constants.F_IID,
            F_SEQ = Constants.F_SEQ,
            F_FUNNAME = Constants.F_FUNNAME;

        var N_LOG_FUNCTION_ENTER = Constants.N_LOG_FUNCTION_ENTER,
            N_LOG_SCRIPT_ENTER = Constants.N_LOG_SCRIPT_ENTER,
            N_LOG_GETFIELD = Constants.N_LOG_GETFIELD,
            N_LOG_ARRAY_LIT = Constants.N_LOG_ARRAY_LIT,
            N_LOG_OBJECT_LIT = Constants.N_LOG_OBJECT_LIT,
            N_LOG_FUNCTION_LIT = Constants.N_LOG_FUNCTION_LIT,
            N_LOG_RETURN = Constants.N_LOG_RETURN,
            N_LOG_REGEXP_LIT = Constants.N_LOG_REGEXP_LIT,
            N_LOG_READ = Constants.N_LOG_READ,
            N_LOG_LOAD = Constants.N_LOG_LOAD,
            N_LOG_HASH = Constants.N_LOG_HASH,
            N_LOG_SPECIAL = Constants.N_LOG_SPECIAL,
            N_LOG_GETFIELD_OWN = Constants.N_LOG_GETFIELD_OWN;
        
        var HOP = Constants.HOP;
        var hasGetterSetter = Constants.hasGetterSetter;
        var getConcrete = Constants.getConcrete;
        var debugPrint = Constants.debugPrint;
        var warnPrint = Constants.warnPrint;
        var seriousWarnPrint = Constants.seriousWarnPrint;

        var traceInfo, traceWriter, traceFileName;
        var seqNo = 0;

        var frame = {};
        var frameStack = [frame];

        var evalFrames = [];

        var literalId = 2;

        var objectId = 1;
        var objectMap = [];
        var createdMockObject = false;
        /*
         type enumerations are
         null is 0
         number is 1
         boolean is 2
         string is 3
         object is 4
         function is 5
         undefined is 6
         array is 7
         */


        function encodeNaNandInfForJSON(key, value) {
            if (value === Infinity) {
                return "Infinity";
            } else if (value !== value) {
                return "NaN";
            }
            return value;
        }

        function decodeNaNandInfForJSON(key, value) {
            if (value === "Infinity") {
                return Infinity;
            } else if (value === 'NaN') {
                return NaN;
            } else {
                return value;
            }
        }

        function fixForStringNaN(record) {
            if (record[F_TYPE] == T_STRING) {
                if (record[F_VALUE] !== record[F_VALUE]) {
                    record[F_VALUE] = 'NaN';
                } else if (record[F_VALUE] === Infinity) {
                    record[F_VALUE] = 'Infinity';
                }

            }
        }

        function load(path) {
            var head, script;
            head = document.getElementsByTagName('head')[0];
            script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = path;
            head.appendChild(script);
        }


        function printableValue(val) {
            var value, typen = getNumericType(val), ret = [];
            if (typen === T_NUMBER || typen === T_BOOLEAN || typen === T_STRING) {
                value = val;
            } else if (typen === T_UNDEFINED) {
                value = 0;
            } else {
                if (val === null) {
                    value = 0;
                } else {
                    if (!HOP(val, SPECIAL_PROP)) {
                        if (Object && Object.defineProperty && typeof Object.defineProperty === 'function') {
                            try {
                                Object.defineProperty(val, SPECIAL_PROP, {
                                    enumerable:false,
                                    writable:true
                                });
                            } catch (e) {
                                if (Constants.isBrowser && window.__JALANGI_PHANTOM__) {
                                    // known issue with older WebKit in PhantomJS
                                    // ignoring seems to not cause anything too harmful
                                } else {
                                    throw e;
                                }
                            }
                        }
                        val[SPECIAL_PROP] = {};//Object.create(null);
                        val[SPECIAL_PROP][SPECIAL_PROP] = objectId;
                        createdMockObject = true;
//                            console.log("oid:"+objectId);
                        objectId = objectId + 2;
                    }
                    if (HOP(val, SPECIAL_PROP) && typeof val[SPECIAL_PROP][SPECIAL_PROP] === 'number') {
                        value = val[SPECIAL_PROP][SPECIAL_PROP];
                    } else {
                        value = undefined;
                    }
                }
            }
            ret[F_TYPE] = typen;
            ret[F_VALUE] = value;
            return ret;
        }

        function getNumericType(val) {
            var type = typeof val;
            var typen;
            switch (type) {
                case "number":
                    typen = T_NUMBER;
                    break;
                case "boolean":
                    typen = T_BOOLEAN;
                    break;
                case "string":
                    typen = T_STRING;
                    break;
                case "object":
                    if (val === null) {
                        typen = T_NULL;
                    } else if (Array.isArray(val)) {
                        typen = T_ARRAY;
                    } else {
                        typen = T_OBJECT;
                    }
                    break;
                case "function":
                    typen = T_FUNCTION;
                    break;
                case "undefined":
                    typen = T_UNDEFINED;
                    break;
            }
            return typen;
        }


        function setLiteralId(val) {
            var id;
            var oldVal = val;
            val = getConcrete(oldVal);
            if (!HOP(val, SPECIAL_PROP)) {
                if (Object && Object.defineProperty && typeof Object.defineProperty === 'function') {
                    Object.defineProperty(val, SPECIAL_PROP, {
                        enumerable:false,
                        writable:true
                    });
                }
                val[SPECIAL_PROP] = {};
                val[SPECIAL_PROP][SPECIAL_PROP] = id = literalId;
                literalId = literalId + 2;
                // changes due to getter or setter method
                for (var offset in val) {
                    if (offset !== SPECIAL_PROP && offset !== SPECIAL_PROP2 && HOP(val, offset)) {
                        if (!hasGetterSetter(val, offset, true))
                            val[SPECIAL_PROP][offset] = val[offset];
                    }
                }
            }
            if (Globals.mode === MODE_REPLAY) {
                objectMap[id] = oldVal;
            }
        }

        function getActualValue(recordedValue, recordedType) {
            if (recordedType === T_UNDEFINED) {
                return undefined;
            } else if (recordedType === T_NULL) {
                return null;
            } else {
                return recordedValue;
            }
        }


        function syncValue(recordedArray, replayValue, iid) {
            var oldReplayValue = replayValue, tmp;
            ;
            replayValue = getConcrete(replayValue);
            var recordedValue = recordedArray[F_VALUE], recordedType = recordedArray[F_TYPE];

            if (recordedType === T_UNDEFINED ||
                recordedType === T_NULL ||
                recordedType === T_NUMBER ||
                recordedType === T_STRING ||
                recordedType === T_BOOLEAN) {
                if ((tmp = getActualValue(recordedValue, recordedType)) !== replayValue) {
                    return tmp;
                } else {
                    return oldReplayValue;
                }
            } else {
                //var id = objectMapIndex[recordedValue];
                var obj = objectMap[recordedValue];
                var type = getNumericType(replayValue);

                if (obj === undefined) {
                    if (type === recordedType && !HOP(replayValue, SPECIAL_PROP)) {
                        obj = replayValue;
                    } else {
                        if (recordedType === T_OBJECT) {
                            obj = {};
                        } else if (recordedType === T_ARRAY) {
                            obj = [];
                        } else {
                            obj = function () {
                            };
                        }
                    }
                    try {
                        if (Object && Object.defineProperty && typeof Object.defineProperty === 'function') {
                            Object.defineProperty(obj, SPECIAL_PROP, {
                                enumerable:false,
                                writable:true
                            });
                        }
                    } catch (ex) {

                    }
                    obj[SPECIAL_PROP] = {};//Object.create(null);
                    obj[SPECIAL_PROP][SPECIAL_PROP] = recordedValue;
                    createdMockObject = true;
                    objectMap[recordedValue] = ((obj === replayValue) ? oldReplayValue : obj);
                }
                return (obj === replayValue) ? oldReplayValue : obj;
            }
        }


        function logValue(iid, ret, funName) {
            ret[F_IID] = iid;
            ret[F_FUNNAME] = funName;
            ret[F_SEQ] = seqNo++;
            var line = JSON.stringify(ret, encodeNaNandInfForJSON) + "\n";
            traceWriter.logToFile(line);
        }

        function checkPath(ret, iid, fun) {
            if (ret === undefined || ret[F_IID] !== iid) {
                if (fun === N_LOG_RETURN) {
                    throw undefined;  // a native function call has thrown an exception
                } else {
                    if (Config.LOG_ALL_READS_AND_BRANCHES) {
                        console.log()
                        require('fs').writeFileSync("readAndBranchLogs.replay", JSON.stringify(Globals.loadAndBranchLogs, undefined, 4), "utf8");
                    }
                    seriousWarnPrint(iid, "Path deviation at record = [" + ret + "] iid = " + iid + " index = " + traceInfo.getPreviousIndex());
                    throw new Error("Path deviation at record = [" + ret + "] iid = " + iid + " index = " + traceInfo.getPreviousIndex());
                }
            }
        }

        function getFrameContainingVar(name) {
            var tmp = frame;
            while (tmp && !HOP(tmp, name)) {
                tmp = tmp[SPECIAL_PROP3];
            }
            if (tmp) {
                return tmp;
            } else {
                return frameStack[0]; // return global scope
            }
        }

        this.record = function (prefix) {
            var ret = [];
            ret[F_TYPE] = getNumericType(prefix);
            ret[F_VALUE] = prefix;
            logValue(0, ret, N_LOG_SPECIAL);
        };


        this.command = function (rec) {
            traceWriter.remoteLog(rec);
        };

        this.RR_getConcolicValue = function (obj) {
            var val = getConcrete(obj);
            if (val === obj && val !== undefined && val !== null && HOP(val, SPECIAL_PROP)) {
                var id = val[SPECIAL_PROP][SPECIAL_PROP];
                if ((val = objectMap[id]) !== undefined) {
                    return val;
                } else {
                    return obj;
                }
            } else {
                return obj;
            }
        };

        this.RR_updateRecordedObject = function (obj) {
            var val = getConcrete(obj);
            if (val !== obj && val !== undefined && val !== null && HOP(val, SPECIAL_PROP)) {
                var id = val[SPECIAL_PROP][SPECIAL_PROP];
                objectMap[id] = obj;
            }
        };


        this.RR_evalBegin = function () {
            evalFrames.push(frame);
            frame = frameStack[0];
        };

        this.RR_evalEnd = function () {
            frame = evalFrames.pop();
        };


        this.syncPrototypeChain = function (iid, obj) {
            var proto;

            obj = getConcrete(obj);
            proto = obj.__proto__;
            var oid = this.RR_Load(iid, (proto && HOP(proto,SPECIAL_PROP))?proto[SPECIAL_PROP][SPECIAL_PROP]:undefined, undefined);
            if (oid) {
                if (Globals.mode === MODE_RECORD) {
                    obj[SPECIAL_PROP].__proto__ = proto[SPECIAL_PROP];
                } else if (Globals.mode === MODE_REPLAY) {
                    obj.__proto__ = getConcrete(objectMap[oid]);
                }
            }
        };

        this.RR_preG = function (iid, base, offset) {
            var base_c = getConcrete(base), tmp;
            offset = getConcrete(offset);
            if (offset === '__proto__') {
                return base_c;
            }

//                    var type = typeof base_c;
//                    if (type !== 'object' && type !== 'function') {
//                        return base_c;
//                    }

            if (this.RR_Load(iid, hasGetterSetter(base_c, offset, true), false)) {
                return base_c;
            }
            while (base_c !== null &&
                this.RR_Load(iid, !HOP(base_c, offset), !(base_c[SPECIAL_PROP] && HOP(base_c[SPECIAL_PROP], offset)))) {
                base_c = getConcrete(sandbox.G(iid, base_c, '__proto__'));
            }
            if (base_c === null) {
                base_c = getConcrete(base);
            }
            return base_c;
        };

        /**
         * getField
         */
        this.RR_G = function (iid, base_c, offset, val) {
            var type, tmp, mod_offset;

            offset = getConcrete(offset);
            mod_offset = (offset === '__proto__' ? SPECIAL_PROP + offset : offset);
            if (Globals.mode === MODE_RECORD) {
                if ((type = typeof base_c) === 'string' ||
                    type === 'number' ||
                    type === 'boolean') {
                    seqNo++;
                    return val;
                } else if (!HOP(base_c, SPECIAL_PROP)) {
                    return this.RR_L(iid, val, N_LOG_GETFIELD);
                } else if ((tmp = base_c[SPECIAL_PROP][mod_offset]) === val ||
                    // TODO what is going on with this condition? This is isNaN check
                    (val !== val && tmp !== tmp)) {
                    seqNo++;
                    return val;
                } else {
                    if (HOP(base_c, offset) && !hasGetterSetter(base_c, offset, false)) {
                        // add the field to the shadow value, so we don't need to log
                        // future reads.  Only do so if the property is defined directly
                        // on the object, to avoid incorrectly adding the property to
                        // the object directly during replay (see test prototype_property.js)
                        base_c[SPECIAL_PROP][mod_offset] = val;
                        return this.RR_L(iid, val, N_LOG_GETFIELD_OWN);
                    }
                    return this.RR_L(iid, val, N_LOG_GETFIELD);
                }
            } else if (Globals.mode === MODE_REPLAY) {
                var rec;
                if ((rec = traceInfo.getCurrent()) === undefined) {
                    traceInfo.next();
                    return val;
                } else {
                    val = this.RR_L(iid, val, N_LOG_GETFIELD);
                    // only add direct object properties
                    if (rec[F_FUNNAME] === N_LOG_GETFIELD_OWN) {
                        // do not store ConcreteValue to __proto__
                        base_c[offset] = (offset === '__proto__') ? getConcrete(val) : val;
                    }
                    return val;
                }
            } else {
                return val;
            }
        };


        this.RR_P = function (iid, base, offset, val) {
            if (Globals.mode === MODE_RECORD) {
                var base_c = getConcrete(base);
                if (HOP(base_c, SPECIAL_PROP)) {
                    base_c[SPECIAL_PROP][getConcrete(offset)] = val;
                }
            }
        };

        this.RR_W = function (iid, name, val) {
            if (Globals.mode === MODE_RECORD || Globals.mode === MODE_REPLAY) {
                getFrameContainingVar(name)[name] = val;
            }
        };

        this.RR_N = function (iid, name, val, isArgumentSync) {
            if (Globals.mode === MODE_RECORD || Globals.mode === MODE_REPLAY) {
                if (isArgumentSync === false || (isArgumentSync === true && Globals.isInstrumentedCaller)) {
                    frame[name] = val;
                } else if (isArgumentSync === true && !Globals.isInstrumentedCaller) {
                    frame[name] = undefined;
                }
            }
        };

        this.RR_R = function (iid, name, val) {
            var ret, trackedVal, trackedFrame, tmp;

            trackedFrame = getFrameContainingVar(name);
            trackedVal = trackedFrame[name];

            if (Globals.mode === MODE_RECORD) {
                if (trackedVal === val ||
                    (val !== val && trackedVal !== trackedVal) ||
                    (name === "this" && Globals.isInstrumentedCaller && !Globals.isConstructorCall)) {
                    seqNo++;
                    ret = val;
                } else {
                    trackedFrame[name] = val;
                    ret = this.RR_L(iid, val, N_LOG_READ);
                }
            } else if (Globals.mode === MODE_REPLAY) {
                if (traceInfo.getCurrent() === undefined) {
                    traceInfo.next();
                    if (name === "this" && Globals.isInstrumentedCaller && !Globals.isConstructorCall) {
                        ret = val;
                    } else {
                        ret = trackedVal;
                    }
                } else {
                    ret = trackedFrame[name] = this.RR_L(iid, val, N_LOG_READ);
                }
            } else {
                ret = val;
            }
            return ret;
        };

        this.RR_Load = function (iid, val, sval) {
            //var ret, trackedVal, trackedFrame, tmp;
            var ret;

            if (Globals.mode === MODE_RECORD) {
                if (sval === val ||
                    (val !== val && sval !== sval)) {
                    seqNo++;
                    ret = val;
                } else {
                    ret = this.RR_L(iid, val, N_LOG_LOAD);
                }
            } else if (Globals.mode === MODE_REPLAY) {
                if (traceInfo.getCurrent() === undefined) {
                    traceInfo.next();
                    ret = val;
                } else {
                    ret = this.RR_L(iid, val, N_LOG_LOAD);
                }
            } else {
                ret = val;
            }
            return ret;
        };

        this.RR_Fe = function (iid, val, dis) {
            var ret;
            if (Globals.mode === MODE_RECORD || Globals.mode === MODE_REPLAY) {
                frameStack.push(frame = {});
                frame[SPECIAL_PROP3] = val[SPECIAL_PROP3];
                if (!Globals.isInstrumentedCaller) {
                    if (Globals.mode === MODE_RECORD) {
                        var tmp = printableValue(val);
                        logValue(iid, tmp, N_LOG_FUNCTION_ENTER);
                        tmp = printableValue(dis);
                        logValue(iid, tmp, N_LOG_FUNCTION_ENTER);
                    } else if (Globals.mode === MODE_REPLAY) {
                        ret = traceInfo.getAndNext();
                        checkPath(ret, iid);
                        ret = traceInfo.getAndNext();
                        checkPath(ret, iid);
                        debugPrint("Index:" + traceInfo.getPreviousIndex());
                    }
                }
            }
        };

        this.RR_Fr = function (iid) {
            if (Globals.mode === MODE_RECORD || Globals.mode === MODE_REPLAY) {
                frameStack.pop();
                frame = frameStack[frameStack.length - 1];
                if (Globals.mode === MODE_RECORD && frameStack.length <= 1) {
                    traceWriter.flush();
                }
            }
        };

        this.RR_Se = function (iid, val) {
            var ret;
            if (Globals.mode === MODE_RECORD || Globals.mode === MODE_REPLAY) {
                frameStack.push(frame = {});
                frame[SPECIAL_PROP3] = frameStack[0];
                if (Globals.mode === MODE_RECORD) {
                    var tmp = printableValue(val);
                    logValue(iid, tmp, N_LOG_SCRIPT_ENTER);
                } else if (Globals.mode === MODE_REPLAY) {
                    ret = traceInfo.getAndNext();
                    checkPath(ret, iid);
                    debugPrint("Index:" + traceInfo.getPreviousIndex());
                }
            }
        };

        this.RR_Sr = function (iid) {
            if (Globals.mode === MODE_RECORD || Globals.mode === MODE_REPLAY) {
                frameStack.pop();
                frame = frameStack[frameStack.length - 1];
                if (Globals.mode === MODE_RECORD && frameStack.length <= 1) {
                    traceWriter.flush();
                }
            }
            if (Constants.isBrowserReplay) {
                this.RR_replay();
            }
        };

        this.RR_H = function (iid, val) {
            var ret;
            if (Globals.mode === MODE_RECORD) {
                ret = Object.create(null);
                for (var i in val) {
                    if (i !== SPECIAL_PROP && i !== SPECIAL_PROP2 && i !== SPECIAL_PROP3) {
                        ret[i] = 1;
                    }
                }
                var tmp = [];
                tmp[F_TYPE] = getNumericType(ret);
                tmp[F_VALUE] = ret;
                logValue(iid, tmp, N_LOG_HASH);
                val = ret;
            } else if (Globals.mode === MODE_REPLAY) {
                ret = traceInfo.getAndNext();
                checkPath(ret, iid);
                debugPrint("Index:" + traceInfo.getPreviousIndex());
                val = ret[F_VALUE];
                ret = Object.create(null);
                for (i in val) {
                    if (HOP(val, i)) {
                        ret[i] = 1;
                    }
                }
                val = ret;
            }
            return val;
        };


        this.RR_L = function (iid, val, fun) {
            var ret, tmp, old;
            if (Globals.mode === MODE_RECORD) {
                old = createdMockObject;
                createdMockObject = false;
                tmp = printableValue(val);
                logValue(iid, tmp, fun);
                if (createdMockObject) this.syncPrototypeChain(iid, val);
                createdMockObject = old;
            } else if (Globals.mode === MODE_REPLAY) {
                ret = traceInfo.getCurrent();
                checkPath(ret, iid, fun);
                traceInfo.next();
                debugPrint("Index:" + traceInfo.getPreviousIndex());
                old = createdMockObject;
                createdMockObject = false;
                val = syncValue(ret, val, iid);
                if (createdMockObject) this.syncPrototypeChain(iid, val);
                createdMockObject = old;
            }
            return val;
        };

        this.RR_T = function (iid, val, fun) {
            if ((Globals.mode === MODE_RECORD || Globals.mode === MODE_REPLAY) &&
                (fun === N_LOG_ARRAY_LIT || fun === N_LOG_FUNCTION_LIT || fun === N_LOG_OBJECT_LIT || fun === N_LOG_REGEXP_LIT)) {
//                    console.log("iid:"+iid)  // uncomment for divergence
                setLiteralId(val);
                if (fun === N_LOG_FUNCTION_LIT) {
                    if (Object && Object.defineProperty && typeof Object.defineProperty === 'function') {
                        Object.defineProperty(val, SPECIAL_PROP3, {
                            enumerable:false,
                            writable:true
                        });
                    }
                    val[SPECIAL_PROP3] = frame;
                }
            }
        };

        this.RR_replay = function () {
            if (Globals.mode === MODE_REPLAY) {
                while (true) {
                    var ret = traceInfo.getCurrent();
                    if (typeof ret !== 'object') {
                        if (Constants.isBrowserReplay) {
                            sandbox.endExecution();
                        }
                        return;
                    }
                    var f, prefix;
                    if (ret[F_FUNNAME] === N_LOG_SPECIAL) {
                        prefix = ret[F_VALUE];
                        traceInfo.next();
                        ret = traceInfo.getCurrent();
                        if (sandbox.analysis && sandbox.analysis.beginExecution) {
                            sandbox.analysis.beginExecution(prefix);
                        }
                    }
                    if (ret[F_FUNNAME] === N_LOG_FUNCTION_ENTER) {
                        f = getConcrete(syncValue(ret, undefined, 0));
                        ret = traceInfo.getNext();
                        var dis = syncValue(ret, undefined, 0);
                        f.call(dis);
                    } else if (ret[F_FUNNAME] === N_LOG_SCRIPT_ENTER) {
                        var path = getConcrete(syncValue(ret, undefined, 0));
                        if (Constants.isBrowserReplay) {
                            load(path);
                            return;
                        } else {
                            var pth = require('path');
                            var filep = pth.resolve(path);
                            require(filep);
                            // a browser can load a script multiple times.  So,
                            // we need to remove the script from Node's cache,
                            // in case it gets loaded again
                            require.uncache(filep);
                        }
                    } else {
                        return;
                    }
                }
            }
        };


        function TraceWriter() {
            var bufferSize = 0;
            var buffer = [];
            var traceWfh;
            var fs = (!Constants.isBrowser) ? require('fs') : undefined;
            var trying = false;
            var cb;
            var remoteBuffer = [];
            var socket, isOpen = false;
            // if true, in the process of doing final trace dump,
            // so don't record any more events
            var tracingDone = false;

            if (Constants.IN_MEMORY_TRACE) {
                // attach the buffer to the sandbox
                sandbox.trace_output = buffer;
            }

            function getFileHanlde() {
                if (traceWfh === undefined) {
                    traceWfh = fs.openSync(traceFileName, 'w');
                }
                return traceWfh;
            }

            /**
             * @param {string} line
             */
            this.logToFile = function (line) {
                if (tracingDone) {
                    // do nothing
                    return;
                }
                var len = line.length;
                // we need this loop because it's possible that len >= Config.MAX_BUF_SIZE
                // TODO fast path for case where len < Config.MAX_BUF_SIZE?
                var start = 0, end = len < Config.MAX_BUF_SIZE ? len : Config.MAX_BUF_SIZE;
                while (start < len) {
                    var chunk = line.substring(start, end);
                    var curLen = end - start;
                    if (bufferSize + curLen > Config.MAX_BUF_SIZE) {
                        this.flush();
                    }
                    buffer.push(chunk);
                    bufferSize += curLen;
                    start = end;
                    end = (end + Config.MAX_BUF_SIZE < len) ? end + Config.MAX_BUF_SIZE : len;
                }
            };

            this.flush = function () {
                if (Constants.IN_MEMORY_TRACE) {
                    // no need to flush anything
                    return;
                }
                var msg;
                if (!Constants.isBrowser) {
                    var length = buffer.length;
                    for (var i = 0; i < length; i++) {
                        fs.writeSync(getFileHanlde(), buffer[i]);
                    }
                } else {
                    msg = buffer.join('');
                    if (msg.length > 1) {
                        this.remoteLog(msg);
                    }
                }
                bufferSize = 0;
                buffer = [];
            };


            function openSocketIfNotOpen() {
                if (!socket) {
                    console.log("Opening connection");
                    socket = new WebSocket('ws://127.0.0.1:8080', 'log-protocol');
                    socket.onopen = tryRemoteLog;
                    socket.onmessage = tryRemoteLog2;
                }
            }

            /**
             * invoked when we receive a message over the websocket,
             * indicating that the last trace chunk in the remoteBuffer
             * has been received
             */
            function tryRemoteLog2() {
                trying = false;
                remoteBuffer.shift();
                if (remoteBuffer.length === 0) {
                    if (cb) {
                        cb();
                        cb = undefined;
                    }
                }
                tryRemoteLog();
            }

            this.onflush = function (callback) {
                if (remoteBuffer.length === 0) {
                    if (callback) {
                        callback();
                    }
                } else {
                    cb = callback;
                    tryRemoteLog();
                }
            };

            function tryRemoteLog() {
                isOpen = true;
                if (!trying && remoteBuffer.length > 0) {
                    trying = true;
                    socket.send(remoteBuffer[0]);
                }
            }

            this.remoteLog = function (message) {
                if (message.length > Config.MAX_BUF_SIZE) {
                    throw new Error("message too big!!!");
                }
                remoteBuffer.push(message);
                openSocketIfNotOpen();
                if (isOpen) {
                    tryRemoteLog();
                }
            };

            /**
             * stop recording the trace and flush everything
             */
            this.stopTracing = function () {
                tracingDone = true;
                if (!Constants.IN_MEMORY_TRACE) {
                    this.flush();
                }
            };
        }


        function TraceReader() {

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
                        traceFh = new FileLineReader(traceFileName);
                        // change working directory to wherever trace file resides
                        var pth = require('path');
                        var traceFileDir = pth.dirname(pth.resolve(process.cwd(), traceFileName));
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

        this.setTraceFileName = function (tFN) {
            traceFileName = tFN;
        }


        if (Globals.mode === MODE_REPLAY) {
            traceInfo = new TraceReader();
            this.addRecord = traceInfo.addRecord;
        } else if (Globals.mode === MODE_RECORD) {
            traceWriter = new TraceWriter();
            this.onflush = traceWriter.onflush;
            if (Constants.isBrowser) {
                if (!Constants.IN_MEMORY_TRACE) {
                    this.command('reset');
                }
                // enable keyboard shortcut to stop tracing
                window.addEventListener('keydown', function (e) {
                    // keyboard shortcut is Alt-Shift-T for now
                    if (e.altKey && e.shiftKey && e.keyCode === 84) {
                        traceWriter.stopTracing();
                        traceWriter.onflush(function () {
                            if (Config.LOG_ALL_READS_AND_BRANCHES) console.save(Globals.loadAndBranchLogs, "readAndBranchLogs.record");
                            alert("trace flush complete");
                        });
                    }
                });
            }
        }
    }

    if (!sandbox.Constants.isBrowser && typeof require === 'function') {
        /**
         * remove a loaded module from Node's cache
         * @param moduleName the name of the module
         */
        require.uncache = function (moduleName) {
            require.searchCache(moduleName, function (mod) {
                delete require.cache[mod.id];
            });
        };

        /**
         * apply an operation to a module already loaded and
         * cached by Node
         * @param moduleName the name of the module
         * @param callback the operation to perform
         */
        require.searchCache = function (moduleName, callback) {
            var mod = require.resolve(moduleName);

            if (mod && ((mod = require.cache[mod]) !== undefined)) {
                (function run(mod) {
                    mod.children.forEach(function (child) {
                        run(child);
                    });
                    callback(mod);
                })(mod);
            }
        };
    }


    if (typeof module !== 'undefined') {
        module.exports = sandbox.RecordReplayEngine;
    }

    //----------------------------------- End Record Replay Engine ---------------------------------
}(J$));

//----------------------------------- End Record Replay Engine ---------------------------------


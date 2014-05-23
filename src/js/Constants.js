if (typeof J$ === 'undefined') {
    J$ = {};
}

(function (sandbox) {
    var Constants = sandbox.Constants = {};

    Constants.isBrowser = !(typeof exports !== 'undefined' && this.exports !== exports);

    Constants.IN_MEMORY_TRACE = Constants.isBrowser && (window.__JALANGI_IN_MEMORY_TRACE__);

    var APPLY = Constants.APPLY = Function.prototype.apply;
    var CALL = Constants.CALL = Function.prototype.call;
    APPLY.apply = APPLY;
    APPLY.call = CALL;
    CALL.apply = APPLY;
    CALL.call = CALL;

    var HAS_OWN_PROPERTY = Constants.HAS_OWN_PROPERTY = Object.prototype.hasOwnProperty;
    Constants.HAS_OWN_PROPERTY_CALL = Object.prototype.hasOwnProperty.call;


    var PREFIX1 = "J$";
    Constants.SPECIAL_PROP = "*" + PREFIX1 + "*";
    Constants.SPECIAL_PROP2 = "*" + PREFIX1 + "I*";
    Constants.SPECIAL_PROP3 = "*" + PREFIX1 + "C*";
    Constants.SPECIAL_PROP4 = "*" + PREFIX1 + "W*";

    Constants.MODE_RECORD = 1;
    Constants.MODE_REPLAY = 2;
    Constants.MODE_NO_RR_IGNORE_UNINSTRUMENTED = 3;
    Constants.MODE_NO_RR = 4;
    Constants.MODE_DIRECT = 5;

    Constants.T_NULL = 0;
    Constants.T_NUMBER = 1;
    Constants.T_BOOLEAN = 2;
    var T_STRING = Constants.T_STRING = 3;
    Constants.T_OBJECT = 4;
    Constants.T_FUNCTION = 5;
    Constants.T_UNDEFINED = 6;
    Constants.T_ARRAY = 7;

    var F_TYPE = Constants.F_TYPE = 0;
    var F_VALUE = Constants.F_VALUE = 1;
    Constants.F_IID = 2;
    Constants.F_SEQ = 3;
    Constants.F_FUNNAME = 4;

    Constants.UNKNOWN = -1;

    Constants.N_LOG_FUNCTION_ENTER = 4;
    Constants.N_LOG_SCRIPT_ENTER = 6;
    Constants.N_LOG_GETFIELD = 8;
    Constants.N_LOG_ARRAY_LIT = 10;
    Constants.N_LOG_OBJECT_LIT = 11;
    Constants.N_LOG_FUNCTION_LIT = 12;
    Constants.N_LOG_RETURN = 13;
    Constants.N_LOG_REGEXP_LIT = 14;
    Constants.N_LOG_READ = 17;
    Constants.N_LOG_LOAD = 18;
    Constants.N_LOG_HASH = 19;
    Constants.N_LOG_SPECIAL = 20;
    Constants.N_LOG_STRING_LIT = 21;
    Constants.N_LOG_NUMBER_LIT = 22;
    Constants.N_LOG_BOOLEAN_LIT = 23;
    Constants.N_LOG_UNDEFINED_LIT = 24;
    Constants.N_LOG_NULL_LIT = 25;
    // property read *directly* from an object (not from the prototype chain)
    Constants.N_LOG_GETFIELD_OWN = 26;
    Constants.N_LOG_OPERATION = 27;

    //-------------------------------- End constants ---------------------------------

    //-------------------------------------- Constant functions -----------------------------------------------------------

    Constants.getConcrete = function (val) {
        if (sandbox.analysis && sandbox.analysis.getConcrete) {
            return sandbox.analysis.getConcrete(val);
        } else {
            return val;
        }
    }

    Constants.getSymbolic = function (val) {
        if (sandbox.analysis && sandbox.analysis.getSymbolic) {
            return sandbox.analysis.getSymbolic(val);
        } else {
            return val;
        }
    }

    var HOP = Constants.HOP = function (obj, prop) {
        return (prop + "" === '__proto__') || CALL.call(HAS_OWN_PROPERTY, obj, prop); //Constants.HAS_OWN_PROPERTY_CALL.apply(Constants.HAS_OWN_PROPERTY, [obj, prop]);
    }

    Constants.hasGetterSetter = function (obj, prop, isGetter) {
        if (typeof Object.getOwnPropertyDescriptor !== 'function') {
            return true;
        }
        while (obj !== null) {
            if (typeof obj !== 'object' && typeof obj !== 'function') {
                return false;
            }
            var desc = Object.getOwnPropertyDescriptor(obj, prop);
            if (desc !== undefined) {
                if (isGetter && typeof desc.get === 'function') {
                    return true;
                }
                if (!isGetter && typeof desc.set === 'function') {
                    return true;
                }
            } else if (HOP(obj, prop)) {
                return false;
            }
            obj = obj.__proto__;
        }
        return false;
    }

    Constants.debugPrint = function (s) {
        if (sandbox.Config.DEBUG) {
            console.log("***" + s);
        }
    }

    Constants.warnPrint = function (iid, s) {
        if (sandbox.Config.WARN && iid !== 0) {
            console.log("        at " + iid + " " + s);
        }
    }

    Constants.seriousWarnPrint = function (iid, s) {
        if (sandbox.Config.SERIOUS_WARN && iid !== 0) {
            console.log("        at " + iid + " Serious " + s);
        }
    }

    Constants.encodeNaNandInfForJSON = function (key, value) {
        if (value === Infinity) {
            return "Infinity";
        } else if (value !== value) {
            return "NaN";
        }
        return value;
    }

    Constants.decodeNaNandInfForJSON = function (key, value) {
        if (value === "Infinity") {
            return Infinity;
        } else if (value === 'NaN') {
            return NaN;
        } else {
            return value;
        }
    }

    Constants.fixForStringNaN = function (record) {
        if (record[F_TYPE] == T_STRING) {
            if (record[F_VALUE] !== record[F_VALUE]) {
                record[F_VALUE] = 'NaN';
            } else if (record[F_VALUE] === Infinity) {
                record[F_VALUE] = 'Infinity';
            }

        }
    }

})(J$);


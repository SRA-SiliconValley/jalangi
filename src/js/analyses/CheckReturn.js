

(function (sandbox) {
    function CheckReturn() {
//        this.installAxiom = function (c) {};
//
        this.makeConcolic = function (idx, val, getNextSymbol) {
            return val;
        };
//
//        this.makeConcolicPost = function () {};
//
//        this.declare = function (iid, name, val, isArgument) {};
//
//        this.literalPre = function (iid, val) {};
//
        this.literal = function (iid, val) {
            return val;
        };
//
//        this.invokeFunPre = function (iid, f, base, args, isConstructor) {};
//
        this.invokeFun = function (iid, f, base, args, val, isConstructor) {
            return val;
        };
//
//        this.getFieldPre = function (iid, base, offset) {};
//
        this.getField = function (iid, base, offset, val) {
            return val;
        }
//
        this.putFieldPre = function (iid, base, offset, val) {
            return val;
        };
//
        this.putField = function (iid, base, offset, val) {
            return val;
        };
//
//        this.readPre = function (iid, name, val, isGlobal) {};
//
        this.read = function (iid, name, val, isGlobal) {
            return val;
        };
//
//        this.writePre = function (iid, name, val, oldValue) {};
//
        this.write = function (iid, name, val, oldValue) {
            return val;
        };
//
//        this.binaryPre = function (iid, op, left, right) {};
//
        this.binary = function (iid, op, left, right, result_c) {
            return result_c;
        };
//
//        this.unaryPre = function (iid, op, left) {};
//
        this.unary = function (iid, op, left, result_c) {
            return result_c;
        };
//
//        this.conditionalPre = function (iid, left) {};
//
        this.conditional = function (iid, left, result_c) {
            return left;
        };
//
//        this.beginExecution = function (data) {};
//
//        this.endExecution = function () {};

//        this.functionEnter = function (iid, fun, dis /* this */, args) {};
//
        this.functionExit = function (iid) {
            return false;
            /* a return of false means that do not backtrack inside the function */
        };
//
        this.return_ = function (val) {
            return val;
        };
//
//        this.scriptEnter = function (iid, fileName) {};
//
//        this.scriptExit = function (iid) {};
//
        this.instrumentCode = function(iid, code) {
            return code;
        };


    }

//    sandbox.analysis = new UndefinedOffset();
    sandbox.analysis = new CheckReturn();
}(J$));

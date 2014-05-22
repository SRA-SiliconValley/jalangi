// Author: Koushik Sen


(function (sandbox) {
    function LogPutFieldsAndStores() {
        var smemory = sandbox.smemory;
        var Constants = sandbox.Constants;
        var id = 0;
        var trace = [];


        function getUniqueId(obj) {
            var sobj = smemory.getShadowObject(obj);

            if (sobj) {
                if (sobj.id) {
                    return sobj.id;
                } else {
                    sobj.id = ++id;
                    return id;
                }
            }
            return 0;
        }

        function foo() {

        }
//        this.installAxiom = function (c) {};
//
//        this.makeConcolic = function (idx, val, getNextSymbol) {
//            return val;
//        };
//
//        this.makeConcolicPost = function () {};
//
        this.declare = function (iid, name, val, isArgument) {
            var id1, id2;

            id1 = getUniqueId(smemory.getCurrentFrame());
            id2 = getUniqueId(val);
            foo("declare("+iid+","+id1+","+name+","+id2+","+isArgument+")");
        };
//
//        this.literalPre = function (iid, val) {};
//
        this.literal = function (iid, val) {
            var id;
            if (id = getUniqueId(val)) {
                foo("createObject("+iid+","+id+")");
            }
            return val;
        };
//
//        this.invokeFunPre = function (iid, f, base, args, isConstructor) {};
//
        this.invokeFun = function (iid, f, base, args, val, isConstructor) {
            var id;
            if (isConstructor && (id = getUniqueId(val))) {
                foo("createObject("+iid+","+id+")");
            }
            return val;
        };

//        this.getFieldPre = function (iid, base, offset) {
//            if (offset === undefined)
//                info[iid] = (info[iid]|0) + 1;
//        };
//
//        this.getField = function (iid, base, offset, val) {
//            return val;
//        };
//
//        this.putFieldPre = function (iid, base, offset, val) {
//            if (offset === undefined)
//                info[iid] = (info[iid]|0) + 1;
//            return val;
//        };
//
        this.putField = function (iid, base, offset, val) {
            var id1, id2;

            id1 = getUniqueId(base);
            id2 = getUniqueId(val);
            foo("putField("+iid+","+id1+","+offset+","+id2+")");
            return val;
        };
//
//        this.readPre = function (iid, name, val, isGlobal) {};
//
//        this.read = function (iid, name, val, isGlobal) {
//            return val;
//        };
//
//        this.writePre = function (iid, name, val, oldValue) {};
//
        this.write = function (iid, name, val, oldValue) {
            var id1, id2;

            id1 = getUniqueId(smemory.getFrame(name));
            id2 = getUniqueId(val);
            foo("write("+iid+","+id1+","+name+","+id2+")");
            return val;
        };
//
//        this.binaryPre = function (iid, op, left, right) {};
//
//        this.binary = function (iid, op, left, right, result_c) {
//            return result_c;
//        };
//
//        this.unaryPre = function (iid, op, left) {};
//
//        this.unary = function (iid, op, left, result_c) {
//            return result_c;
//        };
//
//        this.conditionalPre = function (iid, left) {};
//
//        this.conditional = function (iid, left, result_c) {
//            return left;
//        };
//
//        this.beginExecution = function (data) {};
//
//        this.endExecution = function () {
//        };

        this.functionEnter = function (iid, fun, dis /* this */) {
            var id;
            if (id = getUniqueId(smemory.getCurrentFrame())) {
                foo("createFrame("+iid+","+id+")");
            }
        };
//
//        this.functionExit = function (iid) {
//            return false;
//            /* a return of false means that do not backtrack inside the function */
//        };
//
//        this.return_ = function (val) {
//            return val;
//        };
//
//        this.scriptEnter = function (iid, fileName) {};
//
//        this.scriptExit = function (iid) {};
//
//        this.instrumentCode = function(iid, code) {
//            return code;
//        };


    }

//    sandbox.analysis = new UndefinedOffset();
    sandbox.analysis = new LogPutFieldsAndStores();
}(J$));

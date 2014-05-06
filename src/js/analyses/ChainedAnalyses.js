
(function (sandbox) {
    function ChainedAnalyses() {
        var Constants = sandbox.Constants;
        var HOP = Constants.HOP;

        var analysisList = [];

        var funList = ["installAxiom", "makeConcolic", "makeConcolicPost", "declare", "literalPre", "literal",
            "invokeFunPre", "invokeFun", "getFieldPre", "getField", "putFieldPre", "putField",
            "readPre", "read", "writePre", "write", "binaryPre", "binary", "unaryPre", "unary",
            "conditionalPre", "conditional", "beginExecution", "endExecution", "functionEnter", "functionExit",
            "scriptEnter", "scriptExit", "return_", "instrumentCode"
        ];

        this.addAnalysis = function(analysis) {
            var self = this;
            for (var f in funList) {
                if (HOP(funList,f)) {
                    if (analysis[f]) {
                        (function(fld) {
                            var af = analysis[fld];
                            var old = self[fld];
                            self[fld] = function () {
                                if (old) {
                                    var ret1 = old.apply(self, arguments);
                                }
                                var ret2 = af.apply(analysis, arguments);
                                if (old && ret1 !== ret2 && !(isNaN(ret1) && isNaN(ret2))) {
                                    throw new Error("Return value of "+f+" must be same from all analyses: "+ret1+" !== "+ret2);
                                }
                                return ret2;
                            }
                        }(f));
                    }
                }
            }
        };

//        this.installAxiom = function (c) {};
//
//        this.makeConcolic = function (idx, val, getNextSymbol) {
//            return val;
//        };
//
//        this.makeConcolicPost = function () {};
//
//        this.declare = function (iid, name, val, isArgument) {};
//
//        this.literalPre = function (iid, val) {};
//
//        this.literal = function (iid, val) {};
//
//        this.invokeFunPre = function (iid, f, base, args, isConstructor) {};
//
//        this.invokeFun = function (iid, f, base, args, val, isConstructor) {
//            return val;
//        };
//
//        this.getFieldPre = function (iid, base, offset) {};
//
//        this.getField = function (iid, base, offset, val) {
//            return val;
//        }
//
//        this.putFieldPre = function (iid, base, offset, val) {
//            return val;
//        };
//
//        this.putField = function (iid, base, offset, val) {
//            return val;
//        };
//
//        this.readPre = function (iid, name, val, isGlobal) {};
//
//        this.read = function (iid, name, val, isGlobal) {
//            return val;
//        };
//
//        this.writePre = function (iid, name, val, oldValue) {};
//
//        this.write = function (iid, name, val, oldValue) {
//            return val;
//        };
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
//        this.endExecution = function () {};
//
//        this.functionEnter = function (iid, fun, dis /* this */) {};
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

    if (sandbox.Constants.isBrowser) {
        sandbox.analysis = new ChainedAnalyses();
        window.addEventListener('keydown', function (e) {
            // keyboard shortcut is Alt-Shift-T for now
            if (e.altKey && e.shiftKey && e.keyCode === 84) {
                sandbox.analysis.endExecution();
            }
        });
    } else {
        module.exports = ChainedAnalyses;
    }

}(J$));

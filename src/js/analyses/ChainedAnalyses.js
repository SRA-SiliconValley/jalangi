
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
            var self = this, tmp;

            for (var f in funList) {
                if (HOP(funList,f)) {
                    var field = funList[f];
                    if (tmp=analysis[field]) {
                        var fun = self[field];
                        if (!fun) {
                            fun = self[field] = function() {
                                var ret1, ret2;
                                var thisFun = arguments.callee;
                                var len = thisFun.afs.length;
                                var args = Array.prototype.slice.call(arguments,0)
                                ret1 = thisFun.afs[0].apply(thisFun.afThis[0],args);

                                for(var i=1; i<len; i++) {
                                    ret2 = thisFun.afs[i].apply(thisFun.afThis[i],args);
                                    if (ret1 !== ret2 && !(isNaN(ret1) && isNaN(ret2))) {
                                        throw new Error("Return value of "+thisFun.afName+" must be same for all analyses "+ret1+" !== "+ret2);
                                    }
                                }
                                return ret1;
                            };
                            fun.afs = [];
                            fun.afThis = [];
                            fun.afName = field;
                        }
                        fun.afs.push(tmp);
                        fun.afThis.push(analysis);
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

    var thisAnalysis = new ChainedAnalyses();
    Object.defineProperty(sandbox, 'analysis', {
        get: function() {
            return thisAnalysis;
        },
        set: function(a) {
            thisAnalysis.addAnalysis(a);
        }
    });

    sandbox.analysis = new ChainedAnalyses();
    if (sandbox.Constants.isBrowser) {
        window.addEventListener('keydown', function (e) {
            // keyboard shortcut is Alt-Shift-T for now
            if (e.altKey && e.shiftKey && e.keyCode === 84) {
                sandbox.analysis.endExecution();
            }
        });
    }

}(J$));

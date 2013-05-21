/*
 * Copyright 2013 Samsung Information Systems America, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Author: Koushik Sen

(function(sandbox){
    var prefix1 = "J$";
    var fileSuffix1 = "_jalangi_";
    var COVERAGE_FILE_NAME = "jalangi_coverage";
    var SMAP_FILE_NAME = "jalangi_sourcemap.js";
    var logFunctionEnterFunName = prefix1+".Fe";
    var logFunctionReturnFunName = prefix1+".Fr";
    var logFunCallFunName = prefix1+".F";
    var logMethodCallFunName = prefix1+".M";
    var logAssignFunName = prefix1+".A";
    var logPutFieldFunName = prefix1+".P";
    var logGetFieldFunName = prefix1+".G";
    var logScriptEntryFunName = prefix1+".Se";
    var logScriptExitFunName = prefix1+".Sr";
    var logReadFunName = prefix1+".R";
    var logWriteFunName = prefix1+".W";
    var logIFunName = prefix1+".I";
    var logHashFunName = prefix1+".H";
    var logLitFunName = prefix1+".T";
    var logInitFunName = prefix1+".N";

    var logBinaryOpFunName = prefix1+".B";
    var logUnaryOpFunName = prefix1+".U";
    var logConditionalFunName = prefix1+".C";
    var logSwitchLeftFunName = prefix1+".C1";
    var logSwitchRightFunName = prefix1+".C2";
    var logLastFunName = prefix1+"._";

    var instrumentCodeFunName = prefix1+".instrumentCode";



    var rp = prefix1+"_";

//    var N_LOG_LOAD = 0,
//    var N_LOG_FUN_CALL = 1,
//        N_LOG_METHOD_CALL = 2,
      var  N_LOG_FUNCTION_ENTER = 4,
//        N_LOG_FUNCTION_RETURN = 5,
        N_LOG_SCRIPT_ENTER = 6,
//        N_LOG_SCRIPT_EXIT = 7,
        N_LOG_GETFIELD = 8,
//        N_LOG_GLOBAL = 9,
        N_LOG_ARRAY_LIT = 10,
        N_LOG_OBJECT_LIT = 11,
        N_LOG_FUNCTION_LIT = 12,
        N_LOG_RETURN = 13,
        N_LOG_REGEXP_LIT = 14,
//        N_LOG_LOCAL = 15,
//        N_LOG_OBJECT_NEW = 16,
        N_LOG_READ = 17,
//        N_LOG_FUNCTION_ENTER_NORMAL = 18,
        N_LOG_HASH = 19,
        N_LOG_SPECIAL = 20,
        N_LOG_STRING_LIT = 21,
        N_LOG_NUMBER_LIT = 22,
        N_LOG_BOOLEAN_LIT = 23,
        N_LOG_UNDEFINED_LIT = 24,
        N_LOG_NULL_LIT = 25;


    var SPECIAL_PROP = "*"+prefix1+"*";



    var filename;

    var scope;

    var MAP, curry, slice;

    function initUglify() {
        if (typeof uglify === "undefined") {
            uglify = (function(){
                var fs = require("fs");
                var path = require('path');
                var uglify = require("uglify-js");

                var getCode = function(filename) {
                    return fs.readFileSync(filename, "utf8");
                }

                var saveCode = function(code, filename) {
                    var preFile = path.resolve(__dirname,'../analysis.js');
                    var inputManagerFile = path.resolve(__dirname,'../InputManager.js');
                    var thisFile = path.resolve(__filename);
                    var inputFile = path.resolve(process.cwd()+"/inputs.js");

                    var n_code =                     'if (typeof window ==="undefined") {\n' +
                        'require("'+preFile+'");\n' +
                        'require("'+inputManagerFile+'");\n' +
                        'require("'+thisFile+'");\n' +
                        'require("'+inputFile+'");\n' +
                        '}\n'+
                        code;
                    fs.writeFileSync(filename.replace(".js",fileSuffix1+".js"), n_code,"utf8");
                    fs.writeFileSync(COVERAGE_FILE_NAME, JSON.stringify({"covered":0, "branches":condCount/inc*2, "coverage":[]}),"utf8");
                }


                return {
                    "parser":uglify.parser,
                    "uglify":uglify.uglify,
                    "getCode": getCode,
                    "saveCode": saveCode
                }
            })();
        }

        MAP || (MAP = uglify.uglify.MAP);
        curry || (curry = uglify.parser.curry);
        slice || (slice = uglify.parser.slice);

    }



    function HOP(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    function ast_to_string(arr,level) {
        var dumped_text = "";
        if(!level) level = 0;

        var level_padding = "";
        for(var j=0;j<level+1;j++) level_padding += "    ";

        if(typeof(arr) == 'object') { //Array/Hashes/Objects
            for(var item in arr) {
                var value = arr[item];

                if (value===null) {
                    dumped_text += level_padding + null + ",\n";
                } else  if(typeof(value) === 'object') { //If it is an array,
                    dumped_text += level_padding + "[\n";
                    dumped_text += ast_to_string(value,level+1);
                    dumped_text += level_padding + "],\n";
                } else if (typeof value === 'string') {
                    dumped_text += level_padding + "\"" + value + "\",\n";
                } else if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'undefined') {
                    dumped_text += level_padding + value + ",\n";
                }
            }
            dumped_text = dumped_text.substring(0,dumped_text.length-2)+'\n';
        } else { //Stings/Chars/Numbers etc.
            dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
        }
        return dumped_text;
    }

    function slice(a, start) {
        return Array.prototype.slice.call(a, start || 0);
    };

    function compose(f1,f2) {
        return function() {
            return f1(f2.apply(null,arguments));
        }
    }



    function replaceInStatements(code) {
        var ast = uglify.parser.parse(code);
        var w = uglify.uglify.ast_walker();
        var asts = arguments;
        var walk = w.walk;

        var ret = w.with_walkers({
            "name"     : function(name) {
                if (name.indexOf(rp) === 0) {
                    var i = parseInt(name.substring(rp.length));
                    return asts[i];
                }
            },
            "stat" : function(stat) {
                if (stat) {
                    if (stat.length === 2) {
                        if (stat[0].toString() === "name" && stat[1].indexOf(rp) === 0) {
                            var i = parseInt(stat[1].substring(rp.length));
                            return ["splice", asts[i]];
                        }
                    }
                }
                return [this[0], walk(stat)];
            }
        }, function(){
            return walk(ast);
        });
        return ret[1];
    }

    function replaceInExpr() {
        return replaceInStatements.apply(this,arguments)[0][1];
    }

    function createNameAst(name) {
        return ["name", name];
    }

    function createStringAst(name) {
        return ["string", name];
    }

    function createNumberAst(num) {
        return ["num", num];
    }


    var inc = 4;
    var condCount = 0+inc;
    var iid = 1+inc;
    var opIid = 2+inc;

    function getIid() {
        var tmpIid = iid;
        iid = iid + inc;
        return ["num", tmpIid];
    }

    function getPrevIidNoInc() {
        return ["num", iid-inc];
    }

    function getCondIid() {
        var tmpIid = condCount;
        condCount = condCount + inc;
        return ["num", tmpIid];
    }

    function getOpIid() {
        var tmpIid = opIid;
        opIid = opIid + inc;
        return ["num", tmpIid];
    }

    var tokenStack = [];

    function findValidAst0(ast0) {
        if (ast0 && ast0.start) {
            return ast0;
        } else {
            var i = tokenStack.length-1;
            for (; i >=0; i--) {
                var ret = tokenStack[i];
                if (ret && ret.start) {
                    return ret;
                }
            }
        }
        return ast0;
    }

    function printLineInfoAux(i,ast0) {
        ast0 = findValidAst0(ast0);
        if (ast0 && ast0.start) {
            writeLine('iids['+i+'] = [filename,'+(ast0.start.line+1)+","+(ast0.start.col+1)+"];\n");
        }
//        else {
//            console.log(i+":undefined:undefined");
//        }
    }

    function printLineInfo(ast0) {
        printLineInfoAux(iid, ast0);
    }

    function printLineInfo2(ast0) {
        printLineInfoAux(opIid, ast0);
    }

    function printLineInfo3(ast0) {
        printLineInfoAux(condCount, ast0);
    }

    var traceWfh;
    var fs;

    function openFile() {
        if (traceWfh === undefined) {
            fs = require('fs');
            traceWfh = fs.openSync(SMAP_FILE_NAME, 'w');
        }
    }

    function writeLine(str) {
        if (traceWfh) {
            fs.writeSync(traceWfh, str);
        }
    }


    function closeFile() {
        if (traceWfh) {
            fs.closeSync(traceWfh);
        }
    }

    function instrument(code, noTryCatchAtTop) {
        function createCallPutField(base,offset,rvalue) {
            return replaceInExpr(
                logPutFieldFunName+
                    "("+rp+"1, "+rp+"2, "+rp+"3, "+rp+"4)",
                getIid(),
                base,
                offset,
                rvalue
            );
        }

        function createCallAssign(base,offset,op,rvalue) {
            return replaceInExpr(
                logAssignFunName+"("+rp+"1,"+rp+"2,"+rp+"3,"+rp+"4)("+rp+"5)",
                getIid(),
                base,
                offset,
                createStringAst(op),
                rvalue
            );
        }

        function createCallMethodCall(base,offset, isCtor) {
            return replaceInExpr(
                logMethodCallFunName+"("+rp+"1, "+rp+"2, "+rp+"3, "+(isCtor?"true":"false")+")",
                getIid(),
                base,
                offset
            );
        }

        function createCallFunCall(ast, isCtor) {
            return replaceInExpr(
                logFunCallFunName+"("+rp+"1, "+rp+"2, "+(isCtor?"true":"false")+")",
                getIid(),
                ast
            );
        }

        function createCallGetField(base, offset) {
            return replaceInExpr(
                logGetFieldFunName+"("+rp+"1, "+rp+"2, "+rp+"3)",
                getIid(),
                base,
                offset
            );
        }

        function createCallRead(name, val, isReUseIid) {
            return replaceInExpr(
                logReadFunName+"("+rp+"1, "+rp+"2, "+rp+"3)",
                isReUseIid?getPrevIidNoInc():getIid(),
                name,
                val
            );
        }

        function createCallWriteAsStatement(name, val) {
            var ret =replaceInStatements(
                logWriteFunName+"("+rp+"1, "+rp+"2, "+rp+"3)",
                getIid(),
                name,
                val
            );
            return ret;
        }

        function createCallInitAsStatement(name, val, isArgumentSync) {
            var ret =replaceInStatements(
                logInitFunName+"("+rp+"1, "+rp+"2, "+rp+"3, "+isArgumentSync+")",
                getIid(),
                name,
                val
            );
            return ret;
        }

        function createCallWrite(name, val) {
            return replaceInExpr(
                logWriteFunName+"("+rp+"1, "+rp+"2, "+rp+"3)",
                getIid(),
                name,
                val
            );
        }

        function createCallLogLit(ast, funId) {
            return  replaceInExpr(
                logLitFunName+"("+rp+"1, "+rp+"2, "+rp+"3)",
                getIid(),
                ast,
                createNumberAst(funId)
            );
        }


        function createCallHash(ast) {
            return  replaceInExpr(
                logHashFunName+"("+rp+"1, "+rp+"2)",
                getIid(),
                ast
            );
        }


        function createCallInstrumentCode(ast) {
            return  replaceInExpr(
                instrumentCodeFunName+"("+prefix1+".getConcrete("+rp+"1), true)",
                ast
            );
        }

        function readWithUndefinedCheck(name) {
            return replaceInExpr(
                "("+logIFunName+"(typeof ("+rp+"1) === 'undefined')? "+rp+"2 : "+rp+"3)",
                createNameAst(name),
                createCallRead(createStringAst(name),createNameAst("undefined")),
                createCallRead(createStringAst(name),createNameAst(name), true)
            );
        }

        function createCallLogFunctionEntryExit(ast, this0) {
            printLineInfo(this0);
            var body = replaceInStatements(
                logFunctionEnterFunName+"("+rp+"1,arguments.callee, this)",
                getIid()
            ).concat(syncDefuns(scope, false, this0)).concat(ast);
            printLineInfo(this0);
            return replaceInStatements(
                "try {"+rp+"1} catch("+prefix1+
                    "e) { console.log("+prefix1+"e); console.log("+
                    prefix1+"e.stack); throw "+prefix1+
                    "e; } finally { "+logFunctionReturnFunName+"("+
                    rp+"2); }", body,
                getIid()
            );
        }

        function createCallLogScriptEntryExit(ast, this0) {
            var modFile = (typeof filename === "string")?filename.replace(".js",fileSuffix1+".js"):"internal";
            printLineInfo(this0);
            var body = replaceInStatements(logScriptEntryFunName+"("+rp+"1,"+rp+"2)",
                getIid(),
                createStringAst(modFile)).
                concat(syncDefuns(scope,true, this0)).
                concat(ast);
            printLineInfo(this0);
            return [
                "toplevel",
                replaceInStatements(
                    "try {"+rp+"1} catch("+prefix1+
                        "e) { console.log("+prefix1+"e); console.log("+
                        prefix1+"e.stack); throw "+prefix1+
                        "e; } finally { "+logScriptExitFunName+"("+
                        rp+"2); }",
                    body,
                    getIid()
                )
            ];
        }


        function syncDefuns(scope, isScript, this0) {
            var ret = [];
            printLineInfo(this0);
            //ret = ret.concat(createCallInitAsStatement(createStringAst("this"), createNameAst("this"), true));
            if(!isScript) {
                printLineInfo(this0);
                ret = ret.concat(createCallInitAsStatement(createStringAst("arguments"), createNameAst("arguments"), true));
            }
            for (var name in scope.names) {
                if (HOP(scope.names,name)) {
                    if (scope.names[name].toString() ==="defun") {
                        printLineInfo(this0);
                        ret = ret.concat(createCallInitAsStatement(createStringAst(name), createCallLogLit(createNameAst(name), N_LOG_FUNCTION_LIT), false));
                    }
                    if (scope.names[name].toString() ==="arg") {
                        printLineInfo(this0);
                        ret = ret.concat(createCallInitAsStatement(createStringAst(name), createNameAst(name), true));
                    }
                    if (scope.names[name].toString() ==="var") {
                        printLineInfo(this0);
                        ret = ret.concat(createCallInitAsStatement(createStringAst(name), createNameAst(name), false));
                    }
                }
            }
            return ret;
        }

        function has(scope,name) {
            for (var s = scope; s; s = s.parent){
                if (HOP(s.names, name)) {
                    if (!s.uses_with && !s.uses_eval && s.names[name] !== "arg") {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
            return false;
        }

        function instrumentLoad(ast) {
            if (ast===null) {
                return null;
            } else if (ast[0].toString() ==="name") {
                if (ast[1] === "null"){
                    printLineInfo(ast[0]);
                    return createCallLogLit(ast,N_LOG_NULL_LIT);
                } else if (ast[1] === "undefined") {
                    printLineInfo(ast[0]);
                    return createCallLogLit(ast,N_LOG_UNDEFINED_LIT);
                } else if (ast[1] === "NaN" || ast[1] === "Infinity") {
                    printLineInfo(ast[0]);
                    return createCallLogLit(ast,N_LOG_NUMBER_LIT);
                } else if (ast[1] === "true" || ast[1] === "false") {
                    printLineInfo(ast[0]);
                    return createCallLogLit(ast,N_LOG_BOOLEAN_LIT);
                } else if(ast[1] === prefix1 ||
                    ast[1]==="eval"){
                    return ast;
                } else if (scope.has(ast[1]) ||
                    ast[1] === 'this'){
                    printLineInfo(ast[0]);
                    return createCallRead(createStringAst(ast[1]),ast);
                } else {
                    printLineInfo(ast[0]);
                    return readWithUndefinedCheck(ast[1]);
                }
            } else if (ast[0].toString()==="dot") {
                printLineInfo(ast[0]);
                return createCallGetField(ast[1],createStringAst(ast[2]));
            } else if (ast[0].toString()==="sub") {
                printLineInfo(ast[0]);
                return createCallGetField(ast[1],ast[2]);
            } else {
                return ast;
            }
        }

        function instrumentHash(ast) {
            if (ast===null) {
                return null;
            } else {
                printLineInfo(ast[0]);
                return createCallHash(ast);
            }
        }

        function instrumentCall(ast, isCtor) {
            if (ast[0].toString()==="dot") {
                printLineInfo(ast[0]);
                return createCallMethodCall(ast[1],createStringAst(ast[2]), isCtor);
            } else if (ast[0].toString()==="sub") {
                printLineInfo(ast[0]);
                return createCallMethodCall(ast[1],ast[2], isCtor);
            } else if (ast[0].toString()==="name"){
                if (ast[1] === "eval") {
                    return ast;
                } else {
                    var ret = instrumentLoadAndWalk(ast);
                    printLineInfo(ast[0]);
                    return createCallFunCall(ret, isCtor);
                }
            } else {
                printLineInfo(ast[0]);
                return createCallFunCall(ast, isCtor);
            }
        }

        function instrumentPutField(this0,op,lvalue,rvalue) {
            if (lvalue[0].toString()==="name") {
//                return [this0,op,lvalue,rvalue];
                printLineInfo(this0);
                return [this0,op,lvalue,createCallWrite(createStringAst(lvalue[1]),rvalue)];
            } else if (lvalue[0].toString()==='dot') {
                printLineInfo(ast[0]);
                return createCallPutField(lvalue[1],createStringAst(lvalue[2]),rvalue);
            } else {
                printLineInfo(ast[0]);
                return createCallPutField(lvalue[1],lvalue[2],rvalue);
            }
        }

        function instrumentLoadModStore(op,lvalue,rvalue) {
            if (lvalue[0].toString()==="name") {
                var tmp1 = replaceInExpr( rp+"1 "+op+" "+rp+"2",
                    instrumentLoadAndWalk(lvalue),
                    rvalue), tmp2;

                printLineInfo(lvalue[0]);
                tmp2 = createCallWrite(createStringAst(lvalue[1]),tmp1);
                return replaceInExpr( rp+"1 = "+rp+"2", lvalue, tmp2);
            } else if (lvalue[0].toString()==='dot') {
                printLineInfo(lvalue[0]);
                return createCallAssign(lvalue[1],createStringAst(lvalue[2]),op,rvalue);
            } else {
                printLineInfo(lvalue[0]);
                return createCallAssign(lvalue[1],lvalue[2],op,rvalue);
            }
        }

        function instrumentPreIncDec(op,lvalue) {
            return instrumentLoadModStore(op.substring(0,1),lvalue,createNumberAst(1));
        }

        function adjustIncDec(op,ast) {
            if (op==='++') {
                op = '-';
            } else {
                op = '+';
            }
            return replaceInExpr( rp+"1 "+op+ " "+rp+"2", ast, createNumberAst(1));
        }

        function instrumentVarDefs(defs) {
            tokenStack.push(this[0]);
            var ret1 = [ this[0], MAP(defs, function(def){
                var a = [ def[0] ];
                if (def.length > 1) {
                    var ret = instrumentLoadAndWalk(def[1]);
                    printLineInfo(def[0]);
                    a[1] = createCallWrite(createStringAst(def[0]), ret);
                }
                return a;
            }) ];
            tokenStack.pop();
            return ret1;
        };

        function with_scope(s, cont) {
            var save = scope, ret;
            scope = s;
            ret = cont();
            scope = save;
            return ret;
        };

        var w = uglify.uglify.ast_walker();
        var walk = w.walk;
        var instrumentLoadAndWalk = compose(instrumentLoad,walk);

        var walker1 = {
            "string": function(str) {
                tokenStack.push(this[0]);
                printLineInfo(this[0]);
                var ret1 = createCallLogLit(this, N_LOG_STRING_LIT);
                tokenStack.pop();
                return ret1;
            },
            "num":function(str) {
                tokenStack.push(this[0]);
                printLineInfo(this[0]);
                var ret1 = createCallLogLit(this, N_LOG_NUMBER_LIT);
                tokenStack.pop();
                return ret1;
            },
            //"name":
            "toplevel": function(statements) {
                tokenStack.push(this[0]);
                var self = this, ret1;
                if (noTryCatchAtTop) {
                    ret1 = with_scope(this.scope,
                        function() {
                            return ["toplevel", MAP(statements, instrumentLoadAndWalk)];
                        }
                    );

                } else {
                    ret1 = with_scope(this.scope,
                        function() {
                            return createCallLogScriptEntryExit(MAP(statements, instrumentLoadAndWalk));
                        }
                    );
                }
                tokenStack.pop();
                return ret1;
            },
            //"block":
            //"splice":
            "var": instrumentVarDefs,
            "const": instrumentVarDefs,
            "try": function(t, c, f) {
                tokenStack.push(this[0]);
                var ret1 = [
                    this[0],
                    MAP(t, instrumentLoadAndWalk),
                    c != null ? [ c[0], MAP(c[1], instrumentLoadAndWalk) ] : null,
                    f != null ? MAP(f, instrumentLoadAndWalk) : null
                ];
                tokenStack.pop();
                return ret1;
            },
            "throw": function(expr) {
                tokenStack.push(this[0]);
                var ret1 = [ this[0], instrumentLoadAndWalk(expr) ];
                tokenStack.pop();
                return ret1;
            },
            "new": function(ctor, args) {
                tokenStack.push(this[0]);
                var ret = [ "call",
                    instrumentCall(walk(ctor),true),
                    MAP(args, instrumentLoadAndWalk) ];
                printLineInfo(this[0]);
                var ret1 = createCallLogLit(ret, N_LOG_OBJECT_LIT);
                tokenStack.pop();
                return ret1;
            },
            "switch": function(expr, body) {
                tokenStack.push(this[0]);
                var ret1 = [ this[0],
                    instrumentLoadAndWalk(expr),
                    MAP(body, function(branch){
                        return [ branch[0] ? instrumentLoadAndWalk(branch[0]) : null,
                            MAP(branch[1], instrumentLoadAndWalk) ];
                    }) ];
                tokenStack.pop();
                return ret1;
            },
            //"break":
            //"continue":
            "conditional": function(cond,t,e) {
                tokenStack.push(this[0]);
                var ret1 = [this[0],
                    instrumentLoadAndWalk(cond),
                    instrumentLoadAndWalk(t),
                    instrumentLoadAndWalk(e)];
                tokenStack.pop();
                return ret1;
            },
            "assign": function(op, lvalue, rvalue) {
                tokenStack.push(this[0]);
                var op2 = op;
                if (typeof op === "boolean") {
                    var ret1 = instrumentPutField(this[0],op,walk(lvalue),instrumentLoadAndWalk(rvalue));
                } else {
                    var ret1 = instrumentLoadModStore(op,walk(lvalue),instrumentLoadAndWalk(rvalue));
                }
//            return instrumentStore(lvalue,
//                [this[0],op,walk(lvalue),instrumentLoadAndWalk(rvalue)],"infix",op2);
                tokenStack.pop();
                return ret1;
            },
            "dot": function(expr) {
                tokenStack.push(this[0]);
                var ret1 = [ this[0], instrumentLoadAndWalk(expr) ].concat(slice(arguments, 1));
                tokenStack.pop();
                return ret1;
            },
            "call": function(expr, args) {
                tokenStack.push(this[0]);
                var isEval = expr.length === 2 && expr[0].toString() === "name" && expr[1] === "eval";
                var ret1 =  [ this[0],
                        instrumentCall(walk(expr), false),
                        isEval?
                            MAP(MAP(args, instrumentLoadAndWalk), createCallInstrumentCode):
                            MAP(args, instrumentLoadAndWalk)
                ];
                tokenStack.pop();
                return ret1;
            },
            "function": function(name,args,body) {
                tokenStack.push(this[0]);
                var self = this;
                var ast = [ this[0], name, args.slice(),
                    with_scope(body.scope, function() {
                        return createCallLogFunctionEntryExit(MAP(body, instrumentLoadAndWalk), self[0]);
                    })
                ];
                printLineInfo(this[0]);
                var ret1 = createCallLogLit(ast, N_LOG_FUNCTION_LIT);
                tokenStack.pop();
                return ret1;
            },
            //"debugger":
            "defun": function(name,args,body) {
                tokenStack.push(this[0]);
                var this0 = this[0];
                var ret1 = [ this[0], name, args.slice(),
                    with_scope(body.scope, function() {
                        return createCallLogFunctionEntryExit(MAP(body, walk),this0) //@todo check inconsistency with "function"
                    })
                ];
                tokenStack.pop();
                return ret1;
            },
            "if": function(conditional, t, e) {
                tokenStack.push(this[0]);
                var ret1 = [ this[0],
                    instrumentLoadAndWalk(conditional),
                    instrumentLoadAndWalk(t),
                    instrumentLoadAndWalk(e) ];
                tokenStack.pop();
                return ret1;
            },
            "for": function(init, cond, step, block) {
                tokenStack.push(this[0]);
                var ret1 = [ this[0],
                    instrumentLoadAndWalk(init),
                    instrumentLoadAndWalk(cond),
                    instrumentLoadAndWalk(step),
                    instrumentLoadAndWalk(block) ];
                tokenStack.pop();
                return ret1;
            },
            "for-in": function(vvar, key, hash, block) {
                tokenStack.push(this[0]);
                var ret1 = [ this[0],
                    walk(vvar),  //@todo: validate
                    walk(key), //@todo: validate
                    instrumentHash(instrumentLoadAndWalk(hash)),
//                    ["block", createCallWriteAsStatement(createStringAst("x"), createNameAst("x"), false).concat([ instrumentLoadAndWalk(block)])]
                    [
                        "if",
                        [
                            "binary",
                            "!==",
                            key,
                            createStringAst(SPECIAL_PROP)
                        ],
                        ["block", createCallWriteAsStatement(createStringAst(key[1][0]), createNameAst(key[1][0])).concat([ instrumentLoadAndWalk(block)])]
                    ]
                ];
                tokenStack.pop();
                return ret1;
            },
            "while": function(cond, block) {
                tokenStack.push(this[0]);
                var ret1 = [ this[0],
                    instrumentLoadAndWalk(cond),
                    instrumentLoadAndWalk(block) ];
                tokenStack.pop();
                return ret1;
            },
            "do": function(cond, block) {
                tokenStack.push(this[0]);
                var ret1 = [ this[0],
                    instrumentLoadAndWalk(cond),
                    instrumentLoadAndWalk(block) ];
                tokenStack.pop();
                return ret1;
            },
            "return": function(expr) {
                tokenStack.push(this[0]);
                var ret1 = [ this[0], instrumentLoadAndWalk(expr) ];
                tokenStack.pop();
                return ret1;
            },
            "binary": function(op, left, right) {
                tokenStack.push(this[0]);
                var ret1 = [this[0],op,instrumentLoadAndWalk(left), instrumentLoadAndWalk(right)];
                tokenStack.pop();
                return ret1;
            },
            "unary-prefix": function(op, expr) {
                tokenStack.push(this[0]);
                var ret1;
                if (op === "++" || op === "--"){
                    ret1 = instrumentPreIncDec(op,walk(expr));
                } else if(op === "delete") {
                    ret1 = [this[0],op, walk(expr)];
                } else {
                    ret1 = [this[0],op,instrumentLoadAndWalk(expr)];
                }
                tokenStack.pop();
                return ret1;
            },
            "unary-postfix": function(op, expr) {
                tokenStack.push(this[0]);
                var ret1 = adjustIncDec(op,instrumentPreIncDec(op,walk(expr)));
                tokenStack.pop();
                return ret1;
            },
            "sub": function(expr,subscript) {
                tokenStack.push(this[0]);
                var ret1 = [ this[0], instrumentLoadAndWalk(expr), instrumentLoadAndWalk(subscript)];
                tokenStack.pop();
                return ret1;
            },
            "object": function(props) {
                tokenStack.push(this[0]);
                var ret = [ this[0], MAP(props, function(p){
                    return p.length == 2
                        ? [ p[0], instrumentLoadAndWalk(p[1]) ]
                        : [ p[0], walk(p[1]), p[2] ]; // get/set-ter //@todo: come back
                }) ];
                printLineInfo(this[0]);
                var ret1 = createCallLogLit(ret, N_LOG_OBJECT_LIT);
                tokenStack.pop();
                return ret1;
            },
            "regexp": function(rx, mods) {
                tokenStack.push(this[0]);
                printLineInfo(this[0]);
                var ret1 = createCallLogLit([this[0], rx, mods], N_LOG_REGEXP_LIT);
                tokenStack.pop();
                return ret1;
            },
            "array": function(elements) {
                tokenStack.push(this[0]);
                var ret = [ this[0], MAP(elements, instrumentLoadAndWalk) ];
                printLineInfo(this[0]);
                var ret1 = createCallLogLit(ret, N_LOG_ARRAY_LIT);
                tokenStack.pop();
                return ret1;
            },
            "stat": function(stat) {
                tokenStack.push(this[0]);
                var ret1 = [ this[0], instrumentLoadAndWalk(stat) ];
                tokenStack.pop();
                return ret1;
            },
            "seq": function() {
                tokenStack.push(this[0]);
                var ret1 = [ this[0] ].concat(MAP(slice(arguments), instrumentLoadAndWalk));
                tokenStack.pop();
                return ret1;
            },
            "label": function(name, block) {
                tokenStack.push(this[0]);
                var ret1 = [ this[0], name, instrumentLoadAndWalk(block) ];
                tokenStack.pop();
                return ret1;
            },
            "with": function(expr, block) {
                tokenStack.push(this[0]);
                var ret1 = [ this[0], instrumentLoadAndWalk(expr), instrumentLoadAndWalk(block) ];
                tokenStack.pop();
                return ret1;
            },
            "atom": function (name) {
                tokenStack.push(this[0]);
                var ret1;
                if (name === "null"){
                    printLineInfo(this[0]);
                    ret1 = createCallLogLit(this,N_LOG_NULL_LIT);
                } else if (name === "undefined") {
                    printLineInfo(this[0]);
                    ret1 = createCallLogLit(this,N_LOG_UNDEFINED_LIT);
                } else if (name === "true" || name === "false") {
                    printLineInfo(this[0]);
                    ret1 = createCallLogLit(this,N_LOG_BOOLEAN_LIT);
                }
                tokenStack.pop();
                return ret1;
            }
            //"directive":
            /*
         */
        }

        var ast = uglify.parser.parse(code, false, true);
//    console.log(ast_to_string(ast));
        var new_ast = w.with_walkers(walker1, function(){
            var tmp = uglify.uglify.ast_add_scope(ast);
            return walk(tmp);
        });
        return new_ast;
    }

    function replaceOperators(ast) {
        var w = uglify.uglify.ast_walker();
        var walk = w.walk;
        tokenStack = [];

        function isArr(val) {
            return Object.prototype.toString.call( val ) === '[object Array]';
        }

        function isDotIExpr(expr) {
            return isArr(expr) &&
                expr.length>=1 &&
                expr[0].toString() === "dot" &&
                isArr(expr[1]) &&
                expr[1].length >= 1 &&
                expr[1][0].toString() === "name" &&
                expr[1][1] === prefix1 &&
                expr[2] === "I";
        }

        function isDotICall(expr) {
            return isArr(expr) &&
                expr[0].toString() === "call" &&
                isDotIExpr(expr[1]);
        }

        var ret = w.with_walkers({
            "binary": function(op, left, right) {
                tokenStack.push(this[0]);
                var ret1;
                var left1, right1;
                if (op === "&&") {
                    left1 = walk(left);
                    right1 = walk(right);
                    printLineInfo3(this[0]);
                    ret1 =replaceInExpr(
                        logConditionalFunName+"("+rp+"1, "+rp+"2)?"+rp+"3:"+logLastFunName+"()",
                        getCondIid(),
                        left1,
                        right1
                    );
                } else if (op === "||") {
                    left1 = walk(left);
                    right1 = walk(right);
                    printLineInfo3(this[0]);
                    ret1 =replaceInExpr(
                        logConditionalFunName+"("+rp+"1, "+rp+"2)?"+logLastFunName+"():"+rp+"3",
                        getCondIid(),
                        left1,
                        right1
                    );
                } else {
                    left1 = walk(left);
                    right1 = walk(right);
                    printLineInfo2(this[0]);
                    ret1 =replaceInExpr(
                        logBinaryOpFunName+"("+rp+"1, "+rp+"2, "+rp+"3, "+rp+"4)",
                        getOpIid(),
                        createStringAst(op),
                        left1,
                        right1
                    );
                }
                tokenStack.pop();
                return ret1;
            },
            "unary-prefix": function(op, expr) {
                tokenStack.push(this[0]);
                var ret1;
                if(op === "delete" || op ==="void") {
                    ret1 =[this[0],op, walk(expr)];
                } else {
                    var expr1 = walk(expr);
                    printLineInfo2(this[0]);
                    ret1 =replaceInExpr(
                        logUnaryOpFunName+"("+rp+"1,"+rp+"2,"+rp+"3)",
                        getOpIid(),
                        createStringAst(op),
                        expr1
                    );
                }
                tokenStack.pop();
                return ret1;
            },
            "call" : function(expr, args) {
                tokenStack.push(this[0]);
                var ret1;
                // do not instrument argument of J$.I
                if (isDotIExpr(expr)) {
                    ret1 =[this[0], walk(expr), args];
                }  else {
                    ret1 =[this[0], walk(expr), MAP(args,walk)];
                }
                tokenStack.pop();
                return ret1;
            },
            "conditional": function (cond, t, e) {
                tokenStack.push(this[0]);
                var ret1;
                if (isDotICall(cond)) {
                    ret1 =[
                        this[0],
                        walk(cond),
                        walk(t),
                        walk(e)
                    ];

                } else {
                    var cond1, t1, e1;
                    cond1 = walk(cond);
                    t1 = walk(t);
                    e1 = walk(e);
                    printLineInfo3(this[0]);
                    ret1 =[
                        this[0],
                        replaceInExpr(
                            logConditionalFunName+"("+rp+"1, "+rp+"2)",
                            getCondIid(),
                            cond1
                        ),
                        t1,
                        e1
                    ];
                }
                tokenStack.pop();
                return ret1;
            },
            "if": function (cond, t, e) {
                tokenStack.push(this[0]);
                var cond1, t1, e1;
                cond1 = walk(cond);
                t1 = walk(t);
                e1 = walk(e);
                printLineInfo3(this[0]);
                var ret1 =[
                    this[0],
                    replaceInExpr(
                        logConditionalFunName+"("+rp+"1, "+rp+"2)",
                        getCondIid(),
                        cond1
                    ),
                    t1,
                    e1
                ];
                tokenStack.pop();
                return ret1;
            },
            "switch": function(expr, body) {
                tokenStack.push(this[0]);
                var expr1 = walk(expr);
                printLineInfo3(this[0]);
                var ret1 =[ this[0],
                    replaceInExpr(
                        logSwitchLeftFunName+"("+rp+"1, "+rp+"2)",
                        getCondIid(),
                        expr1
                    ),
                    MAP(body, function(branch){
                        var branch0, tmp1;
                        if (branch[0]) {
                            tmp1 = walk(branch[0]);
                            printLineInfo3(branch[0]);
                            branch0 = replaceInExpr(
                                logSwitchRightFunName+"("+rp+"1, "+rp+"2)",
                                getCondIid(),
                                tmp1
                            )
                        } else {
                            branch0 = null;
                        }
                        return [ branch0, MAP(branch[1], walk) ];
                    }) ];
                tokenStack.pop();
                return ret1;
            },
            "while": function (cond, block) {
                tokenStack.push(this[0]);
                var cond1, block1;
                cond1 = walk(cond);
                block1 = walk(block);
                printLineInfo3(this[0]);
                var ret1 =[
                    this[0],
                    replaceInExpr(
                        logConditionalFunName+"("+rp+"1, "+rp+"2)",
                        getCondIid(),
                        cond1
                    ),
                    block1
                ];
                tokenStack.pop();
                return ret1;
            },
            "do": function (cond, block) {
                tokenStack.push(this[0]);
                var cond1, block1;
                cond1 = walk(cond);
                block1 = walk(block);
                printLineInfo3(this[0]);
                var ret1 =[
                    this[0],
                    replaceInExpr(
                        logConditionalFunName+"("+rp+"1, "+rp+"2)",
                        getCondIid(),
                        cond1
                    ),
                    block1
                ];
                tokenStack.pop();
                return ret1;
            },
            "for": function (init, cond, step, block) {
                tokenStack.push(this[0]);
                var init1, cond1, step1, block1;
                init1 = walk(init);
                cond1 = walk(cond);
                step1 = walk(step);
                block1 = walk(block);
                printLineInfo3(this[0]);
                var ret1 =[
                    this[0],
                    init1,
                    replaceInExpr(
                        logConditionalFunName+"("+rp+"1, "+rp+"2)",
                        getCondIid(),
                        cond1
                    ),
                    step1,
                    block1
                ];
                tokenStack.pop();
                return ret1;
            }
        }, function(){
            return walk(ast);
        });

//        console.log(ast_to_string(ret));
        return ret;
    }


    function instrumentCode(code, noTryCatchAtTop) {
        //if (noTryCatchAtTop) return code;
        var noInstr = "// JALANGI DO NOT INSTRUMENT", oldCondCount;

        initUglify();
        if (typeof  code === "string" && !(code.indexOf(noInstr)>=0)) {
            if (noTryCatchAtTop) {
                oldCondCount = condCount;
                condCount = 3;
            }
            var new_ast = instrument(code, noTryCatchAtTop);
            new_ast = replaceOperators(new_ast);
            //    console.log(ast_to_string(new_ast));
            var new_code = uglify.uglify.gen_code(new_ast, { beautify: true }).toString();
            //            console.log(new_code);
            if (noTryCatchAtTop) {
                condCount = oldCondCount;
            }
            var ret = new_code+"\n"+noInstr+"\n";
            return ret;
        } else {
            return code;
        }
    }

    function instrumentFile() {
        var args = process.argv, i;

        openFile();
        writeLine("(function (sandbox) { var iids = sandbox.iids = []; var filename;\n")
        for (i=2; i< args.length; i++) {
            filename = args[i];
            writeLine("filename = \""+filename+"\";\n");
            initUglify();
            var code = uglify.getCode(args[i]);
            var new_code = instrumentCode(code);
            uglify.saveCode(new_code, args[i]);
        }
        writeLine("}(typeof "+prefix1+" === 'undefined'? "+prefix1+" = {}:"+prefix1+"));\n")
        closeFile();
    }



    if (typeof window === 'undefined' && (typeof require !== "undefined") && require.main === module) {
        instrumentFile();
    } else {
        sandbox.instrumentCode = instrumentCode;
        sandbox.instrumentFile = instrumentFile;
    }
//    var ast = replaceInStatements("try { "+rp+"1; } catch (e) { "+rp+"2(); } finally {throw "+rp+"3; }", replaceInStatements("f = 2; z = 1;"), createNameAst("x"), createNameAst("f"));
//    console.log(ast_to_string(ast));
//        var new_code = uglify.uglify.gen_code(["toplevel", ast], { beautify: true }).toString();
//    console.log(new_code);
}((typeof J$ === 'undefined')? undefined:J$));



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

    var logLoadFunName = prefix1+".L";
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

    var logBinaryOpFunName = prefix1+".B";
    var logUnaryOpFunName = prefix1+".U";
    var logConditionalFunName = prefix1+".C";
    var logSwitchLeftFunName = prefix1+".C1";
    var logSwitchRightFunName = prefix1+".C2";
    var logLastFunName = prefix1+"._";

    var instrumentCodeFunName = prefix1+".instrumentCode";



    var rp = prefix1+"_";

//    var N_LOG_LOAD = 0,
    var N_LOG_FUN_CALL = 1,
        N_LOG_METHOD_CALL = 2,
        N_LOG_FUNCTION_ENTER = 4,
        N_LOG_FUNCTION_RETURN = 5,
        N_LOG_SCRIPT_ENTER = 6,
        N_LOG_SCRIPT_EXIT = 7,
        N_LOG_GETFIELD = 8,
    //N_LOG_GLOBAL = 9,
        N_LOG_ARRAY_LIT = 10,
        N_LOG_OBJECT_LIT = 11,
        N_LOG_FUNCTION_LIT = 12,
        N_LOG_RETURN = 13,
        N_LOG_REGEXP_LIT = 14,
    //N_LOG_LOCAL = 15,
        N_LOG_OBJECT_NEW = 16,
        N_LOG_READ = 17,
        N_LOG_FUNCTION_ENTER_NORMAL = 18,
        N_LOG_HASH = 19;

    var SPECIAL_PROP = "*"+prefix1+"*";



    var filename;
    var line = 1;

    var scope;

    var MAP, curry, slice;

    function initUglify() {
        if (typeof uglify === "undefined") {
            uglify = (function(){
                var fs = require("fs");
                var path = require('path');
                var uglify = require("uglify-js2");
                var argument = process.argv.splice(2);

                filename = argument[0];



                var getCode = function() {
                    console.log("argument ="+argument);
                    return fs.readFileSync(filename, "utf8");
                }

                var saveCode = function(code) {
                    var preFile = path.resolve(__dirname,'analysis.js');
                    var inputManagerFile = path.resolve(__dirname,'InputManager.js');
                    var thisFile = path.resolve(__filename);
                    var inputFile = path.resolve(process.cwd()+"/inputs.js");

//            var preFile = path.relative(path.dirname(filename),'./src/pre.js');
//            var preFile = '/Users/ksen/Dropbox/jalangi/src/pre.js';
                    var n_code =                     'if (typeof window ==="undefined") {\n' +
                        'require("'+preFile+'");\n' +
                        'require("'+inputManagerFile+'");\n' +
                        'require("'+thisFile+'");\n' +
                        'require("'+inputFile+'");\n' +
                        '}\n'+
                        code;
                    fs.writeFileSync(filename.replace(".js",fileSuffix1+".js"), n_code,"utf8");
                    fs.writeFileSync(COVERAGE_FILE_NAME, JSON.stringify({"branches":condCount/inc*2, "coverage":[], "covered":0}),"utf8");
                }


                return {
                    "uglify":uglify,
                    "getCode": getCode,
                    "saveCode": saveCode
                }
            })();
        }

        MAP || (MAP = uglify.uglify.MAP);
        curry || (curry = uglify.uglify.curry);
        slice || (slice = uglify.uglify.slice);

    }



    function HOP(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

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
                        if (stat[0] === "name" && stat[1].indexOf(rp) === 0) {
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

    function make_node(ctor, orig, props) {
        if (!props) props = {};
        if (orig) {
            if (!props.start) props.start = orig.start;
            if (!props.end) props.end = orig.end;
        }
        return new ctor(props);
    };

    function make_node_from_constant(compressor, val, orig) {
        if (val instanceof AST_Node) return val.transform(compressor);
        switch (typeof val) {
            case "string":
                return make_node(AST_String, orig, {
                    value: val
                });
            case "number":
                return make_node(isNaN(val) ? AST_NaN : AST_Number, orig, {
                    value: val
                });
            case "boolean":
                return make_node(val ? AST_True : AST_False, orig);
            case "undefined":
                return make_node(AST_Undefined, orig);
            default:
                if (val === null) {
                    return make_node(AST_Null, orig);
                }
                if (val instanceof RegExp) {
                    return make_node(AST_RegExp, orig);
                }
                throw new Error(string_template("Can't handle constant of type: {type}", {
                    type: typeof val
                }));
        }
    };

    function replaceInStatements(code) {
        var ast = uglify.uglify.parse(code);
        var asts = arguments;
        function DEFREPLACE(nodetype, generator) {
            nodetype.DEFMETHOD("_replace", generator);
        };

        DEFREPLACE(uglify.uglify.AST_SymbolVal, function(node, descend) {
            if (name.indexOf(rp) === 0) {
                var i = parseInt(name.substring(rp.length));
                return asts[i];
            }
        })

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
                        if (stat[0] === "name" && stat[1].indexOf(rp) === 0) {
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


    function replaceOperators(ast) {
        function DEFREPLACEOP(nodetype, generator) {
            nodetype.DEFMETHOD("_replaceOp", generator);
        };

        var w = uglify.uglify.ast_walker();
        var walk = w.walk;

        function isArr(val) {
            return Object.prototype.toString.call( val ) === '[object Array]';
        }

        function isDotIExpr(expr) {
            return isArr(expr) &&
                expr.length>=1 &&
                expr[0] === "dot" &&
                isArr(expr[1]) &&
                expr[1].length >= 1 &&
                expr[1][0] === "name" &&
                expr[1][1] === prefix1 &&
                expr[2] === "I";
        }

        function isDotICall(expr) {
            return isArr(expr) &&
                expr[0] === "call" &&
                isDotIExpr(expr[1]);
        }

        DEFREPLACEOP(AST_Binary, function(node,descend){});

        var ret = w.with_walkers({
            "binary": function(op, left, right) {
                if (op === "&&") {
                    return replaceInExpr(
                        logConditionalFunName+"("+rp+"1, "+rp+"2)?"+rp+"3:"+logLastFunName+"()",
                        getCondIid(),
                        walk(left),
                        walk(right)
                    );
                } else if (op === "||") {
                    return replaceInExpr(
                        logConditionalFunName+"("+rp+"1, "+rp+"2)?"+logLastFunName+"():"+rp+"3",
                        getCondIid(),
                        walk(left),
                        walk(right)
                    );
                } else {
                    return replaceInExpr(
                        logBinaryOpFunName+"("+rp+"1, "+rp+"2, "+rp+"3, "+rp+"4)",
                        getOpIid(),
                        createStringAst(op),
                        walk(left),
                        walk(right)
                    );
                }
            },
            "unary-prefix": function(op, expr) {
                if(op === "delete" || op ==="void") {
                    return [this[0],op, walk(expr)];
                } else {
                    return replaceInExpr(
                        logUnaryOpFunName+"("+rp+"1,"+rp+"2,"+rp+"3)",
                        getOpIid(),
                        createStringAst(op),
                        walk(expr)
                    );
                }
            },
            "call" : function(expr, args) {
                // do not instrument argument of J$.I
                if (isDotIExpr(expr)) {
                    return [this[0], walk(expr), args];
                }  else {
                    return [this[0], walk(expr), MAP(args,walk)];
                }
            },
            "conditional": function (cond, t, e) {
                if (isDotICall(cond)) {
                    return [
                        this[0],
                        walk(cond),
                        walk(t),
                        walk(e)
                    ];

                } else {
                    return [
                        this[0],
                        replaceInExpr(
                            logConditionalFunName+"("+rp+"1, "+rp+"2)",
                            getCondIid(),
                            walk(cond)
                        ),
                        walk(t),
                        walk(e)
                    ];
                }
            },
            "if": function (cond, t, e) {
                return [
                    this[0],
                    replaceInExpr(
                        logConditionalFunName+"("+rp+"1, "+rp+"2)",
                        getCondIid(),
                        walk(cond)
                    ),
                    walk(t),
                    walk(e)
                ];
            },
            "switch": function(expr, body) {
                return [ this[0],
                    replaceInExpr(
                        logSwitchLeftFunName+"("+rp+"1, "+rp+"2)",
                        getCondIid(),
                        walk(expr)
                    ),
                    MAP(body, function(branch){
                        return [ branch[0] ? replaceInExpr(
                            logSwitchRightFunName+"("+rp+"1, "+rp+"2)",
                            getCondIid(),
                            walk(branch[0])
                        ) : null,
                            MAP(branch[1], walk) ];
                    }) ];
            },
            "while": function (cond, block) {
                return [
                    this[0],
                    replaceInExpr(
                        logConditionalFunName+"("+rp+"1, "+rp+"2)",
                        getCondIid(),
                        walk(cond)
                    ),
                    walk(block)
                ];
            },
            "do": function (cond, block) {
                return [
                    this[0],
                    replaceInExpr(
                        logConditionalFunName+"("+rp+"1, "+rp+"2)",
                        getCondIid(),
                        walk(cond)
                    ),
                    walk(block)
                ];
            },
            "for": function (init, cond, step, block) {
                return [
                    this[0],
                    walk(init),
                    replaceInExpr(
                        logConditionalFunName+"("+rp+"1, "+rp+"2)",
                        getCondIid(),
                        walk(cond)
                    ),
                    walk(step),
                    walk(block)
                ];
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
            var new_ast = uglify.uglify.parse(code);
            new_ast = replaceOperators(new_ast);
            //    console.log(ast_to_string(new_ast));
            var new_code = uglify.uglify.gen_code(new_ast, { beautify: true }).toString();
            //            console.log(new_code);
            if (noTryCatchAtTop) {
                condCount = oldCondCount;
            }
            return new_code+"\n"+noInstr+"\n";
        } else {
            return code;
        }
    }

    function instrumentFile() {
        initUglify();
        var code = uglify.getCode();
        var new_code = instrumentCode(code);
        uglify.saveCode(new_code);
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



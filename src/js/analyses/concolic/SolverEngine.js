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

//------------------------------------- Generate SMT formula and solve and write to input file -------------

(function(module){

    function SolverEngine() {
        var fs = require('fs');
        var input, pathConstraint;
        var FileLineReader = require('./../../utils/FileLineReader');
        var PREFIX1 = "J$";
        var FORMULA_FILE_NAME = "jalangi_formula";
        var SOLUTION_FILE_NAME = "jalangi_solution";
        var INPUTS_FILE_NAME = "jalangi_inputs";
        var TAIL_FILE_NAME = "jalangi_tail";

        function execSync(cmd) {
         /*   var FFI = require("ffi");
            var libc = new FFI.Library(null, {
                "system": ["int32", ["string"]]
            });

            var run = libc.system;*/
    	    es = require('execSync')
            es.exec(cmd);
        }

        function HOP(obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        }


        function generateFormula(i, tail, mode, assignments, extra) {
            var j;
            var formulaStrings = [];
            var negatedFormula, freeVars = {}, f, allTrue = true;

            for (j=0; j<i; j++) {
                f = pathConstraint[j][1].substitute(assignments).getFormulaString(freeVars,mode, assignments);
                formulaStrings.push(f);
                if (f.trim() !== "(TRUE)") {
                    allTrue = false;
                }
            }
            negatedFormula = pathConstraint[j][1].not().substitute(assignments).getFormulaString(freeVars,mode, assignments);
            if (negatedFormula.trim() !== '(TRUE)') {
                allTrue = false;
            }
            if (allTrue) {
                return allTrue;
            }


            var formulaFh = fs.openSync(FORMULA_FILE_NAME+tail, 'w');
            for (var key in freeVars) {
                if (HOP(freeVars,key)) {
                    fs.writeSync(formulaFh,key +" : INT;\n");
                }
            }
            for (j=0; j<i; j++) {
                fs.writeSync(formulaFh,"ASSERT ");
                fs.writeSync(formulaFh,formulaStrings[j]);
                fs.writeSync(formulaFh,";\n");
            }
            if (extra) {
                fs.writeSync(formulaFh,"ASSERT ");
                fs.writeSync(formulaFh, extra);
                fs.writeSync(formulaFh,";\n");
            }
            fs.writeSync(formulaFh,"CHECKSAT ");
            fs.writeSync(formulaFh,negatedFormula);
            fs.writeSync(formulaFh,";\n");
            fs.writeSync(formulaFh,"COUNTERMODEL;\n");
            fs.closeSync(formulaFh);
            return allTrue;
        }

        function getTypeInfo(stype, newInputs) {
            if (stype.isFrozen) {
                return "";
            }
            var ret = newInputs[stype.sym];
            if (ret === undefined) {
                ret = stype.getSolution(stype.currentTypeIdx);
            } else {
                ret = stype.getSolution(ret);
            }
            return ret;
        }

        function writeASingleInput(fs, fd, key, val, fields, stype, newInputs) {
            var sb = "[";
            if (fields) {
                var len = fields.length;
                for (var i=0; i < len; i++) {
                    if (i !== 0) {
                        sb += ",";
                    }
                    sb += "\""+fields[i]+"\"";
                }
            }
            sb += "]";
            fs.writeSync(fd,PREFIX1+".setInput(\""+key +"\","+val+","+sb+getTypeInfo(stype,newInputs)+");\n");
        }

        function storeInputs(newInputs, index, tail, pathConstraintIndex) {
            var i, c, len, newIdx, newType, val, stype, oldInput;
            var fd = fs.openSync(INPUTS_FILE_NAME+tail+".js", 'w');
            fs.writeSync(fd,PREFIX1+".setSolutionPoint(\""+index+"\");\n");
            for (var key in input) {
                oldInput = input[key];
                if (HOP(input, key) && key.indexOf("x")===0 && oldInput.pathConstraintSize <= pathConstraintIndex) {
                    stype = oldInput.symbolic.stype.symbolic;
                    newIdx = newInputs[stype.sym];
                    if (newIdx !== undefined) {
                        // new type for input

                        newType = stype.possibleTypes[newIdx];
                        if (newType === "number" || newType === "boolean") {
                            val = 0;
                        } else if (newType === "string") {
                            val = "\"\"";
                        } else if (newType === "object") {
                            val = "{}";
                        } else if (newType === "function") {
                            val = "function(){return J$.readInput();}";
                        } else if (newType === "null") {
                            val = "null";
                        } else {
                            val = "new "+newType;
                        }
                    } else if (HOP(newInputs,key)) {
                        // new integer input
                        val = newInputs[key];
                    } else if (typeof oldInput.concrete === 'string' && (len = oldInput.symbolic.getField("length").symbolic.substitute(newInputs)) !== undefined ) {
                        // new or old string input

                        val = "";
                        for (i=0; i<len; i++) {
                            if ((c = newInputs[key+"__"+i]) !== undefined) {
                                val += String.fromCharCode(c);
                            } else {
                                val += "a";
                            }
                        }
                        val += "";
                        val = val.replace('"','\\"');
                        val = "\""+val+"\"";
                    } else {
                        // use old input

                        val = oldInput.concrete;
                        if (typeof val === "object") {
                            val = "{}";
                        } else if (typeof val === "function") {
                            val = "function(){return J$.readInput();}";
                        }
                    }
                    writeASingleInput(fs,fd, key, val, oldInput.symbolic.fieldsOrdered, stype, newInputs);
                }
            }
            fs.closeSync(fd);
        }



        function parseInputs(tail, newInputs) {
            var fd, line, tokens, key, tmp, val;
            var negatedSolution = null;

            fd = new FileLineReader(SOLUTION_FILE_NAME+tail);

            if (fd.hasNextLine()) {
                line = fd.nextLine();
                if (line.indexOf("Satisfiable")===0) {
                    while (fd.hasNextLine()) {
                        line = fd.nextLine();
                        if (line.indexOf("ASSERT")===0) {
                            if (negatedSolution) {
                                negatedSolution += " AND "+line.substring(line.indexOf("("),line.indexOf(")")+1);
                            } else {
                                negatedSolution = line.substring(line.indexOf("("),line.indexOf(")")+1);
                            }
                            tokens = line.split(" ");
                            key = tokens[1].substring(1);
                            tmp = tokens[3];
                            val = parseInt(tmp.substring(0, tmp.indexOf(")")));
                            newInputs[key] = val;
                        }
                    }
                    fd.close();
                    negatedSolution = "(NOT ("+negatedSolution+"))";
                    return negatedSolution;

                }
            }
            fd.close();
            return negatedSolution;
        }

        function invokeSMTSolver(tail, newInputs) {
            //console.log(require('path').resolve(__dirname)+"/../thirdparty/cvc3/bin/cvc3 < "+FORMULA_FILE_NAME+tail+" > "+SOLUTION_FILE_NAME+tail);
    	    if (process.platform == "win32") {
	    	    execSync(require('path').resolve(__dirname)+"/../../../../thirdparty/cvc3/bin/cvc3.exe < "+FORMULA_FILE_NAME+tail+" > "+SOLUTION_FILE_NAME+tail);
	        } else
		        execSync(require('path').resolve(__dirname)+"/../../../../thirdparty/cvc3/bin/cvc3 < "+FORMULA_FILE_NAME+tail+" > "+SOLUTION_FILE_NAME+tail);
            return parseInputs(tail, newInputs);
        }

        function writeInputs(newInputs, suffix, pathConstraintIndex) {
            var iCount;

            try {
                iCount = JSON.parse(fs.readFileSync(TAIL_FILE_NAME,"utf8"));
            } catch(e) {
                iCount = 0;
            }
            iCount++;
            storeInputs(newInputs, suffix, iCount, pathConstraintIndex);
            fs.writeFileSync(TAIL_FILE_NAME,JSON.stringify(iCount),"utf8");
        }

        function solveForTypes(i)  {
            var newInputs, j;
            if (pathConstraint[i][0] && pathConstraint[i][1].isFrozen !== undefined && !pathConstraint[i][1].isFrozen) {
                var stype = pathConstraint[i][1];
                j = stype.currentTypeIdx;
                while ( j < stype.possibleTypes.length - 1) {
                    newInputs = {};
                    newInputs[stype.sym] = j + 1;
                    writeInputs(newInputs, pathConstraint[i][0], i);
                    j++;
                }
            }
        }

        function solveForAnInput(i) {
            var tail = 0, newInputs, count, MAX_COUNT = 100, tmp, oldExtra, negatedSolution, extra, allTrue, done = false;

            if (pathConstraint[i][0] && pathConstraint[i][1].isFrozen === undefined) {

                //console.log("Solving at "+i);
                count = 0;
                extra = null;
                done = false;
                //console.log("Doing search at "+i+ " with tail "+(tail+1));
                while(count < MAX_COUNT && !done) {
                    tail++;
                    generateFormula(i, tail, "integer", {}, extra);
                    newInputs = {};
                    if ((negatedSolution = invokeSMTSolver(tail, newInputs))) {
                        tmp = negatedSolution;
                        //writeInputs(newInputs, pathConstraint[i][0]);
                        tail++;
                        oldExtra = extra;
                        extra = null;
                        allTrue = generateFormula(i, tail, "string", newInputs, extra);
                        extra = oldExtra;
                        if (allTrue || invokeSMTSolver(tail, newInputs)) {
                            writeInputs(newInputs, pathConstraint[i][0], i); // now handle string constraint
                            if (count > 1) {
                                console.log("Solved constraint after trial # "+count);
                            }
                            done = true;
                        } else {
                            if (extra) {
                                extra = extra + " AND " + tmp;
                            } else {
                                extra = tmp;
                            }
                        }
                    } else {
                        //console.log("No integer solution after trial # "+count);
                        done = true;
                    }
                    count++;
                }
//                if (!done) {
//                    console.log("Max trial "+count+" for integer solution exhausted");
//                } else {
//                    console.log("No idea on what happened");
//                }
            }

        }


        this.generateInputs = function(pathConstraint_) {
            var i;
            input = J$.inputs;
            pathConstraint = pathConstraint_;
            var solutionPoint = J$.getSolutionPoint();

        for(i = pathConstraint.length - 1; i>=0; i--) {
            console.log(i+": "+pathConstraint[i][0]+":"+pathConstraint[i][1]);
        }

            for(i = pathConstraint.length - 1; i>=0 && solutionPoint !== pathConstraint[i][0]; i--) {
                solveForAnInput(i);
            }

            for(i = pathConstraint.length - 1; i>=0; i--) {
                solveForTypes(i);
            }
        }

    }

    module.exports = SolverEngine;
}(module));



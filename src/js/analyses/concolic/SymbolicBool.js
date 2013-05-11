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
//------------------------------------------- Begin boolean symbolic expressions ----------------------------

(function(module){

    function SymbolicBool (op, left, right) {
        if (!(this instanceof SymbolicBool)){
            return new SymbolicBool(op, left, right);
        }
        this.left = left;
        this.right = right;
        switch(op) {
            case "!":
                if (left.op === SymbolicBool.TRUE) {
                    return SymbolicBool.false;
                } else if (left.op === SymbolicBool.FALSE) {
                    return SymbolicBool.true;
                }
                this.op = SymbolicBool.NOT;
                break;
            case "&&":
                if (left.op === SymbolicBool.TRUE) {
                    return right;
                } else if (left.op === SymbolicBool.FALSE) {
                    return SymbolicBool.false;
                }
                if (right.op === SymbolicBool.TRUE) {
                    return left;
                } else if (right.op === SymbolicBool.FALSE) {
                    return SymbolicBool.false;
                }
                this.op = SymbolicBool.AND;
                break;
            case "||":
                if (left.op === SymbolicBool.TRUE) {
                    return SymbolicBool.true;
                } else if (left.op === SymbolicBool.FALSE) {
                    return right;
                }
                if (right.op === SymbolicBool.TRUE) {
                    return SymbolicBool.true;
                } else if (right.op === SymbolicBool.FALSE) {
                    return left;
                }
                this.op = SymbolicBool.OR;
                break;
            case "true":
                this.op = SymbolicBool.TRUE;
                break;
            case "false":
                this.op = SymbolicBool.FALSE;
                break;
            default:
                this.op = SymbolicBool.LITERAL;
                this.left = op;
        }
    }



    SymbolicBool.simpleImplies = function(f1, f2) {
        if (f1 === f2) {
            return true;
        } else if (f1 instanceof SymbolicBool && f1.isAnd()) {
            if (SymbolicBool.simpleImplies(f1.left, f2) || SymbolicBool.simpleImplies(f1.right, f2)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    SymbolicBool.NOT = 0;
    SymbolicBool.AND = 1;
    SymbolicBool.OR = 2;
    SymbolicBool.IMPLIES = 3;
    SymbolicBool.EQUIV = 4;
    SymbolicBool.XOR = 5;
    SymbolicBool.TRUE = 6;
    SymbolicBool.FALSE = 7;
    SymbolicBool.LITERAL = 8;

    SymbolicBool.prototype = {
        constructor: SymbolicBool,
        not: function() {
            switch(this.op) {
                case SymbolicBool.NOT:
                    return this.left;
                    break;
                case SymbolicBool.TRUE:
                    return SymbolicBool.false;
                    break;
                case SymbolicBool.FALSE:
                    return SymbolicBool.true;
                default:
                    return new SymbolicBool("!",this);
            }
        },

        substitute: function(assignments) {
            var left = this.left?this.left.substitute(assignments):this.left;
            var right = this.right?this.right.substitute(assignments):this.right;
            switch(this.op) {
                case SymbolicBool.FALSE:
                case SymbolicBool.TRUE:
                    return this;
                case SymbolicBool.NOT:
                    if (left === SymbolicBool.true) {
                        return SymbolicBool.false;
                    } else if (left === SymbolicBool.false) {
                        return SymbolicBool.true;
                    } else if (left === this.left) {
                        return this;
                    } else {
                        return new SymbolicBool("!",left);
                    }
                case SymbolicBool.AND:
                    if (left === this.left && right === this.right) {
                        return this;
                    } else if (left === SymbolicBool.true) {
                        return right;
                    } else if (right === SymbolicBool.true) {
                        return left;
                    } else if (left === SymbolicBool.false || right === SymbolicBool.false) {
                        return SymbolicBool.false;
                    } else {
                        return new SymbolicBool("&&", left, right);
                    }
                case SymbolicBool.OR:
                    if (left === this.left && right === this.right) {
                        return this;
                    } else if (left === SymbolicBool.false) {
                        return right;
                    } else if (right === SymbolicBool.false) {
                        return left;
                    } else if (left === SymbolicBool.true || right === SymbolicBool.true) {
                        return SymbolicBool.true;
                    } else {
                        return new SymbolicBool("||", left, right);
                    }
                default:
                    return this;
            }
        },

        isAnd: function() {
            return this.op === SymbolicBool.AND;
        },

        isOr: function() {
            return this.op === SymbolicBool.OR;
        },

        toString: function() {
            switch(this.op) {
                case SymbolicBool.TRUE:
                    return "TRUE";
                case SymbolicBool.FALSE:
                    return "FALSE";
                case SymbolicBool.NOT:
                    return "(!"+this.left+")";
                case SymbolicBool.AND:
                    return "("+this.left+" && " + this.right+")";
                case SymbolicBool.OR:
                    return "("+this.left+" || " + this.right+")";
                case SymbolicBool.LITERAL:
                    return "b"+this.left;
            }
        },

        getFormulaString: function(freeVars, mode, assignments) {
            var sb = "(", tmp;
            switch(this.op) {
                case SymbolicBool.FALSE:
                    sb += "FALSE";
                    break;
                case SymbolicBool.TRUE:
                    sb += "TRUE";
                    break;
                case SymbolicBool.NOT:
                    sb += "NOT ";
                    sb += this.left.getFormulaString(freeVars, mode, assignments);
                    break;
                case SymbolicBool.AND:
                    tmp = this.left.getFormulaString(freeVars, mode, assignments);
                    sb += tmp;
                    sb += " AND ";
                    sb += this.right.getFormulaString(freeVars, mode, assignments);
                    break;
                case SymbolicBool.OR:
                    tmp = this.left.getFormulaString(freeVars, mode, assignments);
                    sb += tmp;
                    sb += " OR ";
                    sb += this.right.getFormulaString(freeVars, mode, assignments);
                    break;
            }
            sb += ")";
            return sb;
        },


        print: function(formulaFh) {
            fs.writeSync(formulaFh,"(");
            switch(this.op) {
                case SymbolicBool.NOT:
                    fs.writeSync(formulaFh,"NOT ");
                    this.left.print(formulaFh);
                    break;
                case SymbolicBool.AND:
                    this.left.print(formulaFh);
                    fs.writeSync(formulaFh," AND ");
                    this.right.print(formulaFh);
                    break;
                case SymbolicBool.OR:
                    this.left.print(formulaFh);
                    fs.writeSync(formulaFh," OR ");
                    this.right.print(formulaFh);
                    break;
            }
            fs.writeSync(formulaFh,")");
        },

        type: require('./Symbolic')

    }

    SymbolicBool.true = new SymbolicBool("true");
    SymbolicBool.false = new SymbolicBool("false");

//------------------------------------------- End boolean symbolic expressions ----------------------------

    module.exports = SymbolicBool;
}(module));

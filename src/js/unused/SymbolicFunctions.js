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

module.exports = (function(){
    function getSymbolicFunctionToInvoke (f) {
        if (f === Array ||
            f === Error ||
            f === String ||
            f === Number ||
            f === Boolean ||
            f === RegExp ||
            f === $7.readInput) {
            return f;
        } else if (f === RegExp.prototype.test) {
            return regexp_test;
        } else if (f === String.prototype.indexOf) {
            return string_indexOf;
        } else if (f === String.prototype.lastIndexOf) {
            return string_lastIndexOf;
        }  else if (f === String.prototype.substring) {
            return string_substring;
        } else if (f === Function.prototype.apply ||
            f === Function.prototype.call ||
            f === console.log ||
            f === Math.sin ||
            f === Math.abs ||
            f === Math.acos ||
            f === Math.asin ||
            f === Math.atan ||
            f === Math.atan2 ||
            f === Math.ceil ||
            f === Math.cos ||
            f === Math.expr ||
            f === Math.floor ||
            f === Math.log ||
            f === Math.max ||
            f === Math.min ||
            f === Math.pow ||
            f === Math.round ||
            f === Math.sqrt ||
            f === Math.tan ||
            f === String.prototype.charCodeAt ||
            f === parseInt) {
            return  create_fun(f);
        }
        return false;
    }

    function create_fun(f) {
        return function() {
            var len = arguments.length;
            for (var i = 0; i<len; i++) {
                arguments[i] = $7.getConcrete(arguments[i]);
            }
            return f.apply($7.getConcrete(this),arguments);
        }
    }

    function regex_escape (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }

    function regexp_test (str) {
        // this is a regexp object
        var concrete = $7.getConcrete(str);
        var newSym;

        if (str !== concrete && str.symbolic && str.symbolic.isCompound && str.symbolic.isCompound()) {
            newSym = $7.readInput(concrete,true);
            $7.addAxiom($7.B(0,"==",newSym,str));  // installing an axiom
        } else {
            newSym = str;
        }
        return $7.B(0, "regexin", newSym, this);
    }

    function string_indexOf(str) {
        var result, first, tmp1, tmp2;
        str = $7.getConcrete(str);
        first = $7.getConcrete(this);
        result =  first.indexOf(str);

        if (this !== first) {
            var reg = new RegExp(".*"+regex_escape(str)+".*");
            var ret = $7.readInput(result,true);

            var S1 = $7.readInput("",true);
            var S2 = $7.readInput("",true);
            tmp1 = $7.B(0,"+",S1,str);
            tmp1 = $7.B(0,"+",tmp1,S2);
            tmp1 = $7.B(0,"==",this,tmp1);
            tmp2 = $7.B(0,"==",ret,$7.G(0,S1,"length", true));
            tmp1 = $7.B(0,"&&",tmp2,tmp1);
            tmp2 = regexp_test.call(reg,S1);
            tmp2 = $7.U(0,"!",tmp2);
            var trueF = $7.B(0,"&&",tmp1,tmp2);
            tmp1 = $7.B(0,"==",ret,-1);
            tmp2 = regexp_test.call(reg,this);
            tmp2 = $7.U(0,"!",tmp2);
            var falseF = $7.B(0,"&&",tmp1,tmp2);
            tmp1 = $7.B(0,"||",trueF,falseF);
            $7.addAxiom(tmp1);
            return ret;
        }
        return result;
    }

    function string_substring(start, end) {
        var result, first, tmp1, tmp2;
        first = $7.getConcrete(this);
        result =  first.substring($7.getConcrete(start), $7.getConcrete(end));

        // assuming start >= 0 and end >= start and end === undefined or end <= this.length

        if (this !== first) {
            if (end === undefined) {
                end = $7.G(0, this, "length", true);
            }
            var ret = $7.readInput(result,true);
            var S1 = $7.readInput("",true);
            var S2 = $7.readInput("",true);

            tmp2 = $7.B(0,"<=", start, end);
            tmp1 = $7.B(0,"+",S1,ret);
            tmp1 = $7.B(0,"+",tmp1,S2);
            tmp1 = $7.B(0,"===",this,tmp1); // this === S1 + ret + S2
            tmp1 = $7.B(0,"&&", tmp2, tmp1);

            tmp2 = $7.B(0,"===",start, $7.G(0,S1,"length", true)); // start === S1.length
            tmp1 = $7.B(0,"&&",tmp2,tmp1);

            tmp2 = $7.B(0, "-", end, start);
            tmp2 = $7.B(0, "===", tmp2, $7.G(0,ret,"length", true));

            tmp1 = $7.B(0,"&&",tmp1,tmp2);
            $7.addAxiom(tmp1);
            return ret;
        }
        return result;
    }


    function string_lastIndexOf(str) {
        var result, first, tmp1, tmp2;
        str = $7.getConcrete(str);
        first = $7.getConcrete(this);
        result =  first.lastIndexOf(str);

        if (this !== first) {
            var reg = new RegExp(".*"+regex_escape(str)+".*");
            var ret = $7.readInput(result,true);

            var S1 = $7.readInput("",true);
            var S2 = $7.readInput("",true);
            tmp1 = $7.B(0,"+",S1,str);
            tmp1 = $7.B(0,"+",tmp1,S2);
            tmp1 = $7.B(0,"==",this,tmp1);
            tmp2 = $7.B(0,"==",ret,$7.G(0,S1,"length", true));
            tmp1 = $7.B(0,"&&",tmp2,tmp1);
            tmp2 = regexp_test.call(reg,S2);
            tmp2 = $7.U(0,"!",tmp2);
            var trueF = $7.B(0,"&&",tmp1,tmp2);
            tmp1 = $7.B(0,"==",ret,-1);
            tmp2 = regexp_test.call(reg,this);
            tmp2 = $7.U(0,"!",tmp2);
            var falseF = $7.B(0,"&&",tmp1,tmp2);
            tmp1 = $7.B(0,"||",trueF,falseF);
            $7.addAxiom(tmp1);
            return ret;
        }
        return result;
    }

    return getSymbolicFunctionToInvoke;
}());


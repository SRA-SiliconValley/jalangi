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

(function(module){

    function ConcolicValue (concrete, symbolic) {
        this.concrete = concrete;
        this.symbolic = symbolic;
    }

    ConcolicValue.prototype.toString = function() {
        return this.concrete+"";
    };

    ConcolicValue.prototype.valueOf = function() {
        if (this.concrete !== null && this.concrete !== undefined)
            return this.concrete.valueOf();
        else
            return this.concrete;
    }

    ConcolicValue.getConcrete = function (val) {
        if (val instanceof ConcolicValue) {
            return val.concrete;
        } else {
            return val;
        }
    }

    ConcolicValue.getSymbolic = function (val) {
        if (val instanceof ConcolicValue) {
            return val.symbolic;
        } else {
            return undefined;
        }
    }


    module.exports = ConcolicValue;
}(module));

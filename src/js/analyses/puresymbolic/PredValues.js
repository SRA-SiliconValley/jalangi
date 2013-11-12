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


(function (module) {

    var SymbolicBool = require('../concolic/SymbolicBool');
    var SolverEngine = require('./SolverEngine');
    var BDD = require('./BDD');

    var solver = new SolverEngine();

    function PredValues(pred, value) {
        if (!(this instanceof PredValues)) {
            return new PredValues(pred, value)
        }

        if (pred instanceof PredValues) {
            this.values = [];
            var i, len = pred.values.length;
            for (i = 0; i < len; ++i) {
                this.values[i] = pred.values[i];
            }
        } else {
            this.values = [];
            this.values[0] = {pred:pred, value:value};
        }
    }

    PredValues.prototype = {
        constructor:PredValues,

        addValue:function (pred, value) {
            var i, len = this.values.length;

            for (i = 0; i < len; ++i) {
                if (this.values[i].value === value) {
                    var oldPred = this.values[i].pred;
                    this.values[i] = {pred:pred.or(this.values[i].pred), value:value};
                    // console.log("Reduced "+oldPred.toString()+" ***** and ******** "+pred.toString()+" ****** to ******* "+this.values[i].pred.toString()+" for "+value);
                    console.log("Reduced BDD size "+(BDD.size(oldPred)+BDD.size(pred)-BDD.size(this.values[i].pred))+
                        " for "+value);
                    //console.log("Reduced "+oldPred.toString()+" ***** and ******** "+pred.toString()+" ****** to ******* "+this.values[i].pred.toString()+" for "+value);
                    return;
                }
            }
            this.values.push({pred:pred, value:value});
        },

        toString:function () {
            var i, len = this.values.length, sb = "[";

            for (i = 0; i < len; ++i) {
                sb = sb + "{ pred: " + this.values[i].pred.toString() + ", value: " + this.values[i].value + "},";
            }
            sb = sb + "]";
            return sb;
        }
    }

    module.exports = PredValues;
}(module));



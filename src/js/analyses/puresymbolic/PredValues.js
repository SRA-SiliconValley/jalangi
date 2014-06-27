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

    var BDD = require('./BDD');

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
            if (pred !== undefined && !pred.isZero()) {
                this.values[0] = {pred: pred, value: value};
            }
        }
    }

    PredValues.addValue = function(ret, pred, value) {
        var i, len, tPred;

        if (!(value instanceof PredValues)) {
            value = new PredValues(BDD.one, value);
        }

        len = value.values.length;

        for (i = 0; i < len; ++i) {
            tPred = pred.and(value.values[i].pred);
            var len2 = tPred.values.length;
            for (var j=0; j<len2; j++) {
                if (!ret) {
                    ret = new PredValues(tPred.values[j].pred, value.values[i].value);
                } else {
                    ret.addValue(tPred.values[j].pred, value.values[i].value);
                }
            }
        }
        return ret;
    };


    PredValues.prototype = {
        constructor:PredValues,

        addValue:function (pred, value) {
            var i, len = this.values.length;

            for (i = 0; i < len; ++i) {
                if (this.values[i].value === value) {
                    var oldPred = this.values[i].pred;
                    this.values[i] = {pred:pred.or(this.values[i].pred), value:value};
                    // console.log("Reduced "+oldPred.toString()+" ***** and ******** "+pred.toString()+" ****** to ******* "+this.values[i].pred.toString()+" for "+value);
                    //console.log("Reduced BDD size "+(BDD.size(oldPred)+BDD.size(pred)-BDD.size(this.values[i].pred))+
                    //    " for "+value);
                    //console.log("Reduced "+oldPred.toString()+" ***** and ******** "+pred.toString()+" ****** to ******* "+this.values[i].pred.toString()+" for "+value);
                    return;
                }
            }
            this.values.push({pred:pred, value:value});
        },

        size: function() {
            return this.values.length;
        },

        and: function(other) {
            var ret, phi;
            if (!(other instanceof BDD.Node)) {
                throw new Error("other = "+other+" should be a BDD.");
            }
            var i, len = this.values.length;
            ret = new PredValues();
            for (i = 0; i < len; ++i) {
                phi = this.values[i].pred.and(other);
                if (!phi.isZero()) {
                    ret.addValue(phi,this.values[i].value);
                }
            }
            return ret;
        },

        or: function(other) {
            if (!(other instanceof PredValues)) {
                throw new Error("other = "+other+" should be a PredValues.");
            }
            var ret = new PredValues(this);
            var i, len = other.values.length;
            for (i = 0; i < len; ++i) {
                ret.addValue(other.values[i].pred,other.values[i].value);
            }
            return ret;
        },

        disjunctAll: function() {
            var ret = BDD.zero;

            var i, len = this.values.length;
            for (i = 0; i < len; ++i) {
                if (this.values[i].value !== true) {
                    throw new Error("PredValues "+this+" is not a path constraint");
                }
                ret = ret.or(this.values[i].pred);
            }
            return ret;
        },

        isZero: function() {
            return this.values.length === 0;
        },

        toString:function () {
            var i, len = this.values.length, sb = "[";

            for (i = 0; i < len; ++i) {
                sb = sb + "{ pred: " + this.values[i].pred.toString() + ", value: " + this.values[i].value + "},";
            }
            sb = sb + "]";
            return sb;
        }
    };

    module.exports = PredValues;
}(module));



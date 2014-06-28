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

    var MERGE_ENABLED = false;

    var BDD = require('./BDD');
    var Symbolic = require('./../concolic/Symbolic');

    function isWithinTheory(val) {
        if (val === null) {
            return false;
        } else if (typeof val === 'undefined' || typeof val === 'string' || typeof val === 'boolean') {
            return true;
        } else if (typeof val === 'number' && Math.floor(val) === val) {
            return true;
        }
        return val.type === Symbolic;
    }



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

        compactSize: function() {
            var i, len = this.values.length, j, similars=0;

            for (i = 0; i < len; ++i) {
                inner: for (j=0; j<i; j++) {
                    if (this.values[i].value === this.values[j].value) {
                        similars ++;
                        break inner;
                    }
                }
            }
            return len - similars;
        },

        pathsToValueRatio:function () {
            var len = this.values.length;
            return len*1.0/this.compactSize();
        },

        isWithinTheory: function() {
            var i, len = this.values.length;

            if (len <= 1) return true;

            for (i = 0; i < len; ++i) {
                if (!isWithinTheory(this.values[i].value)) {
                    return false;
                }
            }
            return true;
        },

        mergeMax: function() {
            if (MERGE_ENABLED) return this;

            var ret = new PredValues();
            var i, len = this.values.length;

            for (i = 0; i < len; ++i) {
                ret.addValue(this.values[i].pred, this.values[i].value, true);
            }
            return ret;
        },

        addValue:function (pred, value, forceMerge) {
            var i, len = this.values.length;

            if (MERGE_ENABLED || forceMerge) {
                for (i = 0; i < len; ++i) {
                    if (this.values[i].value === value) {
                        var oldPred = this.values[i].pred;
                        this.values[i] = {pred: pred.or(this.values[i].pred), value: value};
                        // console.log("Reduced "+oldPred.toString()+" ***** and ******** "+pred.toString()+" ****** to ******* "+this.values[i].pred.toString()+" for "+value);
                        //console.log("Reduced BDD size "+(BDD.size(oldPred)+BDD.size(pred)-BDD.size(this.values[i].pred))+
                        //    " for "+value);
                        //console.log("Reduced "+oldPred.toString()+" ***** and ******** "+pred.toString()+" ****** to ******* "+this.values[i].pred.toString()+" for "+value);
                        return;
                    }
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
            if (other.isOne()) return this;
            var i, len = this.values.length;
            ret = new PredValues();
            if (other.isZero()) return ret;
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
            if (other.isZero()) return this;
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



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

    function SymbolicType(sym, possibleTypes, currentTypeIdx, isFrozen) {
        if (!(this instanceof SymbolicType)) {
            return new SymbolicType(sym, possibleTypes, currentTypeIdx, isFrozen);
        }
        this.sym = sym;
        this.possibleTypes = possibleTypes;
        this.currentTypeIdx = currentTypeIdx;
        this.isFrozen = isFrozen;
    }

    SymbolicType.prototype = {
        constructor: SymbolicType,

        addType: function(type) {
            if (!this.isFrozen && this.possibleTypes.indexOf(type) <0 ) {
                this.possibleTypes.push(type);
            }
        },
        substitute: function(assignments) {
            return this;
        },

        getFormulaString: function(freeVars, mode, assignments) {
            return "(TRUE)";
        },

        toString: function() {
            var sb = "";
            var i, len = this.possibleTypes.length;
            for (i = 0; i < len; i++) {
                if (i !== 0) {
                    sb += " AND ";
                }
                sb += this.sym;
                if (i === this.currentTypeIdx) {
                    sb += " == ";
                } else {
                    sb += " != ";
                }
                sb += this.possibleTypes[i];
            }
            if (this.isFrozen) {
                sb += " [fixed type]";
            }
            return sb;
        },

        getSolution: function(idx) {
            var sb = ", [";
            var i, len = this.possibleTypes.length;
            for (i = 0; i < len; i++) {
                if (i !== 0) {
                    sb += " , ";
                }
                sb += "\""+this.possibleTypes[i]+"\"";
            }
            sb += "], ";
            sb += idx+","+this.isFrozen;
            return sb;
        },

        getType: function(offset) {
            return this.possibleTypes[this.currentTypeIdx+offset];
        },

        type: require('./Symbolic')
}

    module.exports = SymbolicType;
} (module));

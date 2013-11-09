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

    // isUndefined is true if it called on undefined literal
    function SymbolicAnyVar(isUndefined) {
        if (!(this instanceof SymbolicAnyVar)) {
            return new SymbolicAnyVar(isUndefined);
        }
        if (isUndefined) {
            this.value = undefined;
        }
        this.isInitialized = isUndefined;
        if (!isUndefined) {
            this.idx = J$.getNextSymbol();
        }
    }

    SymbolicAnyVar.prototype = {
        constructor: SymbolicAnyVar,

        initialize: function(val) {
            this.isInitialized = true;
            if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
                this.value = J$.readInput(val, false, this.idx);
            } else {
                this.value = val;
            }
        }
    }

    module.exports = SymbolicAnyVar;
}(module));

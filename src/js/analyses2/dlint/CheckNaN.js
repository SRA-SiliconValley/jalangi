

/*
 * Copyright 2014 Samsung Information Systems America, Inc.
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



(function (sandbox) {
    function MyAnalysis () {
        var iidToLocation = sandbox.iidToLocation;
        var Constants = sandbox.Constants;
        var HOP = Constants.HOP;
        var sort = Array.prototype.sort;

        var info = {};

        this.invokeFun = function(iid, f, base, args, result, isConstructor, isMethod){
            if (result !== result) {
                info[iid] = (info[iid]|0) + 1;
            }
        };

        this.getField = function(iid, base, offset, val){
            if (val !== val) {
                info[iid] = (info[iid]|0) + 1;
            }
        };

        this.binary = function(iid, op, left, right, result){
            if (result !== result) {
                info[iid] = (info[iid]|0) + 1;
            }
        };

        this.unary = function(iid, op, left, result){
            if (result !== result) {
                info[iid] = (info[iid]|0) + 1;
            }
        };

        this.endExecution = function() {
            var tmp = [];
            for (var iid in info) {
                if (HOP(info, iid)) {
                    tmp.push({iid:iid, count:info[iid]});
                }
            }
            sort.call(tmp, function(a,b) {
                return b.count - a.count;
            });
            for (var x in tmp) {
                if (HOP(tmp, x)) {
                    x = tmp[x];
                    console.log("Observed NaN at "+iidToLocation(x.iid)+" "+ x.count+" time(s).");
                }
            }
        };
    }
    sandbox.analysis = new MyAnalysis();
})(J$);




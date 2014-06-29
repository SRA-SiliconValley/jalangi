
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

        this.getFieldPre = function(iid, base, offset){
            if (offset === undefined)
                info[iid] = (info[iid]|0) + 1;
        };

        this.putFieldPre = function(iid, base, offset, val){
            if (offset === undefined)
                info[iid] = (info[iid]|0) + 1;
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
                    console.log("Accessed property 'undefined' at "+iidToLocation(x.iid)+" "+ x.count+" time(s).");
                }
            }
        };
    }
    sandbox.analysis = new MyAnalysis();
})(J$);




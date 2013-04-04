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

(function(exports){
    var fs = require('fs');
    var COVERAGE_FILE_NAME = "jalangi_coverage";

    var getBranchInfo = (function() {
        var branchInfo;

        return function(){
            if (branchInfo === undefined) {
                branchInfo = JSON.parse(fs.readFileSync(COVERAGE_FILE_NAME,"utf8"));
            }
            return branchInfo;
        };
    }());

    function updateBranchInfo (iid, isThenBranch) {
        var branchInfo = getBranchInfo();
        var tmp = branchInfo.coverage[iid/4];
        if (tmp === undefined) {
            tmp = 0;
        }
        if (isThenBranch) {
            tmp |= 2;
        } else {
            tmp |= 1;
        }
        branchInfo.coverage[iid/4] = tmp;
    }

    function storeBranchInfo () {
        var branchInfo = getBranchInfo();

        var i, tail = 0, j, coverage = branchInfo.coverage, covered = 0;

        for (j in coverage) {
            if (coverage[j] === 1 || coverage[j] === 2) {
                covered++;
            } else if (coverage[j]===3) {
                covered += 2;
            }
        }
        branchInfo.covered = covered;

        //console.log("Condition coverage = "+(branchInfo.covered*100.0/branchInfo.branches).toFixed(2)+"%");
        fs.writeFileSync(COVERAGE_FILE_NAME, JSON.stringify(branchInfo),"utf8");
    }


    exports.updateBranchInfo = updateBranchInfo;
    exports.storeBranchInfo = storeBranchInfo;
}(exports));

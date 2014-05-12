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

(function (sandbox) {

    function LogNaN() {

        this.getField = function (iid, base, offset, val) {
            if (val !== val) {
                console.log("Reading NaN at " + sandbox.iidToLocation(iid) + " offset:" + offset);
            }
            return val;
        }

        this.readPre = function (iid, name, val, isGlobal) {
            if (val !== val) {
                console.log("Reading NaN at " + sandbox.iidToLocation(iid) + " name:" + name);
            }
        }


    }

    sandbox.analysis = new LogNaN();
    if (sandbox.Constants.isBrowser) {
        window.addEventListener('keydown', function (e) {
            // keyboard shortcut is Alt-Shift-T for now
            if (e.altKey && e.shiftKey && e.keyCode === 84) {
                sandbox.analysis.endExecution();
            }
        });
    }
}(J$));
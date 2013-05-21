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

(function() {

    function processSiblings() {
        var fs = require('fs');
        var FILE = "jalangi_dependency";
        var cov_arr = [];
        var prefix_arr = [];
        var file_arr = [];

        var candidates = [];
        var data;
        var inputp;
        var outputp;

        function readData() {
            if (fs.existsSync(FILE)) {
                data = JSON.parse(fs.readFileSync(FILE,"utf8"));
            } else {
                data = [1, 1];
            }
            inputp = data[0];
            outputp = data[1];
        }

        function HOP(obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        };

        function prefixEquals(prefix1, prefix2) {
            for (var i = 0; i< prefix1.length-1; i++) {
                if (prefix1[i] !== prefix2[i]) {
                    return false;
                }
            }
            return true;
        }

        function readArrays() {
            var file = "jalangi_taint"+inputp;
            var first = true, firstPrefix, flag = true;
            while (flag && fs.existsSync(file)) {
                var arr = JSON.parse(fs.readFileSync(file,"utf8"));
                if (first) {
                    first = false;
                    firstPrefix = arr[1];
                    cov_arr.push(arr[0]);
                    prefix_arr.push(firstPrefix);
                    file_arr.push(file);
                } else {
                    if (prefixEquals(firstPrefix, arr[1])) {
                        cov_arr.push(arr[0]);
                        prefix_arr.push(arr[1]);
                        file_arr.push(file);
                    } else {
                        flag = false;
                    }
                }
                inputp++;
                file = "jalangi_taint"+inputp;
            }
        }

        function pad(number, length) {
            var str = '' + number;
            while (str.length < length) {
                str = '0' + str;
            }
            return str;
        }

        function isEqual(cov1, cov2) {
            var same = true;
            for (var e in cov1) {
                if (HOP(cov1, e)) {
                    if (!HOP(cov2,e)) {
                        same = false;
                    } else if (cov1[e] !== cov2[e]) {
                        same = false;
                    }
                }
            }
            for (e in cov2) {
                if (HOP(cov2, e)) {
                    if (!HOP(cov1,e)) {
                        same = false;
                    }
                }
            }
            return same;
        }

        function checkAllDependencies() {
            for (var i = 0; i < cov_arr.length; i++) {
                var toAdd = true;
                for (var j = 0; toAdd && j < candidates.length; j++) {
                    if (isEqual(cov_arr[i], candidates[j])) {
                        toAdd = false;
                    }
                }
                if (toAdd) {
                    candidates.push(cov_arr[i]);
                    var suffix = pad(outputp,6);
                    console.log("Adding "+prefix_arr[i].join(','))
                    fs.writeFileSync("jalangi_next"+suffix+".js", "window[\"J$prefix\"] = "+ JSON.stringify(prefix_arr[i]),"utf8");
                    outputp++;
                }
            }
        }

        readData();
        readArrays();
        if (file_arr.length === 0) {
            return false;
        }
        checkAllDependencies();

        data[0] = inputp;
        data[1] = outputp;
        fs.writeFileSync(FILE, JSON.stringify(data),"utf8");
        return true;
    }

    while(processSiblings()){}

}());

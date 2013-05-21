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
        var rs_arr = [];
        var ws_arr = [];
        var prefix_arr = [];
        var file_arr = [];
        var file_to_ws_map = {};

        var taints = {};
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
                    firstPrefix = arr[2];
                    rs_arr.push(arr[0]);
                    ws_arr.push(arr[1]);
                    prefix_arr.push(firstPrefix);
                    file_arr.push(file);
                    file_to_ws_map[file] = arr[1];
                } else {
                    if (prefixEquals(firstPrefix, arr[2])) {
                        rs_arr.push(arr[0]);
                        ws_arr.push(arr[1]);
                        prefix_arr.push(arr[2]);
                        file_arr.push(file);
                        file_to_ws_map[file] = arr[1];
                    } else {
                        flag = false;
                    }
                }
                inputp++;
                file = "jalangi_taint"+inputp;
            }
        }

        function checkDependency(ws, rs) {
            for (var e in ws) {
                if (HOP(ws,e)) {
                    if (HOP(rs, e)) {
                        var arr_rs = rs[e];
                        var arr_ws = ws[e];
                        if (!(arr_rs[0] === arr_ws[0] && arr_rs[1] === arr_ws[1]) &&
                            arr_rs[0] !== "object" &&
                            arr_rs[0] !== "function" &&
                            arr_ws[0] !== "object" &&
                            arr_ws[0] !== "function") {
                            console.log(e);
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        function pad(number, length) {

            var str = '' + number;
            while (str.length < length) {
                str = '0' + str;
            }

            return str;

        }

        function toAdd(file, ws, prefix) {
            if (!HOP(taints,file)) {
                for (var file1 in taints) {
                    if (HOP(taints,file1) && taints[file1]===true) {
                        var ws1 = file_to_ws_map[file1];
                        var same = true;
                        for (var e in ws) {
                            if (HOP(ws, e)) {
                                if (!HOP(ws1,e)) {
                                    same = false;
                                } else if (!(ws[e][0] === ws1[e][0] && ws[e][1] === ws1[e][1])) {
                                    same = false;
                                }
                            }
                        }
                        for (e in ws1) {
                            if (HOP(ws1, e)) {
                                if (!HOP(ws,e)) {
                                    same = false;
                                }
                            }
                        }
                        if (same) {
                            return false;
                        }
                    }
                }
//            var count = 1;
//            for (file1 in taints) {
//                if (HOP(taints, file1) && taints[file1] === true) {
//                    count++;
//                }
//            }
                var suffix = pad(outputp,6);
                fs.writeFileSync("jalangi_next"+suffix+".js", "window[\"J$prefix\"] = "+ JSON.stringify(prefix),"utf8");
                outputp++;
                return true;
            } else {
                return taints[file];
            }
        }

        function checkAllDependencies() {
            for (var i = 0; i < rs_arr.length; i++) {
                for (var j = i; j < rs_arr.length; j++) {
                    if (checkDependency(ws_arr[i], rs_arr[j]) || checkDependency(ws_arr[j], rs_arr[i])) {
                        console.log(file_arr[i]+":"+file_arr[j]);
                        taints[file_arr[i]] = toAdd(file_arr[i], ws_arr[i], prefix_arr[i]);
                        taints[file_arr[j]] = toAdd(file_arr[j], ws_arr[j], prefix_arr[j]);
                    }

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
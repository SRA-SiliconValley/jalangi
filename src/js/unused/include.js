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

var vm = require("vm");
var fs = require("fs");
var pth = require("path");
var sandbox = {"require": require, "console": console};
var context = vm.createContext(sandbox);
module.exports = function(path) {
    path = pth.resolve(path);
    var data = fs.readFileSync(path);
    context.__filename = path;
    context.__dirname = pth.dirname(path);
    vm.runInContext(data, context, path);
}


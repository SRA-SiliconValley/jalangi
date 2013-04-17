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
    function FileLineReader(filename, bufferSize) {
        // FileLineReader grabbed from
        // http://blog.jaeckel.com/2010/03/i-tried-to-find-example-on-using-node.html
        if(!bufferSize) {
            bufferSize = 8192;
        }

        var fs = require('fs');
        var currentPositionInFile = 0;
        var buffer = "";
        var fd = fs.openSync(filename, "r");


        var fillBuffer = function(position) {

            var res = fs.readSync(fd, bufferSize, position, "utf8");

            buffer += res[0];
            if (res[1] == 0) {
                return -1;
            }
            return position + res[1];

        };

        currentPositionInFile = fillBuffer(0);

        this.hasNextLine = function() {
            while (buffer.indexOf("\n") == -1) {
                currentPositionInFile = fillBuffer(currentPositionInFile);
                if (currentPositionInFile == -1) {
                    return false;
                }
            }

            if (buffer.indexOf("\n") > -1) {

                return true;
            }
            return false;
        };

        this.nextLine = function() {
            var lineEnd = buffer.indexOf("\n");
            var result = buffer.substring(0, lineEnd);

            buffer = buffer.substring(result.length + 1, buffer.length);
            return result;
        };

        this.close = function() {
            fs.closeSync(fd);
        }

        return this;
    };

    module.exports = FileLineReader;
}(module));
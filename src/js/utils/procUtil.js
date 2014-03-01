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

// Author: Manu Sridharan

/**
 * utility methods for forked processes
 */

var Q = require("q");

function convertToString(buffer_parts, bufferLength) {
    var buf = new Buffer(bufferLength);
    var pos = 0;
    for (var i = 0; i < buffer_parts.length; i++) {
        buffer_parts[i].copy(buf, pos, 0, buffer_parts[i].length);
        pos += buffer_parts[i].length;
    }
    return buf.toString();
}
/**
 * Runs a process created via the node child_process API and captures its output.
 *
 * @param forkedProcess the process
 * @param {object} [extraOutput] additional properties to be copied to result
 * @returns {promise|Q.promise} A promise that, when process execution completes normally, is
 * resolved with an object with the following properties:
 *     'stdout': the stdout output of the process
 *     'stderr': the stderr output of the process
 *     'result': if the child process sends a message object to the parent with a 'result'
 *     property, the value of that property
 *
 *     If process completes abnormally (with non-zero exit code), the promise is rejected
 *     with a value similar to above, except that 'exitCode' holds the exit code.
 *
 */
function runChildAndCaptureOutput(forkedProcess, extraOutput) {
    var stdout_parts = [], stdoutLength = 0, stderr_parts = [], stderrLength = 0,
        result, deferred = Q.defer();
    forkedProcess.stdout.on('data', function (data) {
        stdout_parts.push(data);
        stdoutLength += data.length;
    });
    forkedProcess.stderr.on('data', function (data) {
        stderr_parts.push(data);
        stderrLength += data.length;
    });
    // handle message with a result field, holding the analysis result
    forkedProcess.on('message', function (m) {
        if (m.result) {
            result = m.result;
        }
    });
    forkedProcess.on('close', function (code) {
        var child_stdout = convertToString(stdout_parts, stdoutLength),
            child_stderr = convertToString(stderr_parts, stderrLength);
        var resultVal = {
            exitCode: code,
            stdout: child_stdout,
            stderr: child_stderr,
            result: result,
            toString: function () {
                return child_stderr;
            }
        };
        if (extraOutput) {
            Object.keys(extraOutput).forEach(function (k) {
                resultVal[k] = extraOutput[k];
            });
        }
        if (code !== 0) {
            deferred.reject(resultVal);
        } else {
            deferred.resolve(resultVal);
        }
    });
    return deferred.promise;

}

exports.runChildAndCaptureOutput = runChildAndCaptureOutput;
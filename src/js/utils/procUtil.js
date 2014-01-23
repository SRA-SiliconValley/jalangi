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

/**
 * Runs a process created via the node child_process API and captures its output.
 *
 * @param forkedProcess the process
 * @returns {promise|Q.promise} A promise that, when process execution is complete, is
 * resolved with an object with the following properties:
 *     'exitCode': the exit code of the process
 *     'stdout': the stdout output of the process
 *     'stderr': the stderr output of the process
 *     'result': if the child process sends a message object to the parent with a 'result'
 *     property, the value of that property
 *
 */
function runChildAndCaptureOutput(forkedProcess) {
    var child_stdout = "", child_stderr = "", result, deferred = Q.defer();
    forkedProcess.stdout.on('data', function (data) {
        child_stdout += data;
    });
    forkedProcess.stderr.on('data', function (data) {
        child_stderr += data;
    });
    // handle message with a result field, holding the analysis result
    forkedProcess.on('message', function (m) {
        if (m.result) {
            result = m.result;
        }
    });
    forkedProcess.on('close', function (code) {
        deferred.resolve({ exitCode: code, stdout: child_stdout, stderr: child_stderr, result: result });
    });
    return deferred.promise;

}

exports.runChildAndCaptureOutput = runChildAndCaptureOutput;
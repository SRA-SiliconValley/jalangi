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

/*global describe */
/*global it */

var testUtil = require('./testUtil');


// this needs to be inside the tests/unit folder to
// handle require() calls from test scripts
var instScriptFile = "tests/unit/instScript_jalangi_.js";




var unit_tests = [
    "instrument-test",
    "array_length",
    "assign",
    "async_events",
    "boolean",
    "call_in_finally",
    "call_in_finally_2",
    "call_order1",
    "cond",
    "cons_no_arg",
    "delete",
    "do_while",
    "eval_global",
    "eval_opt",
    "eval_scope",
    "exception",
    "field_inc",
    "field_read",
    "for_and_seq",
    "for_in",
    "fun_call",
    "gettersetter",
    "gettersetter2",
    "getownpropnames",
    "implicit-type",
    "label",
    "local_inc_dec",
    "monkeypatch",
    "method_sub",
    "null_instr",
    "object_lit",
    "object_tracking",
    "op_assign",
    "prototype_property",
    "scope_rr",
    "switch",
    "switch2",
    "string",
    "symbolic",
    "try_catch_finally_2",
    "type_conversion",
    "vars",
    "while"];

describe('unit tests', function () {
    this.timeout(600000);
    unit_tests.forEach(function (test) {
        it('should handle unit test ' + test, function (done) {
            var testFile = "tests/unit/" + test + ".js";
            testUtil.runTest(testFile,instScriptFile).then(function () { done(); }).done();
        });
    });
});




# Copyright 2013 Samsung Information Systems America, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#        http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Author: Simon Jensen

import testrunner

tests = [
    "tests/unit/instrument-test" ,
    "tests/unit/array_length" ,
    "tests/unit/assign" ,
    "tests/unit/async_events" ,
    "tests/unit/boolean" ,
    "tests/unit/call_order1" ,
    "tests/unit/cond" ,
    "tests/unit/cons_no_arg" ,
    "tests/unit/delete" ,
    "tests/unit/do_while" ,
    "tests/unit/eval_global" ,
    "tests/unit/eval_opt" ,
    "tests/unit/eval_scope" ,
    "tests/unit/field_inc" ,
    "tests/unit/field_read" ,
    "tests/unit/for_and_seq" ,
    "tests/unit/for_in" ,
    "tests/unit/fun_call" ,
    "tests/unit/label" ,
    "tests/unit/local_inc_dec" ,
    "tests/unit/monkeypatch",
    "tests/unit/method_sub" ,
    "tests/unit/null_instr" ,
    "tests/unit/object_lit" ,
    "tests/unit/object_tracking" ,
    "tests/unit/op_assign" ,
    "tests/unit/switch" ,
    "tests/unit/switch2" ,
    "tests/unit/string" ,
    "tests/unit/vars" ,
    "tests/unit/while" ,
    "tests/unit/scope_rr" ,
    "tests/unit/exception",
    "tests/unit/symbolic" ,
    "tests/unit/try_catch_finally_2" ,
    "tests/unit/gettersetter" ,
    "tests/unit/gettersetter2" ,
    "tests/unit/implicit-type",
    "tests/unit/prototype_property",
    "tests/unit/call_in_finally",
    "tests/unit/getownpropnames",
    "tests/unit/type_conversion",
    "tests/unit/call_in_finally_2"
]

success = testrunner.run_tests(tests,["analyze", "-a", "./analyses/trackallvalues/TrackValuesEngine"])
if not success:
    exit(1)

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
    ("tests/compos/arbitrary1",2),
    ("tests/compos/arbitrary2",16),
    ("tests/compos/arbitrary3",2),
    ("tests/compos/arbitrary4",13),
    ("tests/compos/fac",12),
    ("tests/compos/fac2",12),
    ("tests/compos/parser",323),
    ("tests/compos/parser2",165),
    ("tests/unit/bool_symbolic", 3),
    ("tests/unit/qsort", 28),
    ("tests/unit/compos1", 4),
    ("tests/unit/compos2", 4),
    ("tests/unit/compos3", 8),
    ("tests/unit/compos4", 3),
    ("tests/unit/compos5", 5),
    ("tests/unit/compos6", 1),
    ("tests/unit/testme", 7),
    ("tests/unit/testme2", 2),
    ("tests/unit/testme3", 4),
    ("tests/unit/testme4", 5),
    ("tests/unit/or", 3),
    ("tests/unit/and", 3),
    ("tests/unit/path_inputs", 4),
    ("tests/unit/summary1", 2),
    ("tests/unit/integer1", 5),
    ("tests/unit/integer2", 2),
    ("tests/unit/integer3", 3),
    ("tests/unit/integer4", 3),
    ("tests/unit/integer5", 3),
    ("tests/unit/integer6", 3),
    ("tests/unit/integer7", 2),
    ("tests/unit/str_to_int", 3),
    ("tests/unit/int_to_str", 3),
    ("tests/unit/from_char_code", 3),
    ("tests/unit/char_code_at", 9),
    ("tests/unit/char_at", 5),
    ("tests/unit/parse_int", 3),
    ("tests/unit/string1", 2),
    ("tests/unit/string2", 3),
    ("tests/unit/string3", 2),
    ("tests/unit/string4", 2),
    ("tests/unit/string5", 2),
    ("tests/unit/string6", 2),
    ("tests/unit/string7", 2),
    ("tests/unit/substr1", 2),
    ("tests/unit/substr2", 2),
    ("tests/unit/regex1", 2),
    ("tests/unit/regex2", 3),
    ("tests/unit/regex3", 3),
    ("tests/unit/regex4", 2),
    ("tests/unit/regex6", 5),
    ("tests/unit/regex7", 5),
    ("tests/unit/regex9", 2),
    ("tests/unit/switchs1", 5),
    ("tests/unit/switch-complex", 3)
    ]

def gen_args(expected):
    return ["symbolic", "-a", "src/js/analyses/puresymbolic/Multiple", "-i", str(expected)]
    
success = testrunner.run_tests_with_expected(tests, gen_args)
if not success:
    exit(1)

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
    "tests/octane/richards",
    "tests/octane/deltablue",
    "tests/octane/crypto",
    "tests/octane/raytrace",
    "tests/octane/earley-boyer",
    "tests/octane/regexp",
    "tests/octane/splay",
    "tests/octane/navier-stokes",
    "tests/octane/code-load",
    "tests/octane/gbemu",
    "tests/octane/box2d"
    ]

success = testrunner.run_tests(tests,["analyze", "-a", "src/js/analyses/trackallvalues/TrackValuesEngine"])
if not success:
    exit(1)

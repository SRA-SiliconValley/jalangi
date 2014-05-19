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

# Author: Manu Sridharan

import testrunner


tests = [
    "tests/html/unitApps/dataset_app",
    "tests/tizen/annex",
    "tests/tizen/calculator",
    "tests/tizen/go"
]

success = testrunner.run_tests(tests,["testrr_app"])
if not success:
    exit(1)

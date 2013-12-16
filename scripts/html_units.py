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

from subprocess import check_output, CalledProcessError
import sys
import subprocess
import fnmatch
import os


tests = [
    "tests/html_unit/native_function_toString"
#    "tests/html_unit/window_location"
]

SCRIPT = "src/python/jalangi_command.py"
failed = 0
pat = "*" + sys.argv[1] + "*" if len(sys.argv) > 1 else None
try:
    os.remove("jalangi_test_results")
except:pass
if pat != None:
    tests = [c for c in tests if fnmatch.fnmatch(c,pat)]
total = len(tests)
print "Running {} tests".format(total)
for case in tests:
    try:
        out = check_output(["python", SCRIPT, "testrr_browser", case], stderr=subprocess.STDOUT)
    except CalledProcessError as e:
        out = e.output
    if "{}.js failed".format(case) in out:
        print "{} failed".format(case)
        failed = failed + 1;
        print out
    else:
        print "{}.js passed:".format(case)

print "\nPass: {}".format(total - failed)
print "Fail: {}".format(failed)

if failed > 0:
    exit(1)

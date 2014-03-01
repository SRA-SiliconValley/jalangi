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

from subprocess import check_output, CalledProcessError
import sys
import subprocess
import fnmatch
import os

SCRIPT = "src/python/jalangi_command.py"

def fail_pred_default(case,out):
    return "Error:".format(case) in out or "{}.js failed".format(case) in out    
    
def run_tests(tests,script_args,fail_pred=fail_pred_default,pat="*" + sys.argv[1] + "*" if len(sys.argv) > 1 else None):
    """
    Runs a set of tests, printing output on test outcomes.

    Parameters
    ----------
    tests: list of str
       Tests to run.  Exact format can vary by type of test run, but
       typically, for JavaScript files, the .js file extension should
       be elided.
    script_args: list of str
       Arguments to be passed to SCRIPT to run the tests, excluding
       the name of the test case itself.
    pat: str
       If provided, only tests whose name includes this pattern will
       be run.  Defaults to sys.argv[1] if available, otherwise None.

    Returns
    -------
    bool
       True if all tests passed, False otherwise.
    """
    failed = 0
    try:
        os.remove("jalangi_test_results")
    except:pass
    if pat != None:
        tests = [c for c in tests if fnmatch.fnmatch(c,pat)]
    total = len(tests)
    print "Running {} tests".format(total)
    for case in tests:
        crashed = False
        try:
            out = check_output(["python", SCRIPT] + script_args + [case], stderr=subprocess.STDOUT)
        except CalledProcessError as e:
            crashed = True
            out = e.output
        if crashed or fail_pred(case,out):
            print "{} failed".format(case)
            failed = failed + 1;
            print out
        else:
            print "{}.js passed:".format(case)

    print "\nPass: {}".format(total - failed)
    print "Fail: {}".format(failed)
    return failed == 0

def run_tests_with_expected(tests_and_expected,script_args_fn,fail_pred=fail_pred_default,pat="*" + sys.argv[1] + "*" if len(sys.argv) > 1 else None):
    # TODO pass in (test,expected) pairs.  script_args should be a function from expected to list of str
    failed = 0
    try:
        os.remove("jalangi_test_results")
        os.remove("jalangi_sym_test_results")
    except:pass
    if pat != None:
        tests_and_expected = [(c,e) for (c,e) in tests_and_expected if fnmatch.fnmatch(c,pat)]
    total = len(tests_and_expected)
    print "Running {} tests".format(total)
    for (case, expected) in tests_and_expected:
        crashed = False
        try:
            out = check_output(["python", SCRIPT] +  script_args_fn(expected) + [case], stderr=subprocess.STDOUT)
        except CalledProcessError as e:
            crashed = True
            out = e.output
        if crashed or fail_pred(case,out):
            print "{} failed".format(case)
            failed = failed + 1;
            print out
        else:
            print "{}.js passed:".format(case)
    print "\nPass: {}".format(total - failed)
    print "Fail: {}".format(failed)
    return failed == 0
    

from subprocess import check_output, CalledProcessError
import sys
import subprocess
import fnmatch
import os


tests = [
    "tests/unit/eval_json_global" ,
    "tests/unit/reference_error" ,
    "tests/unit/try_catch_finally" ,
    "tests/unit/args" ,
    "tests/unit/dsp"
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
        out = check_output(["python", SCRIPT, "testrr", case], stderr=subprocess.STDOUT)
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


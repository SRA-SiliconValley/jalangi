from subprocess import check_output, CalledProcessError
import sys
import subprocess
import fnmatch
import os

tests = [
    ("tests/compos/arbitrary1",2),
    ("tests/compos/arbitrary2",80),
    ("tests/compos/arbitrary3",2),
    ("tests/compos/arbitrary4",13)
    ]
SCRIPT = "src/python/jalangi_command.py"
failed = 0
try:
    os.remove("jalangi_test_results")
except :pass
pat = "*" + sys.argv[1] + "*" if len(sys.argv) > 1 else None
if pat != None:
    tests = [c for c in tests if fnmatch.fnmatch(c,pat)]
total = len(tests)
print "Running {} tests".format(total)
for (case, expected) in tests:
    try:
        out = check_output(["python", SCRIPT, "symbolic", "-a", "analyses/puresymbolic/Multiple", "-i", str(expected), case], stderr=subprocess.STDOUT)
    except CalledProcessError as e:
        out = e.output
    if "Error:".format(case) in out or "{}.js failed".format(case) in out:
        print "{} failed".format(case)
        failed = failed + 1;
        print out
    else:
        print "{}.js passed:".format(case)

print "\nPass: {}".format(total - failed)
print "Fail: {}".format(failed)

if failed > 0:
    exit(1)

from subprocess import check_output, CalledProcessError
import sys
import subprocess
import fnmatch
import os

tests = [
    ("tests/compos/arbitrary1",2),
    ("tests/compos/arbitrary2",80),
    ("tests/compos/arbitrary3",2),
    ("tests/compos/arbitrary4",13),
    ("tests/unit/bool_symbolic", 3),
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
    ("tests/unit/switch-complex", 3),
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
    ("tests/unit/testme3", 4),
    ("tests/unit/testme4", 5)
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

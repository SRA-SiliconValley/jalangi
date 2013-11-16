from subprocess import check_output, CalledProcessError
import subprocess
import sys
import fnmatch
import os


tests = [
    ("tests/unit/bool_symbolic", 3),
    ("tests/unit/or", 3),
    ("tests/unit/and", 3),
    ("tests/unit/path_inputs", 4),
    ("tests/unit/summary1", 3),
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
    ("tests/unit/char_code_at", 3),
    ("tests/unit/char_at", 3),
    ("tests/unit/parse_int", 3),
    ("tests/unit/array_s", 2),
    ("tests/unit/object_symbolic", 75),
    ("tests/unit/objects", 7),
    ("tests/unit/function_symbolic", 4),
    ("tests/unit/function_symbolic2", 6),
    ("tests/unit/null_symbolic", 6),
    ("tests/unit/type_symbolic", 12),
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
    ("tests/unit/regex2", 2),
    ("tests/unit/regex3", 2),
    ("tests/unit/regex4", 2),
    ("tests/unit/regex6", 3),
    ("tests/unit/regex7", 3),
    ("tests/unit/regex8", 9),
    ("tests/unit/regex9", 2),
    ("tests/unit/switchs1", 5),
    ("tests/unit/switch-complex", 4),
    ("tests/unit/qsort", 24)]

SCRIPT = "src/python/jalangi_command.py"
failed = 0
pat = "*" + sys.argv[1] + "*" if len(sys.argv) > 1 else None
try:
    os.remove("jalangi_test_results")
    os.remove("jalangi_sym_test_results")
except:pass
if pat != None:
    tests = [(c,e) for (c,e) in tests if fnmatch.fnmatch(c,pat)]
total = len(tests)
print "Running {} tests".format(total)
for (case, expected) in tests:
    try:
        #out = check_output("python {} concolic -i {} {}".format(SCRIPT, expected, case), stderr=subprocess.STDOUT)
        out = check_output(["python", SCRIPT, "concolic", "-i", str(expected), case], stderr=subprocess.STDOUT)
    except CalledProcessError as e:
        out = e.output
    if "{}.js passed".format(case) in out:
        print "{} passed".format(case)
    else:
        print "{}.js failed:".format(case)
        print out
        failed = failed + 1;

print "\nPass: {}".format(total - failed)
print "Fail: {}".format(failed)

if failed > 0:
    exit(1)

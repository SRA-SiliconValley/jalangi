from subprocess import check_output, CalledProcessError
import sys
import subprocess
import fnmatch
import os


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
    "tests/unit/gettersetter" ,
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

if failed > 0:
    exit(1)

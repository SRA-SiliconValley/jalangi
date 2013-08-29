from subprocess import check_output, CalledProcessError
import sys
import subprocess
import fnmatch

tests = [
    ("tests/unit/instrument-test", 1),
    ("tests/unit/array_length", 1),
    ("tests/unit/assign", 1),
    ("tests/unit/async_events", 1),
    ("tests/unit/boolean", 1),
    ("tests/unit/call_order1", 1),
    ("tests/unit/cond", 1),
    ("tests/unit/cons_no_arg", 1),
    ("tests/unit/delete", 1),
    ("tests/unit/do_while", 1),
    ("tests/unit/eval_global", 1),
    ("tests/unit/eval_opt", 1),
    ("tests/unit/eval_scope", 1),
    ("tests/unit/field_inc", 1),
    ("tests/unit/field_read", 1),
    ("tests/unit/for_and_seq", 1),
    ("tests/unit/for_in", 1),
    ("tests/unit/fun_call", 1),
    ("tests/unit/label", 1),
    ("tests/unit/local_inc_dec", 1),
    ("tests/unit/method_sub", 1),
    ("tests/unit/null_instr", 1),
    ("tests/unit/object_lit", 1),
    ("tests/unit/object_tracking", 1),
    ("tests/unit/op_assign", 1),
    ("tests/unit/switch", 1),
    ("tests/unit/switch2", 1),
    ("tests/unit/string", 1),
    ("tests/unit/vars", 1),
    ("tests/unit/while", 1),
    ("tests/unit/scope_rr", 1),
    ("tests/unit/exception", 1 ),
    ("tests/unit/eval_json_global", 1),
    ("tests/unit/symbolic", 1),
    ("tests/unit/reference_error", 1),
    ("tests/unit/try_catch_finally", 1),
    ("tests/unit/args", 1)]

SCRIPT = "src/python/jalangi_command.py"
failed = 0
pat = "*" + sys.argv[1] + "*" if len(sys.argv) > 1 else None
if pat != None:
    tests = [(c,e) for (c,e) in tests if fnmatch.fnmatch(c,pat)]
total = len(tests)
print "Running {} tests".format(total)
for (case, expected) in tests:
    try:
        out = check_output("python {} concolic -i {} {}".format(SCRIPT, expected, case), stderr=subprocess.STDOUT)
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

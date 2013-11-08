from subprocess import check_output, CalledProcessError
import sys
import subprocess
import fnmatch
import os

tests = [
    "tests/sunspider1/3d-cube",
    "tests/sunspider1/3d-morph",
    "tests/sunspider1/3d-raytrace",
    "tests/sunspider1/access-binary-trees",
    "tests/sunspider1/access-fannkuch",
    "tests/sunspider1/access-nbody",
    "tests/sunspider1/access-nsieve",
    "tests/sunspider1/bitops-3bit-bits-in-byte",
    "tests/sunspider1/bitops-bits-in-byte",
    "tests/sunspider1/bitops-bitwise-and",
    "tests/sunspider1/controlflow-recursive",
    "tests/sunspider1/crypto-md5",
    "tests/sunspider1/crypto-sha1",
    "tests/sunspider1/date-format-tofte",
    "tests/sunspider1/date-format-xparb",
    "tests/sunspider1/math-cordic",
    "tests/sunspider1/math-partial-sums",
    "tests/sunspider1/math-spectral-norm",
    "tests/sunspider1/regexp-dna",
    "tests/sunspider1/string-fasta",
    "tests/sunspider1/string-tagcloud",
    "tests/sunspider1/string-unpack-code",
    "tests/sunspider1/bitops-nsieve-bits",
    "tests/sunspider1/crypto-aes"
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

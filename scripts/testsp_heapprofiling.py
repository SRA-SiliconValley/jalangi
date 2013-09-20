from subprocess import call, CalledProcessError
import sys
import subprocess
import fnmatch
import os

tests = [
    ("tests/sunspider1/3d-cube", 1),
    ("tests/sunspider1/3d-morph", 1),
    ("tests/sunspider1/3d-raytrace", 1),
    ("tests/sunspider1/access-binary-trees", 1),
    ("tests/sunspider1/access-fannkuch", 1),
    ("tests/sunspider1/access-nbody", 1),
    ("tests/sunspider1/access-nsieve", 1),
    ("tests/sunspider1/bitops-3bit-bits-in-byte", 1),
    ("tests/sunspider1/bitops-bits-in-byte", 1),
    ("tests/sunspider1/bitops-bitwise-and", 1),
    ("tests/sunspider1/controlflow-recursive", 1),
    ("tests/sunspider1/crypto-md5", 1),
    ("tests/sunspider1/crypto-sha1", 1),
    ("tests/sunspider1/date-format-tofte", 1),
    ("tests/sunspider1/date-format-xparb", 1),
    ("tests/sunspider1/math-cordic", 1),
    ("tests/sunspider1/math-partial-sums", 1),
    ("tests/sunspider1/math-spectral-norm", 1),
    ("tests/sunspider1/regexp-dna", 1),
    ("tests/sunspider1/string-fasta", 1),
    ("tests/sunspider1/string-tagcloud", 1),
    ("tests/sunspider1/string-unpack-code", 1),
    ("tests/sunspider1/bitops-nsieve-bits", 1),
    ("tests/sunspider1/crypto-aes", 1),
    ("tests/sunspider1/string-validate-input", 1),
    ("tests/sunspider1/string-base64", 1)]
SCRIPT = "src/python/jalangi_command.py"
failed = 0
try:
    os.remove("jalangi_test_results")
except :pass
pat = "*" + sys.argv[1] + "*" if len(sys.argv) > 1 else None
if pat != None:
    tests = [(c,e) for (c,e) in tests if fnmatch.fnmatch(c,pat)]
total = len(tests)
print "Running {} tests".format(total)
for (case, expected) in tests:
    try:
        call(["python", SCRIPT, "analyze", "-a", "analyses/objectalloc/ObjectAllocationTrackerEngine", case])
    except CalledProcessError as e:
        pass




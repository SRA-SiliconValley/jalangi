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

import testrunner

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
    "tests/sunspider1/crypto-aes",
    "tests/sunspider1/string-validate-input",
    "tests/sunspider1/string-base64"
    ]

success = testrunner.run_tests(tests,["analyze", "-a", "analyses/trackallvalues/TrackValuesEngine"])
if not success:
    exit(1)

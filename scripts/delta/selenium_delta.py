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

# Author: Manu Sridharan

import tempfile
import sys
import os
import subprocess
scriptpath = os.path.join(os.path.dirname(os.path.realpath(__file__)),"../../src/python/")
sys.path.insert(0,scriptpath)
import commands
import selenium_util
import util
from selenium.common.exceptions import WebDriverException


script = sys.argv[1]

jalangi = util.DEFAULT_INSTALL

selenium_util.set_chromedriver_loc(os.path.abspath(os.path.join(jalangi.get_home(),
                                                                "thirdparty",
                                                                "chromedriver.exe" if sys.platform == 'win32' else "chromedriver")))

try:
    norm = selenium_util.run_normal(script)
    if norm != "":
        print "something went wrong "
        print norm
        exit(0)
except WebDriverException as e:
    # deliberately printing on stdout,
    # as we don't want this as part of the error message
    print "WebDriverException"
    print e
    exit(0)
    

# instrument file
(instrumented, out) = commands.instrument(os.path.splitext(script)[0])

# instrumented is in same directory as original script
instrumented = os.path.join(os.path.dirname(os.path.abspath(script)),instrumented)

print instrumented

record = selenium_util.record(instrumented)

print record

print "replaying" 
replay_args = ["node","src/js/commands/replay.js"]

sp = subprocess.Popen(replay_args,stdout=subprocess.PIPE, stderr=subprocess.PIPE)
out, err = sp.communicate()
print "replay done"
if err:
    print >> sys.stderr, err
    # bingo
    exit(1)




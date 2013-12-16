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

import sys
import os
scriptpath = os.path.join(os.path.dirname(os.path.realpath(__file__)),"../src/python/")
sys.path.insert(0,scriptpath)
import util

args = sys.argv
if len(args) == 1:
    print "Usage: python scripts/gen_wrapper_html.py script_file"
    sys.exit(0)
script_file = os.path.abspath(args[1])
no_ext = os.path.splitext(script_file)[0]
normal_html_file = no_ext + ".html"
inst_script_name = no_ext + "_jalangi_.js"
inst_html_file = no_ext + "_jalangi_.html"

util.gen_wrapper_html_file([script_file],normal_html_file)
util.gen_wrapper_html_file(util.RUNTIME_SCRIPTS + [inst_script_name],inst_html_file)

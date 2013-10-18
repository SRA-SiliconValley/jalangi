
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

import os
import subprocess
import sys
import shutil
from tempfile import NamedTemporaryFile
import glob

def get_analysis(a):
    ka = {"concolic" : "analyses/concolic/SymbolicEngine",
          "coverage" : "analyses/coverage/CoverageEngine",
          "empty" : "analyses/empty/EmptyEngine",
          "likelytype" : "analyses/likelytype/LikelyTypeInferEngine",
          "nop" : "analyses/nop/NOPEngine",
          "objectalloc" : "analyses/objectalloc/ObjectAllocationTrackerEngine",
          "simpletaint" : "analyses/simpletaint/TaintEngine",
          "trackundefinednull" : "analyses/trackundefinednull/UndefinedNullTrackingEngine",
          "wrapping" : "analyses/wrapping/WrappingEngine"}
    if a in ka.keys():
        return ka[a]
    return None
          

class JalangiInstall:

    def instrumentation_script(self):
        return self.get_home() + "/src/js/instrument/esnstrument.js"

    def replay_script(self):
        return self.get_home() + "/src/js/commands/replay.js"

    def analyses(self):
        return os.listdir(self.get_home() + "/src/js/analyses")

    def get_home(self):
        if hasattr(self,"home"):
            return self.home
        else:
            return os.path.abspath(os.path.join(os.path.dirname(__file__),os.pardir,os.pardir))

    def self_or_env(self,local,env):
        if hasattr(self,local):
            return getattr(self, local)
        else:
            return os.environ[env] if env in os.environ else False

    def coverage(self):
        return self.self_or_env("use_coverage", "USE_COVERAGE")

    def timed(self):
        return self.self_or_env("use_time", "USE_TIME")

DEFAULT_INSTALL = JalangiInstall()

class JalangiException(Exception):
    """Any error that happens during the Jalangi 
    analysis process

    Attributes:
       install -- the JalangiInstall being used
       msg -- User understandable message of what went wrong
       trigger -- Exception that caused this error (if any)
       """
    def __init__(self, install, message, trigger=None):

        self.install = install
        self.message = message
        self.trigger = trigger

def run_node_script(script, *args, **kwargs):
    """Execute script and returns output string"""
    jal = kwargs['jalangi']
    saveStdErr = kwargs['savestderr'] if 'savestderr' in kwargs else False
    if jal.timed():
        cmd = ["time"]
    else:
        cmd = []
    if jal.coverage():
        cmd = cmd + ["cover", "-i", os.path.join(jal.get_home(),".coverignore"), "run"]
    cmd = cmd + ([find_node()] if not jal.coverage() else [])
    with NamedTemporaryFile() as f:
         try:
             subprocess.check_call(cmd + [script] + [x for x in args],stdout=f, 
                                   stderr=f if saveStdErr else open(os.devnull, 'wb'),bufsize=1000)
             f.seek(0)
             return f.read()
         except subprocess.CalledProcessError as e:
             f.seek(0)
             return f.read()

def run_node_script_std(script, *args, **kwargs):
    """Execute script and print output"""
    jal = kwargs['jalangi']
    if jal.timed():
        cmd = ["time"]
    else:
        cmd = []
    if jal.coverage():
        cmd = cmd + ["cover", "run"]
    cmd = cmd + ([find_node()] if not jal.coverage() else [])
    subprocess.call(cmd + [script] + [x for x in args])

def is_node_exe(path):
    try:
        subprocess.check_output([path,"-e","42"])
        return True
    except: return False

def find_node():
    try:
        return find_node.mem
    except: pass
    LOCATIONS = [os.environ.get("NODE_EXECUTABLE"),
                 "node",
                 "/usr/bin/node",
                 "/usr/local/bin/node",
                 "C:/Program Files/nodejs/node.exe",
                 "C:/Program Files (x86)/nodejs/node.exe"]
    l = filter(is_node_exe, LOCATIONS)
    if len(l) == 0:
        print "Could not find the node.js executable. node.js is required for Jalangi"
        print "If you have installed node.js in a non-standard location you can set environment variable NODE_EXECUTABLE to the full path of the node executable."
        exit(1)
    find_node.mem = l[0]
    return l[0]
    
def mkempty(f):
    """
    Create f as an empty file
    """
    open(f, 'w').close() 


def head(f,n):
    """Returns either the first n of lines of f or f if fewer lines
    """
    from itertools import islice
    with open(f) as ff:
        head=list(islice(ff,n))
    return head

def count_lines(f):
    with open(f) as fin:
	ines = sum(1 for line in fin)
    return ines

def move_coverage(jalangi):
    if jalangi.coverage():
        shutil.move(".coverage_data", "..")

def handle_dot_files(dr, filee):
    todir = os.path.dirname(filee)
    for f in glob.glob("*.dot"):
        try:
            shutil.copy(f, todir)
        except: pass
        
def render_dot_files(put_dot, dot_files):
    os.chdir(put_dot)
    def render_dot_file(f):
        out_file = os.path.basename(f) + ".png"
        subprocess.call(["dot","-T", "png"], stdin=open(f, "r"), stdout=open(out_file, "w"))
        return out_file
    htmls = ['<img src="{}"/>'.format(render_dot_file(x)) for x in dot_files]
    with open("out.html", "w") as f:
        f.write("<br/>".join(htmls))
        f.write("\n")
    
    
    
    

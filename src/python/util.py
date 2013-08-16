
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

class JalangiInstall:

    def instrumentation_script(self):
        return self.get_home() + "/src/js/instrument/esnstrument.js"

    def replay_script(self):
        return self.get_home() + "/src/js/commands/replay.js"

    def get_home(self):
        if hasattr(self,"home"):
            return self.home
        else:
            return os.path.abspath(os.path.join(os.path.dirname(__file__),os.pardir,os.pardir))

    def self_or_env(self,local,env):
        if hasattr(self,local):
            return self.getattr(local)
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
    if jal.timed():
        cmd = ["time"]
    else:
        cmd = []
    if jal.coverage():
        cmd = cmd + ["cover", "run"]
    cmd = cmd + (["node"] if not jal.coverage() else [])
    return subprocess.check_output(cmd + [script] + [x for x in args]) 

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

def move_coverage(jalangi):
    if jalangi.coverage():
        shutil.move(".coverage_data", "..")

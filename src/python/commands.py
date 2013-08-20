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

import util
import os
from tempfile import mkdtemp
import shutil
import glob
import time

def analysis(analysis, filee, jalangi=util.DEFAULT_INSTALL):
    temp_dir = mkdtemp()
    os.chdir(temp_dir)
    #Instrument file first
    (instrumented_f,out) = instrument(filee, jalangi=jalangi)
    util.mkempty("inputs.js")
    print "--- Recording execution of {} ----".format(filee)    
    print record(filee,instrumented_f)
    print "---- Replaying {} with {}----".format(filee,analysis)
    os.putenv("JALANGI_MODE", "replay")
    os.putenv("JALANGI_ANALYSIS", analysis)
    print replay(jalangi)
    util.move_coverage(jalangi)

def record(filee, instrumented_f, jalangi=util.DEFAULT_INSTALL):
    os.putenv("JALANGI_MODE", "record")
    os.putenv("JALANGI_ANALYSIS", "none")
    print instrumented_f
    return util.run_node_script(os.path.join(os.path.dirname(filee + ".js"),instrumented_f), jalangi=jalangi)
    
def instrument(filee,output_dir=".",jalangi=util.DEFAULT_INSTALL):
    """
    Invoke Jalangi and instrument the file
    returns: A tuple of the filename of the instrumented version and the output of Jalangi
    """
    print "---- Instrumenting {} ----" .format(filee)
    output = util.run_node_script(jalangi.instrumentation_script(), filee + ".js",  jalangi=jalangi)
    return (os.path.basename(filee) + "_jalangi_.js", output)

def replay(jalangi=util.DEFAULT_INSTALL):
    """
    Invokes the replay.js script and returns the output
    """
    return util.run_node_script(jalangi.replay_script(), jalangi=jalangi)

def concolic (filee, inputs, jalangi=util.DEFAULT_INSTALL):
    try:
        shutil.rmtree("jalangi_tmp")
    except: pass
    os.mkdir("jalangi_tmp")
    os.mkdir("jalangi_tmp/out")
    os.putenv("JALANGI_HOME", jalangi.get_home())
    os.chdir("jalangi_tmp")
    (instrumented_f, out) = instrument(os.path.join(os.pardir,filee), jalangi=jalangi)
    i = 0
    iters = 0
    while i <= iters and i <= inputs:
        try:                    # Ignore failures on first iteration
            os.remove("inputs.js")
            shutil.copy("jalangi_inputs{}.js".format(i), "inputs.js")
        except:
            pass
        if not os.path.isfile("inputs.js"):
            util.mkempty("inputs.js")
        print "==== Input {} ====".format(i)
        print "---- Runing without instrumentation ----"
        try:
            os.remove("jalangi_trace")
        except:
            pass
        out = util.run_node_script(os.path.join(os.pardir,filee + ".js"), jalangi=jalangi)
        (open("jalangi_normal", "w")).write(out)
        print "---- Recording execution of {} ----".format(filee)
        record(os.path.join(os.pardir,filee), instrumented_f)
        print "---- Replaying {} ----".format(filee)
        os.putenv("JALANGI_MODE", "replay")
        os.putenv("JALANGI_ANALYSIS", "analyses/concolic/SymbolicEngine")
        rep = replay()
        (open("jalangi_replay", "w")).write(rep)
        print rep
        #TODO: Echo number of lines??
        #TODO: Calls to diff??
        iters = int(util.head("jalangi_tail",1)[0])
        i = i + 1
        
    iters = iters + 1
    if iters == inputs:
        print "{}.js passed".format(filee)
    else:
        print "{}.js failed".format(filee)
    util.move_coverage(jalangi)

def rerunall(filee, jalangi=util.DEFAULT_INSTALL):
    os.chdir("jalangi_tmp")
    try:
        shutil.rmtree(".coverage_data")
        os.remove("inputs.js")
        util.mkempty("inputs.js")
    except: pass
    print "---- Runing tests on {} ----".format(filee)
    util.run_node_script(os.path.join(os.pardir, filee + ".js"), jalangi=jalangi)
    for i in glob.glob("jalangi_inputs*"):
        print "Running {} on {}".format(filee, i)
        shutil.copy(i, "inputs.js")
        util.run_node_script(os.path.join(os.pardir,filee +".js"), jalangi=jalangi)
    if jalangi.coverage():
        time.sleep(2)
        os.system("cover combine")
        os.system("cover report")
        print "Test results are in {}".format("cover_html/index.html")


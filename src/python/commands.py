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
from shutil import copyfile
from subprocess import Popen
from time import sleep
import webbrowser


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
    print "!!", filee, inputs
    os.mkdir("jalangi_tmp")
    os.mkdir("jalangi_tmp/out")
    os.putenv("JALANGI_HOME", jalangi.get_home())
    os.chdir("jalangi_tmp")
    (instrumented_f, out) = instrument(os.path.join(os.pardir,filee), jalangi=jalangi)
    i = 0
    iters = 0
    mismatch = False
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
        norm = util.run_node_script(os.path.join(os.pardir,filee + ".js"), jalangi=jalangi)
        #(open("jalangi_normal", "w")).write(norm)
        print "---- Recording execution of {} ----".format(filee)
        rec = record(os.path.join(os.pardir,filee), instrumented_f)
        print "---- Replaying {} ----".format(filee)
        os.putenv("JALANGI_MODE", "replay")
        os.putenv("JALANGI_ANALYSIS", "analyses/concolic/SymbolicEngine")
        rep = replay()
        (open("jalangi_replay", "w")).write(rep)
        print rep
        if norm != rep: #TODO: Factor out this.
            import difflib
            with open("jalangi_test_results", 'a') as f:
                f.write("\n")
                for line in difflib.unified_diff(norm.splitlines(1), rec.splitlines(1), fromfile='normal', tofile='replay'):
                    f.write(line)
        if rec != rep:
            import difflib
            with open("jalangi_test_results", 'a') as f:
                f.write("\n")
                for line in difflib.unified_diff(rec.splitlines(1), rep.splitlines(1), fromfile='replay', tofile='record'):
                    f.write(line)
        #TODO: Echo number of lines??
        try:
            iters = int(util.head("jalangi_tail",1)[0])
        except: pass
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

def run_config(config, jalangi=util.DEFAULT_INSTALL):
    os.chdir(config.working)
    if not config.analysis in jalangi.analyses():
        raise util.JalangiException(jalangi, "Unknown analysis {}".format(config.analysis))
    if config.analysis == "concolic":
        ops = config.parameters.split()
        if len(ops) == 2 and ops[0] == "-i":
            concolic( os.path.join(config.working,config.mainfile), int(ops[1]), jalangi)
        else:
            concolic( os.path.join(config.working,config.mainfile), 1000, jalangi)
    else:
        analysis(util.get_analysis(config.analysis), os.path.join(config.working,config.mainfile) ,  jalangi)

def rrserver(url):
    def delete_glob(pat):
        for x in glob.glob(pat):
            os.remove(x)
    delete_glob("jalangi_trace*")
    delete_glob("jalangi_taint*")
    delete_glob("jalangi_dependency")
    delete_glob("jalangi_next*")
    delete_glob("ok_jalangi_next*")
    try:
        copyfile("next.js", "jalangi_next.js")
    except: pass
    import sys
    Popen(['node', 'src/js/commands/socket.js', '127.0.0.1', '8080', sys.argv[1]])
    sleep(2)
    webbrowser.open(sys.argv[2])
    
  

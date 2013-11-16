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
    try:
        shutil.rmtree("jalangi_tmp")
    except: pass
    os.mkdir("jalangi_tmp")
    os.chdir("jalangi_tmp")
    #Instrument file first
    (instrumented_f,out) = instrument(filee, jalangi=jalangi)
    util.mkempty("inputs.js")
    print "---- Recording execution of {} ----".format(filee)
    os.putenv("JALANGI_MODE", "record")
    os.putenv("JALANGI_ANALYSIS", "none")
    util.run_node_script_std(os.path.join(os.path.dirname(filee + ".js"),instrumented_f), jalangi=jalangi)
    print "---- Replaying {} ----".format(filee)
    os.putenv("JALANGI_MODE", "replay")
    os.putenv("JALANGI_ANALYSIS", analysis)
    util.run_node_script_std(jalangi.replay_script(), jalangi=jalangi)
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
    util.run_node_script_std(jalangi.instrumentation_script(), filee + ".js",  jalangi=jalangi)
    return (os.path.basename(filee) + "_jalangi_.js", "")

def replay(f=None, jalangi=util.DEFAULT_INSTALL, analysis=None):
    """
    Invokes the replay.js script and returns the output
    """
    os.putenv("JALANGI_MODE", "replay")
    if analysis != None:
        os.putenv("JALANGI_ANALYSIS", util.get_analysis(analysis))
    if f != None:
        print "Hep",f 
        return util.run_node_script(jalangi.replay_script(),f, jalangi=jalangi)
    else:
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
        try: # Ignore failures on first iteration
            os.remove("inputs.js")
            shutil.copy("jalangi_inputs{}.js".format(i), "inputs.js")
        except:
            pass
        if not os.path.isfile("inputs.js"):
            util.mkempty("inputs.js")
        print "==== Input {} ====".format(i)
        print "---- Recording execution of {} ----".format(filee)
        os.putenv("JALANGI_MODE", "record")
        os.putenv("JALANGI_ANALYSIS", "none")
        util.run_node_script_std(os.path.join(os.path.dirname(os.path.join(os.pardir,filee) + ".js"),instrumented_f), jalangi=jalangi)
        print "---- Replaying {} ----".format(filee)
        os.putenv("JALANGI_MODE", "replay")
        os.putenv("JALANGI_ANALYSIS", "analyses/concolic/SymbolicEngine")
        util.run_node_script_std(jalangi.replay_script(), jalangi=jalangi)
        
        try:
            iters = int(util.head("jalangi_tail",1)[0])
        except: pass
        i = i + 1
        
    for i in glob.glob("jalangi_inputs*"):
        print "*** Generated (jalangi_tmp/{}:1:1) for ({}.js:1:1)".format(i,filee)
    iters = iters + 1
    if iters == inputs:
        print "{}.js passed".format(filee)
        with open("../jalangi_sym_test_results", 'a') as f:
         f.write("{}.js passed\n".format(filee))
    else:
        print "{}.js failed".format(filee)
        with open("../jalangi_sym_test_results", 'a') as f:
         f.write("{}.js failed\n".format(filee))
    util.move_coverage(jalangi)


def testrr (filee, jalangi=util.DEFAULT_INSTALL):
    try:
        shutil.rmtree("jalangi_tmp")
    except: pass
    os.mkdir("jalangi_tmp")
    os.mkdir("jalangi_tmp/out")
    os.putenv("JALANGI_HOME", jalangi.get_home())
    os.chdir("jalangi_tmp")
    (instrumented_f, out) = instrument(os.path.join(os.pardir,filee), jalangi=jalangi)
    try:                    # Ignore failures on first iteration
        os.remove("inputs.js")
        shutil.copy("jalangi_inputs{}.js".format(i), "inputs.js")
    except:
        pass
    if not os.path.isfile("inputs.js"):
        util.mkempty("inputs.js")
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
    os.putenv("JALANGI_ANALYSIS", "none")
    rep = replay()
    (open("jalangi_replay", "w")).write(rep)
    #print rep
    try:
	    wcl = util.count_lines("jalangi_trace")
	
	    with open("../jalangi_test_results", 'a') as f:
		f.write("# of lines in jalangi_trace for {}: {}".format(filee,str(wcl)))
		f.write("\n")
    except: pass	
    if norm != rep: #TODO: Factor out this.
        print "{}.js failed".format(filee)
        import difflib
        with open("../jalangi_test_results", 'a') as f:
            f.write("\n")
            for line in difflib.unified_diff(norm.splitlines(1), rec.splitlines(1), fromfile='normal.{}'.format(filee), tofile='replay.{}'.format(filee)):
                f.write(line)
    if rec != rep:
        print "{}.js failed".format(filee)
        import difflib
        with open("../jalangi_test_results", 'a') as f:
            f.write("\n")
            for line in difflib.unified_diff(rec.splitlines(1), rep.splitlines(1), fromfile='replay.{}'.format(filee), tofile='record.{}'.format(filee)):
                f.write(line)
        
    util.move_coverage(jalangi)



def symbolic (filee, inputs, analysis, jalangi=util.DEFAULT_INSTALL):
    try:
        shutil.rmtree("jalangi_tmp")
    except: pass
    os.mkdir("jalangi_tmp")
    os.putenv("JALANGI_HOME", jalangi.get_home())
    os.chdir("jalangi_tmp")
    (instrumented_f, out) = instrument(os.path.join(os.pardir,filee), jalangi=jalangi)
    i = 0
    iters = 1
    while i <= iters and i <= inputs:
        try:                    # Ignore failures on first iteration
            os.remove("inputs.js")
        except:
            pass
        if not os.path.isfile("inputs.js"):
            util.mkempty("inputs.js")
        os.putenv("JALANGI_MODE", "symbolic")
        os.putenv("JALANGI_ANALYSIS", analysis)
        util.run_node_script_std(os.path.join(os.path.dirname(os.path.join(os.pardir,filee) + ".js"),instrumented_f), jalangi=jalangi, savestderr=True)
        try:
            iters = int(util.head("jalangi_tail",1)[0])
        except: pass
        i = i + 1
    if iters == inputs:
        print "{}.js passed".format(filee)
        with open("../jalangi_sym_test_results", 'a') as f:
         f.write("{}.js passed\n".format(filee))
    else:
        print "{}.js failed".format(filee)
        with open("../jalangi_sym_test_results", 'a') as f:
         f.write("{}.js failed\n".format(filee))
    print "Tests Generated = {}".format(iters)

def rerunall(filee, jalangi=util.DEFAULT_INSTALL):
    os.chdir("jalangi_tmp")
    try:
        shutil.rmtree(".coverage_data")
        os.remove("inputs.js")
        util.mkempty("inputs.js")
    except: pass
    print "---- Runing tests on {} ----".format(filee)
    util.run_node_script_std(os.path.join(os.pardir, filee + ".js"), jalangi=jalangi)
    for i in glob.glob("jalangi_inputs*"):
        print "Running {} on {}".format(filee, i)
        shutil.copy(i, "inputs.js")
        util.run_node_script_std(os.path.join(os.pardir,filee +".js"), jalangi=jalangi, savestderr=True)
    if jalangi.coverage():
        time.sleep(2)
        os.system("cover combine")
        os.system("cover report html")
        shutil.copy("cover_html/index.html","../jalangi/out/out.html")
        for x in glob.glob("cover_html/*.*"):
            shutil.copy(x,  "../jalangi/out/".format(x))
        print "Test results are in {}".format("cover_html/index.html")

def run_config(config, jalangi=util.DEFAULT_INSTALL):
    def chdir():
        if (config.working == ""):
            os.chdir(jalangi.get_home())
        else:
            os.chdir(config.working)
    chdir()
    if config.cover:
        jalangi.use_coverage = True
    if config.analysis == "concolic":
        ops = config.parameters.split()
        if len(ops) == 2 and ops[0] == "-i":
            concolic( os.path.join(config.working,config.mainfile), int(ops[1]), jalangi)
        else:
            concolic( os.path.join(config.working,config.mainfile), 1000, jalangi)
    elif config.analysis == "record":
        script = config.mainfile
        instrument(script)
        p = config.parameters
        rrserver(p)
        time.sleep(10000)
    elif config.analysis == "replay":
        print util.run_node_script("src/js/commands/createReplay.js", "jalangi_trace1", jalangi=jalangi)
        webbrowser.open(os.path.abspath("jalangi_trace1.html"))
    elif config.analysis.startswith("replay/"):
        rm = config.analysis.split("/")[1]
        util.handle_dot_files(config.working, os.path.abspath(config.mainfile))
        print replay(f=config.mainfile, jalangi=jalangi, analysis=rm)
    elif config.analysis == "rerunall":
        rerunall(os.path.join(config.working,config.mainfile), jalangi)
    else:
        if not config.analysis in jalangi.analyses():
            raise util.JalangiException(jalangi, "Unknown analysis {}".format(config.analysis))
        analysis(util.get_analysis(config.analysis), os.path.join(config.working,config.mainfile) ,  jalangi)
    if config.dot != False:
        put_dot = config.dot
        chdir()
        p = os.path.dirname(config.mainfile)
        dot_files = []
        for f in glob.glob(os.path.join(p, "*.dot").format(p)):
            try: 
                shutil.copy(f,put_dot)
            except: pass
            dot_files.append(os.path.abspath(f))
            util.render_dot_files(put_dot, dot_files)

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
    Popen([util.find_node(), 'src/js/commands/socket.js', '127.0.0.1', '8000', url])
    sleep(2)
    webbrowser.open(url)
    
  

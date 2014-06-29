import os
import subprocess
import sys
import shutil
import tempfile
from tempfile import NamedTemporaryFile
import glob
import os
from tempfile import mkdtemp
import time
from subprocess import Popen
import webbrowser

def mkempty(f):
    """
    Create f as an empty file
    """
    open(f, 'w').close() 

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

def execute_return(script, **kwargs):
    """Execute script and returns output string"""
    saveStdErr = kwargs['savestderr'] if 'savestderr' in kwargs else False
    cmd = [find_node()] + script.split()
    print ' '.join(cmd)
    with NamedTemporaryFile() as f:
         try:
             subprocess.check_call(cmd,stdout=f, 
                                   stderr=f if saveStdErr else open(os.devnull, 'wb'),bufsize=1000)
             f.seek(0)
             return f.read()
         except subprocess.CalledProcessError as e:
             f.seek(0)
             return f.read()

def execute_return_np(script, **kwargs):
    """Execute script and returns output string"""
    saveStdErr = kwargs['savestderr'] if 'savestderr' in kwargs else False
    cmd = [find_node()] + script.split()
    with NamedTemporaryFile() as f:
         try:
             subprocess.check_call(cmd,stdout=f,
                                   stderr=f if saveStdErr else open(os.devnull, 'wb'),bufsize=1000)
             f.seek(0)
             return f.read()
         except subprocess.CalledProcessError as e:
             f.seek(0)
             return f.read()

def execute(script, *args):
    """Execute script and print output"""
    cmd = [find_node()] + script.split()
    print ' '.join(cmd)
    subprocess.call(cmd)

def execute_np(script, *args):
    """Execute script and print output"""
    cmd = [find_node()] + script.split()
    subprocess.call(cmd)


WORKING_DIR = os.getcwd()
    
JALANGI_HOME = os.path.abspath(os.path.join(os.path.dirname(__file__),os.pardir))

INSTRUMENTATION_SCRIPT = JALANGI_HOME + "/src/js/instrument/esnstrument.js"

INST_DIR_SCRIPT = JALANGI_HOME + "/src/js/commands/instrument.js"

REPLAY_SCRIPT = JALANGI_HOME + "/src/js/commands/replay.js"

RECORD_SCRIPT = JALANGI_HOME + "/src/js/commands/record.js"

DIRECT_SCRIPT = JALANGI_HOME + "/src/js/commands/direct.js"

SYMBOLIC_SCRIPT = JALANGI_HOME + "/src/js/commands/symbolic.js"

ANALYSIS2_SCRIPT = JALANGI_HOME + "/src/js/commands/analysis2.js"

def create_and_cd_jalangi_tmp():
    try:
        shutil.rmtree("jalangi_tmp")
    except: pass
    os.mkdir("jalangi_tmp")
    os.chdir("jalangi_tmp")

def cd_parent():
    os.chdir('..')        

def full_path(file):
    return os.path.abspath(file)
    
def instrument(file):
    """
    Invoke Jalangi and instrument the file
    returns a list of instrumented file names
    """
    execute(INSTRUMENTATION_SCRIPT+' '+file)
    return os.path.splitext(file)[0]+"_jalangi_.js"

def record(file):
    return execute_return(RECORD_SCRIPT + ' ' + file, savestderr=True)

def replay(tracefile=None, analysis=None):
    """
    Invokes the replay.js script and returns the output
    """
    trace = "jalangi_trace" if tracefile == None else tracefile
    if analysis != None:
        return execute_return(REPLAY_SCRIPT + " --tracefile "+trace+" --analysis "+analysis, savestderr=True)
    else:
        return execute_return(REPLAY_SCRIPT+" --tracefile "+trace, savestderr=True)

def direct(file, analysis=None):
    print instrumented_f
    if analysis != None:
        return execute_return(DIRECT_SCRIPT+" --smemory --analysis "+analysis+' '+file, savestderr=True)
    else:
        return execute_return(DIRECT_SCRIPT+" --smemory "+file, savestderr=True)




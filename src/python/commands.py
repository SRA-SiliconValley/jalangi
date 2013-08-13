import util
import instrument
import os
from tempfile import mkdtemp

def analysis(analysis, filee, jalangi=util.DEFAULT_INSTALL):
    temp_dir = mkdtemp()
    os.chdir(temp_dir)
    #Instrument file first
    (instrumented_f,out) = instrument(filee, jalangi)
    util.mkempty("inputs.js")
    print "--- Recording execution of {} ----".format(filee)    
    os.putenv("JALANGI_MODE", "record")
    os.putenv("JALANGI_ANALYSIS", "none")
    print instrumented_f
    print util.run_node_script(os.path.join(os.path.dirname(filee),instrumented_f))
    print "---- Replaying {} with {}----".format(filee,analysis)
    os.putenv("JALANGI_MODE", "replay")
    os.putenv("JALANGI_ANALYSIS", analysis)
    print replay(jalangi)

def instrument(filee,output_dir=".",jalangi=util.DEFAULT_INSTALL):
    """
    Invoke Jalangi and instrument the file
    returns: A tuple of the filename of the instrumented version and the output of Jalangi
    """
 #   if not os.path.exists(filee):
 #       print filee
 #       raise util.JalangiException(jalangi, "File " + filee + " not found")
    print "---- Instrumenting {} ----" .format(filee)
    output = util.run_node_script(jalangi.instrumentation_script(), filee + ".js")
    return (os.path.basename(filee) + "_jalangi_.js", output)

def replay(jalangi=util.DEFAULT_INSTALL):
    """
    Invokes the replay.js script and returns the output
    """
    return util.run_node_script(jalangi.replay_script())

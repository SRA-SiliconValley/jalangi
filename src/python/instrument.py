import util
import os

def instrument(filee,output_dir=".",jalangi=util.DEFAULT_INSTALL):
    """
    Invoke Jalangi and instrument the file
    returns: A tuple of the filename of the instrumented version and the output of Jalangi
    """
    if not os.path.exists(filee):
        raise util.JalangiException(jalangi, "File " + filee + " not found")
    output = util.run_node_script(jalangi.instrumentation_script(), filee)
    return (filee + "_jalangi_.js", output)



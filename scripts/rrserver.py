import sys
import os
import glob
from shutil import copyfile
from subprocess import Popen
from time import sleep

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

Popen(['node', 'src/js/commands/socket.js', '127.0.0.1', '8080', sys.argv[1]])
sleep(2)
print "Use your browser to access {}".format(sys.argv[1])


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

from subprocess import call
from os.path import exists
import shutil
import os
from time import sleep
from sys import platform
import zipfile
from urllib import urlretrieve

def npm_install(pack):
    print "---> installing {}".format(pack)
    if os.system(" ".join(['npm', 'install', pack])) != 0:
        print "node.js failed to install {}".format(pack)
        exit(1)

def call_fail(l):
    if call(l) != 0:
        print "{} failed".format(" ".join(l))
        exit(1)

def del_dir(d):
    if not exists(d):
        return 
    if platform == "win32":
        res = os.system('rmdir /q /s {}'.format(d))
    else:
        res = os.system('rm -rf {}'.format(d))
    if res != 0:
        print "failed to delete directory {}".format(res)
        exit(1)

npm_install("uglify-js@1")
npm_install("ffi")
npm_install("cover")
npm_install("websocket")
npm_install("source-map")
npm_install("esprima")
npm_install("estraverse")
npm_install("escodegen")
npm_install("dryice")
npm_install("execSync")

if exists("thirdparty"):
    shutil.rmtree("thirdparty")

os.mkdir("thirdparty")
call_fail(["git", "clone", "--recursive", "git://github.com/Trenker/Browser-UglifyJS.git", "thirdparty/browser-uglifyjs"])
os.chdir("thirdparty/browser-uglifyjs/lib")
del_dir("Uglifyjs")
call_fail(["git", "clone", "git://github.com/mishoo/UglifyJS.git"])
os.chdir("UglifyJS")
sleep(2)
del_dir(".git")
os.chdir("../..")
del_dir(".git")
call_fail(["node", "build.js"])
shutil.move("build/uglifyjs.1.2.5.js", "../")
os.chdir("../")

del_dir("esprima")
call_fail(["git", "clone", "git://github.com/ariya/esprima.git"])
os.chdir("esprima")
del_dir(".git")
os.chdir("..")

del_dir("escodegen")
call_fail(["git", "clone", "git://github.com/Constellation/escodegen.git"])
os.chdir("escodegen")
del_dir(".git")
os.chdir("..")

del_dir("estraverse")
call_fail(["git", "clone", "git://github.com/Constellation/estraverse.git"])
os.chdir("estraverse")
del_dir(".git")
os.chdir("..")

del_dir("source-map")
call_fail(["git", "clone", "git://github.com/mozilla/source-map.git"])
os.chdir("source-map")
npm_install("amdefine")
call_fail(["node", "Makefile.dryice.js"])
del_dir(".git")

os.chdir("..")

print "---> Downloading cvc3"
if platform == "darwin":
    urlretrieve("http://www.cs.nyu.edu/acsys/cvc3/releases/2.4.1/macosx/cvc3-2.4.1-macosx-optimized-static.tar.gz",
                "cvc3-2.4.1-macosx-optimized-static.tar.gz")
    call_fail(["tar", "zvxf", "cvc3-2.4.1-macosx-optimized-static.tar.gz"])
    shutil.move("cvc3-2.4.1-macosx-optimized-static", "cvc3")
elif platform == "linux2":
    urlretrieve("http://www.cs.nyu.edu/acsys/cvc3/releases/2.4.1/linux32/cvc3-2.4.1-optimized-static.tar.gz",
                "cvc3-2.4.1-optimized-static.tar.gz")
    call_fail(["tar", "zvxf", "cvc3-2.4.1-optimized-static.tar.gz"])
    shutil.move("cvc3-2.4.1-optimized-static", "cvc3")
else: #windows
    urlretrieve("http://www.cs.nyu.edu/acsys/cvc3/releases/2.4.1/win32/cvc3-2.4.1-win32-optimized.zip",
                "cvc3-2.4.1-win32-optimized.zip")
    z = zipfile.ZipFile("cvc3-2.4.1-win32-optimized.zip", mode="r")
    z.extractall()
    shutil.move("cvc3-2.4.1-win32-optimized", "cvc3")

os.chdir("cvc3/bin")

if os.system("{} < ../../../scripts/formula.cvc3".format("cvc3.exe" if platform == "win32" else "cvc3")) != 0:
    print "cvc3 installation failed! Make sure that you have libgmp installed in your machine.  This is a common cause for the failure"
    exit(1)

os.chdir("../..")

os.mkdir("javalib")
os.chdir("javalib")
print "---> Downloading http://www.brics.dk/automaton/automaton.jar"
urlretrieve("http://www.brics.dk/automaton/automaton.jar", "automaton.jar")
os.chdir("../..")

del_dir("jout")
os.mkdir("jout")
os.mkdir("jout/production")
os.mkdir("jout/production/jalangijava")

call_fail(["javac", "-cp", "./thirdparty/javalib/automaton.jar", "-d", 
           "jout/production/jalangijava", "src/java/RegexpEncoder.java"])
if os.system('java -cp ./jout/production/jalangijava/{}./thirdparty/javalib/automaton.jar RegexpEncoder length ".*www\\..*" y38 false'.format(";" if platform == "win32" else ":")) != 0:
    print "Installation of Java part of Jalangi failed!  Make sure that you have Sun's JDK 1.6 or higher."
    exit(1)

call_fail(["node", "src/js/instrument/esnstrument.js", "src/js/analyses/concolic/SymbolicFunctions.js"])
call_fail(["node", "src/js/instrument/esnstrument.js", "src/js/analyses/puresymbolic/SymbolicFunctions2.js"])   
call_fail(["node", "src/js/instrument/esnstrument.js", "src/js/analyses/puresymbolic/SymbolicFunctions3.js"])   

print "---> Installation successful."
print "---> run python scripts/sym.py to make sure all tests pass"

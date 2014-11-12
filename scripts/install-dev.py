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

# Author: Manu Sridharan

# NOTE: This script probably needs to be run under 'sudo'

from subprocess import call
from os.path import exists
import shutil
import os
import stat
from time import sleep
from sys import platform
import zipfile
from urllib import urlretrieve

def call_fail(l):
    if call(l) != 0:
        print "{} failed".format(" ".join(l))
        exit(1)


# selenium Python bindings, using pip
print "---> Installing selenium for Python"
call_fail(["easy_install","selenium"])

# chromedriver
os.chdir("thirdparty");
print "---> Downloading chromedriver"
if platform == "darwin":
    urlretrieve("http://chromedriver.storage.googleapis.com/2.12/chromedriver_mac32.zip",
                "chromedriver.zip")
elif platform == "linux2":
    urlretrieve("http://chromedriver.storage.googleapis.com/2.12/chromedriver_linux64.zip",
                "chromedriver.zip")
else: #windows
    urlretrieve("http://chromedriver.storage.googleapis.com/2.12/chromedriver_win32.zip",
                "chromedriver.zip")
z = zipfile.ZipFile("chromedriver.zip", mode="r")
z.extractall()
if platform == "darwin" or platform == "linux2":
    st = os.stat('chromedriver')
    os.chmod('chromedriver', st.st_mode | 0111)

print "---> Installation of dev dependencies complete."

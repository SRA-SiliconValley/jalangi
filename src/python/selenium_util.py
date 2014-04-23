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

from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait # available since 2.4.0
from selenium.webdriver.support import expected_conditions as EC # available since 2.26.0
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import time
import util
import os
import sys
import tempfile

chromedriver_loc = ""

def set_chromedriver_loc(path):
    global chromedriver_loc
    chromedriver_loc = path

def run_html_in_selenium(html_filename,selenium_fn):
    return run_url_in_selenium('file://' + html_filename,selenium_fn)

# creates a WebDriver for Chrome, loads the URL, and then
# executes selenium_fn on the driver and returns the result
def run_url_in_selenium(url,selenium_fn):
#    return run_url_in_selenium_ff(url,selenium_fn)
    global chromedriver_loc
    d = DesiredCapabilities.CHROME
    d['loggingPrefs'] = { 'browser':'ALL' }
    os.environ["webdriver.chrome.driver"] = chromedriver_loc
    driver = webdriver.Chrome(executable_path=chromedriver_loc,desired_capabilities=d)
    driver.set_window_size(1280,1024)
    driver.get(url)
    try:
        return selenium_fn(driver)
    finally:
        driver.quit()

def run_url_in_selenium_ff(url,selenium_fn):
    d = DesiredCapabilities.FIREFOX
    d['loggingPrefs'] = { 'browser':'ALL' }
    driver = webdriver.Firefox(capabilities=d)
    driver.set_window_size(1280,1024)
    driver.get(url)
    try:
        return selenium_fn(driver)
    finally:
        driver.quit()

# JavaScript code to capture error messages from browser
on_error_handler_code = """
window.__jalangi_errormsgs__ = [];
window.onerror = function(errorMsg) {
  window.__jalangi_errormsgs__.push(errorMsg);
};
"""


# returns a function that, when invoked with a driver:
# (1) runs the exercise_fn on the driver, if given
# (2) returns the error messages from the browser, followed by the browser's console.log output
def get_regression_msgs(capture_errors, exercise_fn=None):
    def real_driver(driver):
        WebDriverWait(driver,10).until(lambda driver: driver.execute_script("return document.readyState") == "complete")
        if exercise_fn != None:
            exercise_fn(driver)
        # result string will include error messages and then console.log messages
        result = ""
        if capture_errors:
            err_msg_code = """
            return (window.__jalangi_errormsgs__ && window.__jalangi_errormsgs__.length > 0) ? window.__jalangi_errormsgs__.join("") : "";
            """
            result += driver.execute_script(err_msg_code)
        # log messages
        log_msgs = [x['message'].split(' ', 2)[2] for x in driver.get_log('browser') if x['source'] == 'console-api' and x['level'] == 'INFO']
        if len(log_msgs) > 0:
            result += '\n'.join(log_msgs) + '\n'
        return result
    return real_driver


def run_normal(script,jalangi=util.DEFAULT_INSTALL):
    dummy_filename = os.path.join(tempfile.gettempdir(),"dummy.html")
    util.gen_wrapper_html_file([script],dummy_filename,on_error_handler_code)
    return run_html_in_selenium(dummy_filename,get_regression_msgs(True))

def get_regression_msgs_and_trace(capture_errors,exercise_fn=None):
    regression_msg_fn = get_regression_msgs(capture_errors,exercise_fn)
    def real_driver(driver):
        msgs = regression_msg_fn(driver)
        trace = driver.execute_script("return window.J$.trace_output.join(\"\")").encode('utf-8')
        trace_file = open("jalangi_trace", "w")
        trace_file.write(trace)
        trace_file.close()
        return msgs
    return real_driver
    
    
def record(script,jalangi=util.DEFAULT_INSTALL):
    dummy_filename = os.path.join(tempfile.gettempdir(),"dummy.html")
    runtime = [os.path.join(jalangi.get_home(),s) for s in util.RUNTIME_SCRIPTS]
    in_memory_trace_code = "window.__JALANGI_IN_MEMORY_TRACE__ = true;"
    util.gen_wrapper_html_file(runtime + [script],dummy_filename,on_error_handler_code + in_memory_trace_code)
    return run_html_in_selenium(dummy_filename,get_regression_msgs_and_trace(True))


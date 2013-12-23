from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait # available since 2.4.0
from selenium.webdriver.support import expected_conditions as EC # available since 2.26.0
from selenium.webdriver.common.by import By
import time
import util
import os
import sys
import tempfile

def run_html_in_selenium(html_filename,selenium_fn):
    return run_url_in_selenium('file://' + html_filename,selenium_fn)

def run_url_in_selenium(url,selenium_fn):
    driver = webdriver.Chrome()
    driver.set_window_size(1280,1024)
    driver.get(url)
    try:
        return selenium_fn(driver)
    finally:
        driver.quit()

def get_regression_msgs(driver):
    WebDriverWait(driver,10).until(lambda driver: driver.execute_script("return document.readyState") == "complete")
    result = ""
    err_msg_code = """
    return window.__jalangi_errormsgs__.length > 0 ? window.__jalangi_errormsgs__.join("") : "";
    """
    result += driver.execute_script(err_msg_code)
    return result + driver.execute_script("return (window.__regression_msg) ? (window.__regression_msg + \'\\n\'): \"\"")


on_error_handler_code = """
window.__jalangi_errormsgs__ = [];
window.onerror = function(errorMsg) {
  window.__jalangi_errormsgs__.push(errorMsg);
};
"""

def run_normal(script,jalangi=util.DEFAULT_INSTALL):
    dummy_filename = os.path.join(tempfile.gettempdir(),"dummy.html")
    util.gen_wrapper_html_file([script],dummy_filename,on_error_handler_code)
    return run_html_in_selenium(dummy_filename,get_regression_msgs)

def get_regression_msgs_and_trace(driver):
    msgs = get_regression_msgs(driver)
    trace = driver.execute_script("return window.J$.trace_output.join(\"\")").encode('utf-8')
    trace_file = open("jalangi_trace", "w")
    trace_file.write(trace)
    trace_file.close()
    return msgs
    
    
def record(script,jalangi=util.DEFAULT_INSTALL):
    dummy_filename = os.path.join(tempfile.gettempdir(),"dummy.html")
    runtime = [os.path.join(jalangi.get_home(),s) for s in util.RUNTIME_SCRIPTS]
    inline_selenium_flag = "window.__JALANGI_SELENIUM__ = true;"
    util.gen_wrapper_html_file(runtime + [script],dummy_filename,on_error_handler_code + inline_selenium_flag) 
    return run_html_in_selenium(dummy_filename,get_regression_msgs_and_trace)


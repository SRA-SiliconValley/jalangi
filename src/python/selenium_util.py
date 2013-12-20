from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait # available since 2.4.0
from selenium.webdriver.support import expected_conditions as EC # available since 2.26.0
import time
import util
import os
import sys
import tempfile

def run_html_in_selenium(html_filename,selenium_fn):
    driver = webdriver.Chrome()
    driver.set_window_size(1280,1024)
    # go to the google home page
    driver.get('file://' + html_filename)
    try:
        return selenium_fn(driver)
    finally:
        driver.quit()

def get_regression_msgs(driver):
    WebDriverWait(driver,10).until(lambda driver: driver.execute_script("return document.readyState") == "complete")
    return driver.execute_script("return (window.__regression_msg) ? (window.__regression_msg + \'\\n\'): \"\"")


def run_normal(script,jalangi=util.DEFAULT_INSTALL):
    dummy_filename = os.path.join(tempfile.gettempdir(),"dummy.html")
    util.gen_wrapper_html_file([script],dummy_filename)
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
    util.gen_wrapper_html_file(runtime + [script],dummy_filename,inline_selenium_flag) 
    return run_html_in_selenium(dummy_filename,get_regression_msgs_and_trace)

# dummy_filename = os.path.join(tempfile.gettempdir(),"dummy.html")
# print dummy_filename
# script = sys.argv[1]
# util.gen_wrapper_html_file([script],dummy_filename)
# print run_html_in_selenium(dummy_filename,
#                      get_regression_msgs)




# # find the element that's name attribute is q (the google search box)
# inputElement = driver.find_element_by_name("q")

# # type in the search
# inputElement.send_keys("cheese!")

# # submit the form (although google automatically searches now without submitting)
# inputElement.submit()

# # the page is ajaxy so the title is originally this:
# print driver.title

# try:
#     # we have to wait for the page to refresh, the last thing that seems to be updated is the title
#     WebDriverWait(driver, 10).until(EC.title_contains("cheese!"))

#     # You should see "cheese! - Google Search"
#     print driver.title

# finally:
#     driver.quit()


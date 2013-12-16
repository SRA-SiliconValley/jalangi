/*
 * Copyright 2013 Samsung Information Systems America, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Author: Manu Sridharan

/*global require console phantom window */

var page = require('webpage').create(),
    system = require('system'),
    address;

if (system.args.length === 1) {
    console.log('Usage: loadinst.js <some URL>');
    phantom.exit();
}

address = system.args[1];

// set a flag indicating we're running in PhantomJS
page.onInitialized = function () {
	page.evaluate(function () {
		window.__JALANGI_PHANTOM__ = true;
	});
};

page.onConsoleMessage = function (msg) {
    console.log(msg);
};

var fs = require('fs');

page.open(address, function (status) {
    var trace = page.evaluate(function () {
         return window.J$.trace_output.join("");
      });
    fs.write("jalangi_trace", trace);
    phantom.exit();
});

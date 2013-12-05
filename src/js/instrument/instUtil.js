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

/*jslint node: true */
var fs = require('fs');
var urlParser = require('url');


/**
 * which source files are required for Jalangi to run in the browser?
 */
var headerSources = ["src/js/analysis.js", 
					"src/js/InputManager.js", 
					"node_modules/escodegen/escodegen.browser.js",
					"node_modules/esprima/esprima.js",
					"src/js/utils/astUtil.js",
					"src/js/instrument/esnstrument.js"];
					

/**
 * concatenates required scripts for Jalangi to run in the browser into a single string
 */
// TODO this assumes we are run from root Jalangi directory.  Allow for parameter / environment variable?
var headerCode = "";
headerSources.forEach(function (src) {
	headerCode += fs.readFileSync(src);
});

function getHeaderCode() {
	return headerCode;
}

var inlineRegexp = /#(inline|event-handler|js-url)/;

/**
 * Does the url (obtained from rewriting-proxy) represent an inline script?
 */
function isInlineScript(url) {
	return inlineRegexp.test(url);
}

/**
 * generate a filename for a script with the given url
 */
function createFilenameForScript(url) {
	// TODO make this much more robust
	var parsed = urlParser.parse(url);
	if (inlineRegexp.test(url)) {
		return parsed.hash.substring(1) + ".js";
	} else {
		return parsed.pathname.substring(parsed.pathname.lastIndexOf("/")+1);	
	}
}

exports.getHeaderCode = getHeaderCode;
exports.isInlineScript = isInlineScript;
exports.createFilenameForScript = createFilenameForScript;
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
/*global describe it */
var assert = require("assert"),
	astUtil = require("./../src/js/utils/astUtil.js"),
	acorn = require("acorn"),
    esnstrument = require("./../src/js/instrument/esnstrument"),
    temp = require('temp');

	
function checkCode(code) {
    var instCode = esnstrument.instrumentCodeDeprecated(code, {wrapProgram: false, dirIIDFile: temp.dir}).code;
//    console.log(instCode);
	var ast = acorn.parse(instCode);
	// NOTE: this is not a robust way to do a deep copy of ASTs,
	// just good enough for unit tests

//    console.log("init:\n" + JSON.stringify(ast,undefined,2));
	var astCopy = JSON.parse(JSON.stringify(ast));
	var table = astUtil.serialize(ast);
	// assert.deepEqual(ast,astCopy); would fail here
//    console.log("serialized:\n" + JSON.stringify(ast,undefined,2));
	astUtil.deserialize(table);
//    console.log("deserialized:\n" + JSON.stringify(ast,undefined,2));
	assert.deepEqual(ast,astCopy);
}

describe('astSerialization', function () {
	describe('#deserialize()', function () {
		it('should handle basic', function () {
			checkCode("function foo(x) { function bar() { return x + 3; } x = 7; return bar(); }");
		});
		it('should handle basic 2', function () {
			checkCode("function foo() { return 2+3+4+5+6+7+8; }");
		});
        it('should handle eval', function () {
            checkCode("function foo() { eval(this); }");
        });
	});
});
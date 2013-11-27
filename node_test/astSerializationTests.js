/*jslint node: true */
/*global describe it */
var assert = require("assert"),
	astUtil = require("./../src/js/utils/astUtil.js"),
	esprima = require("esprima"),
    esnstrument = require("./../src/js/instrument/esnstrument");

	
function checkCode(code) {
	var ast = esprima.parse(esnstrument.instrumentCode(code, false));
	// NOTE: this is not a robust way to do a deep copy of ASTs,
	// just good enough for unit tests
	var astCopy = JSON.parse(JSON.stringify(ast));
	var table = astUtil.serialize(ast);
	// assert.deepEqual(ast,astCopy); would fail here
	astUtil.deserialize(table);
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
	});
});
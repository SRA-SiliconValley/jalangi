/*
 * Copyright 2014 Samsung Information Systems America, Inc.
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

/**
 * Created by m.sridharan on 2/6/14.
 */


/*jslint node: true */
/*global describe */
/*global it */
var assert = require("assert"),
    astUtil = require("./../src/js/utils/astUtil.js"),
    acorn = require("acorn"),
    esnstrument = require("./../src/js/instrument/esnstrument");


function collectTopLevel(instResult) {
    var result = [];
    Object.keys(instResult).forEach(function (iid) {
        if (instResult[iid].topLevelExpr) {
            result.push(iid);
        }
    });
    return result;
}

function checkCode(code, expectedTopLevel) {
    esnstrument.resetIIDCounters();
    var instResult = esnstrument.instrumentCode(code, {wrapProgram: false, metadata: true });
    var topLevelResult = collectTopLevel(instResult.iidMetadata);
    assert.deepEqual(topLevelResult, expectedTopLevel);
}

describe('topLevelExprs', function () {
    it('should handle basic', function () {
        checkCode("3+4+5", [10]);
    });
    it('should handle expression statement', function() {
        checkCode("function foo() { fizz(); }", [9]);
    });
    it('should handle return', function() {
        checkCode("function foo() { return (4+(7-3)); }", [17]);
    });
    it('should handle deref of function result', function() {
        checkCode("var x = foo().f;", [17]);
    });
    it('should handle conditional expression', function() {
        // here, the condition, then, and else expressions are
        // all treated as top-level, which is fine
        checkCode("function foo() { (flag ? a() : b()); }", [3,13,21]);
    });
    it('should handle if condition', function() {
        // here, the condition, then, and else expressions are
        // all treated as top-level, which is fine
        checkCode("function foo() { if (flag) { return a(); } else { return b(); } }", [3,17,29]);
    });
    it('should handle nested assigns and conditionl expression', function() {
        // here, the condition, then, and else expressions are
        // all treated as top-level, which is fine
        checkCode("function foo() { x = y = (a ? b : c); }", [21]);
    });
    it('should handle multi-statement function', function() {
        checkCode("function foo() { fizz(); x = 3+5+baz().f; }", [9,33]);
    });
    it('should handle function declared in object literal', function() {
        checkCode("var x = { foo: function() { fizz(); x = 3+5+baz().f; } };",  [9,33,53]);
    });
    it('should handle function called with object literal', function() {
        checkCode("var x = function() {}; x({'0': 1, '1' : 2});",  [17,37]);
    });

});
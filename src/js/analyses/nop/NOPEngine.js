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

// Author: Koushik Sen

(function(module){

    function NOPEngine(executionIndex) {
        var ConcolicValue = require('./../../ConcolicValue');

        if (!(this instanceof NOPEngine)) {
            return new NOPEngine(executionIndex);
        }

        var getConcrete = this.getConcrete = ConcolicValue.getConcrete;
        var getSymbolic = this.getSymbolic = ConcolicValue.getSymbolic;

        this.installAxiom = function(c) { }


        this.makeConcolic = function(idx, val, getNextSymbol) {
            return val;
        }

        this.makeConcolicPost = function() { }

        this.literalPre = function(iid, val) { }

        this.literal = function(iid, val) {
            return val;
        }

        this.invokeFunPre = function(iid, f, base, args, isConstructor) { }

        this.invokeFun = function(iid, f, base, args, val, isConstructor) {
            return val;
        }

        this.getFieldPre = function(iid, base, offset) { }

        this.getField = function(iid, base, offset, val) {
            return val;
        }

        this.putFieldPre = function(iid, base, offset, val) {}

        this.putField = function(iid, base, offset, val) {}

        this.readPre = function(iid, name, val, isGlobal) {

        }

        this.read = function(iid, name, val, isGlobal) {
            return val;
        }

        this.writePre = function(iid, name, val) { }

        this.write = function(iid, name, val) {
            return val;
        }

        this.binaryPre = function(iid, op, left, right) { }

        this.binary = function (iid, op, left, right, result_c) {
            return result_c;
        }

        this.unaryPre = function(iid, op, left) { }

        this.unary = function (iid, op, left, result_c) {
            return result_c;
        }

        this.conditionalPre = function(iid, left) { }

        this.conditional = function (iid, left, result_c) {
            return left;
        }

        this.beginExecution = function(data) { }

        this.endExecution = function() { }

        this.functionEnter = function(iid, fun, dis) { }

        this.functionExit = function(iid) {
            return false;
        }

        this.return_ = function(val) {
            return val;
        }

    }

    module.exports = NOPEngine;
}(module));
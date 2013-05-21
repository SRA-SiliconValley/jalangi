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

J$ = {};


(function(sandbox) {
    var single = require('./analyses/puresymbolic/Multiple');

//    function makeSymbolic(idx, val) {
//        return single.makeSymbolic(idx, val);
//    }
//
//    function F(iid, f, isConstructor) {
//        return single.F(iid, f, isConstructor);
//    }
//
//    function M(iid, base, offset, isConstructor) {
//        return single.M(iid, base, offset, isConstructor);
//    }
//
//    function Fe(iid, val, dis) {
//        return single.Fe(iid, val, dis);
//    }
//
//    function Fr(iid) {
//        return single.Fr(iid);
//    }
//
//    function Se(iid,val) {
//        return single.Se(iid,val);
//    }
//
//    function Sr(iid) {
//        return single.Sr(iid);
//    }
//
//    function I(val) {
//        return single.I(val);
//    }
//
//    function T(iid, val, type) {
//        return single.T(iid, val, type);
//    }
//
//    function H(iid, val) {
//        return single.H(iid, val);
//    }
//
//
//    function R(iid, name, val) {
//        return single.R(iid, name, val);
//    }
//
//    function W(iid, name, val) {
//        return single.W(iid, name, val);
//    }
//
//    function N(iid, name, val, isArgumentSync) {
//        return single.N(iid, name, val, isArgumentSync);
//    }
//
//
//    function A(iid,base,offset,op) {
//        return single.A(iid,base,offset,op);
//    }
//
//    function G(iid, base, offset) {
//        return single.G(iid, base, offset);
//    }
//
//    function P(iid, base, offset, val) {
//        return single.P(iid, base, offset, val);
//    }
//
//
//    function B(iid, op, left, right) {
//        return single.B(iid, op, left, right);
//    }
//
//    function U(iid, op, left) {
//        return single.U(iid, op, left);
//    }
//
//    function _() {
//        return single._();
//    }
//
//    function C1(iid, left) {
//        return single.C1(iid, left);
//    }
//
//    function C2(iid, left) {
//        return single.C2(iid, left);
//    }
//
//    function C(iid, left) {
//        return single.C(iid, left);
//    }
//
//    function addAxiom(val) {
//        return single.addAxiom(val);
//    }
//
//    function endExecution() {
//        return single.endExecution();
//    }

    sandbox.U = single.U; // Unary operation
    sandbox.B = single.B; // Binary operation
    sandbox.C = single.C; // Condition
    sandbox.C1 = single.C1; // Switch key
    sandbox.C2 = single.C2; // case label C1 === C2
    sandbox._ = single._;  // Last value passed to C

    sandbox.H = single.H; // hash in for-in
    sandbox.I = single.I; // Ignore argument
    sandbox.G = single.G; // getField
    sandbox.P = single.P; // putField
    sandbox.R = single.R; // Read
    sandbox.W = single.W; // Write
    sandbox.N = single.N; // Init
    sandbox.T = single.T; // object/function/regexp/array Literal
    sandbox.F = single.F; // Function call
    sandbox.M = single.M; // Method call
    sandbox.A = single.A; // Modify and assign +=, -= ...
    sandbox.Fe = single.Fe; // Function enter
    sandbox.Fr = single.Fr; // Function return
    sandbox.Se = single.Se; // Script enter
    sandbox.Sr = single.Sr; // Script return
    sandbox.Rt = single.Rt; // Value return
    sandbox.Ra = single.Ra;

    sandbox.makeSymbolic = single.makeSymbolic;
    sandbox.addAxiom = single.addAxiom;
    sandbox.endExecution = single.endExecution;
//    sandbox.U = U; // Unary operation
//    sandbox.B = B; // Binary operation
//    sandbox.C = C; // Condition
//    sandbox.C1 = C1; // Switch key
//    sandbox.C2 = C2; // case label C1 === C2
//    sandbox._ = _;  // Last value passed to C
//
//    sandbox.H = H; // hash in for-in
//    sandbox.I = I; // Ignore argument
//    sandbox.G = G; // getField
//    sandbox.P = P; // putField
//    sandbox.R = R; // Read
//    sandbox.W = W; // Write
//    sandbox.N = N; // Init
//    sandbox.T = T; // object/function/regexp/array Literal
//    sandbox.F = F; // Function call
//    sandbox.M = M; // Method call
//    sandbox.A = A; // Modify and assign +=, -= ...
//    sandbox.Fe = Fe; // Function enter
//    sandbox.Fr = Fr; // Function return
//    sandbox.Se = Se; // Script enter
//    sandbox.Sr = Sr; // Script return
//
//    sandbox.makeSymbolic = makeSymbolic;
//    sandbox.addAxiom = addAxiom;
//    sandbox.endExecution = endExecution;
}(J$));


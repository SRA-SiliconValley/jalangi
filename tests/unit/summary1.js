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


if (typeof window === "undefined") {
    require('../../src/js/InputManager');
    require(process.cwd()+'/inputs');
}


var x, y;

x = $7.readInput(1);
y = $7.readInput(1);

$7.addAxiom("begin");

$7.addAxiom("begin");
$7.addAxiom(x > 20);
$7.addAxiom(x < 30);
$7.addAxiom("and");
$7.addAxiom(x === 100);
$7.addAxiom("or");


if (x > 50) {
    console.log("x should be 100 "+x);
} else if (x > 2) {
    console.log("x should lie in (20, 30) "+x);
} else {
    console.log("x should be 1 "+x);
}

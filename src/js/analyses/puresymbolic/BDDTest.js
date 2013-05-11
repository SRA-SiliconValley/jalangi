
var BDD = require('./BDD');

// (A + C)(AD + A(!D)) + AC + C

var a = BDD.build(1);
var b = BDD.build(2);
var c = BDD.build(3);
var d = BDD.build(4);

console.log(BDD.getFormula(a).toString());


var b1 = BDD.apply("||", a, c);
var b2 = BDD.apply("&&", a, d);
var b0 = BDD.not(d);
var b3 = BDD.apply("&&", a, b0);
var b4 = BDD.apply("||", b2, b3);
var b5 = BDD.apply("&&", b1, b4);
var b6 = BDD.apply("&&", a, c);
var b7 = BDD.apply("||", b5, b6);
var b8 = BDD.apply("||", b7, c);

console.log(BDD.getFormula(b8).toString());
if (b8+"" !== "(b1 || ((!b1) && b3))") {
    throw new Error("b8 is "+b8);
} else {
    console.log("Test 1 passed")
}

var b9 = BDD.apply("||", BDD.apply("&&", BDD.not(a), BDD.apply("||", a, b)), BDD.apply("&&", BDD.apply("||", b, BDD.apply("&&", a, a)), BDD.apply("||", a, BDD.not(b))));
console.log(b9+"");
if (b9+"" !== "(b1 || ((!b1) && b2))") {
    throw new Error("b9 is "+b9);
} else {
    console.log("Test 2 passed")
}

var b10 = a.and(b).not().and(a.not().or(b)).and(b.or(b.not()));
if (b10+"" !== "(!b1)") {
    throw new Error("b10 is "+b10);
} else {
    console.log("Test 3 passed")
}

var b11 = c.or(b.and(c).not());
if (b11+"" !== "TRUE") {
    throw new Error("b11 is "+b11);
} else {
    console.log("Test 4 passed "+b11)
}

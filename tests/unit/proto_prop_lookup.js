function C() {
    this.x = 1;
}

C.prototype.foo = function () {
    this.x = 2;
}

var o = new C();
o.foo();
o.foo();
o.foo();
o.foo();
o.foo();

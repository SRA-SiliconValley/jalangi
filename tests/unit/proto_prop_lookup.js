function F() {
    this.x = 0;
}

F.prototype.foo = function() {
    this.x=1;
};

var x = new F();
x.foo();
x.foo();
x.foo();
x.foo();
x.foo();
x.foo();
x.foo();
x.foo();
x.foo();
x.foo();
x.foo();
x.foo();
x.foo();
x.foo();
x.foo();
x.foo();
x.foo();
x.foo();
x.foo();
x.foo();
x.foo();
x.foo();
x.foo();
x.foo();
x.foo();
console.log("done");

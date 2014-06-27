
function fac(n) {
    if (n <= 0)
        return 1;
    else
        return n*fac(n-1);
}

var v = J$.readInput(2);
if (v < 4) {
    fac(v);
}

if (typeof J$ === 'undefined') {
    J$ = {};
}


(function (sandbox) {
    var Globals = sandbox.Globals = {};
    Globals.mode;
    Globals.isInstrumentedCaller;
    Globals.isConstructorCall;
    Globals.isBrowserReplay;
    Globals.traceFileName;
    Globals.traceWriter;
    Globals.loadAndBranchLogs = [];

}(J$));
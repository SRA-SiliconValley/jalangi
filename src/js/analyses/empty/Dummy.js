((function (sandbox){

    function Dummy() {
        // during a conditional expression evaluation
        // result_c is the evaluation result and should be returned
        this.conditional = function (iid, left, result_c) {
            return result_c;
        }
    }

    sandbox.analysis = new Dummy();
    if (sandbox.Constants.isBrowser) {
        window.addEventListener('keydown', function (e) {
            // keyboard shortcut is Alt-Shift-T for now
            if (e.altKey && e.shiftKey && e.keyCode === 84) {
                sandbox.analysis.endExecution();
            }
        });
    }
})(typeof J$ === 'undefined'? (J$={}):J$));

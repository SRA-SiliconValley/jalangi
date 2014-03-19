((function (sandbox){

    function Dummy() {
        // during a conditional expression evaluation
        // result_c is the evaluation result and should be returned
        this.conditional = function (iid, left, result_c) {
            return result_c;
        }
    }

    if (sandbox.Constants.isBrowser) {
        sandbox.analysis = new Dummy();
        window.addEventListener('keydown', function (e) {
            // keyboard shortcut is Alt-Shift-T for now
            if (e.altKey && e.shiftKey && e.keyCode === 84) {
                sandbox.analysis.endExecution();
            }
        });
    } else {
        module.exports = Dummy;
    }
})(typeof J$ === 'undefined'? (J$={}):J$));

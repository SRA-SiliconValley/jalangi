### Direct or Inbrowser Analysis ###


A direct analysis (aka inbrowser analysis) can be written using the following template.  

```
(function (sandbox) {
    function SampleAnalysis() {
        var smemory = sandbox.smemory;
        var iidToLocation = sandbox.iidToLocation;
        var Constants = sandbox.Constants;
        var Config = sandbox.Config;
        
//        this.installAxiom = function (c) {};
//
//        this.makeConcolic = function (idx, val, getNextSymbol) {
//            return val;
//        };
//
//        this.makeConcolicPost = function () {};
//
//        this.declare = function (iid, name, val, isArgument) {};
//
//        this.literalPre = function (iid, val, hasGetterSetter) {};
//
//        this.literal = function (iid, val, hasGetterSetter) {
//            return val;
//        };
//
//        this.invokeFunPre = function (iid, f, base, args, isConstructor) {};
//
//        this.invokeFun = function (iid, f, base, args, val, isConstructor) {
//            return val;
//        };
//
//        this.getFieldPre = function (iid, base, offset) {};
//
//        this.getField = function (iid, base, offset, val) {
//            return val;
//        }
//
//        this.putFieldPre = function (iid, base, offset, val) {
//            return val;
//        };
//
//        this.putField = function (iid, base, offset, val) {
//            return val;
//        };
//
//        this.readPre = function (iid, name, val, isGlobal) {};
//
//        this.read = function (iid, name, val, isGlobal) {
//            return val;
//        };
//
//        this.writePre = function (iid, name, val, oldValue) {};
//
//        this.write = function (iid, name, val, oldValue) {
//            return val;
//        };
//
//        this.binaryPre = function (iid, op, left, right) {};
//
//        this.binary = function (iid, op, left, right, result_c) {
//            return result_c;
//        };
//
//        this.unaryPre = function (iid, op, left) {};
//
//        this.unary = function (iid, op, left, result_c) {
//            return result_c;
//        };
//
//        this.conditionalPre = function (iid, left) {};
//
//        this.conditional = function (iid, left, result_c) {
//            return left;
//        };
//
//        this.beginExecution = function (data) {};
//
//        this.endExecution = function () {};
//
//        this.functionEnter = function (iid, fun, dis /* this */, args) {};
//
//        this.functionExit = function (iid) {
//            return false;
//            /* a return of false means that do not backtrack inside the function */
//        };
//
//        this.return_ = function (val) {
//            return val;
//        };
//
//        this.scriptEnter = function (iid, fileName) {};
//
//        this.scriptExit = function (iid) {};
//
//        this.instrumentCode = function(iid, code) {
//            return code;
//        };


    }
    
    sandbox.analysis = new SampleAnalysis();
    if (sandbox.Constants.isBrowser) {
        window.addEventListener('keydown', function (e) {
            // keyboard shortcut is Alt-Shift-T for now
            if (e.altKey && e.shiftKey && e.keyCode === 84) {
                sandbox.analysis.endExecution();
            }
        });
    }

}(J$));
```

An analysis writer can choose to implement some of the callback methods commented out in the template. See the file _src/js/analyses/objectalloc/ObjectAllocationTrackerIB.js_ for a sample analysis.  _smemory_ provides the following methods:

 * _getShadowObject (val)_:returns the shadow object associated with the concrete object _val_.  _val_ cannot be a string, number, boolean, undefined, or null
 * _getFrame (varName)_: returns the call frame to which the variable _varName_ belongs
 * _getCurrentFrame()_: returns the current call frame
 * _getParentFrame(callFrame)_: returns the call frame that is the static parent of the call frame _callFrame_
 * _getClosureFrame(fun)_: returns the closure of the function _fun_
 * _getShadowObjectID (obj)_: returns the unique id associated with the shadow object _obj_
 
_iidToLocation(iid)_ returns the **(filename:linenumber:columnnumber)** associated with _iid_.  

An analysis can be performed on a JavaScript file by issuing the following commands:

    node src/js/instrument/esnstrument.js tests/octane/deltablue.js
	node src/js/commands/direct.js --smemory --analysis src/js/analyses/objectalloc/ObjectAllocationTrackerEngineIB.js tests/octane/deltablue_jalangi_.js
	    
An analysis can be performed on an web app using the Chrome browser by issuing the following commands:

    node src/js/commands/instrument.js --inbrowser --smemory --analysis src/js/analyses/objectalloc/ObjectAllocationTrackerEngineIB.js --outputDir /tmp tests/tizen/annex
    open file:///tmp/annex/index.html

While performing analysis in a browser, one needs to press Alt-Shift-T to end the analysis and to print the analysis results in the console.

### Analysis during Replay ###

These kind of analyses supports shadow values (denoted by objects of type ConcolicValue) and **shadow memory**.  Analyses must be performed during the replay phase in node.js.  Recording can be performed in node.js or in a browser.  A replay analysis can be written using the following template.  

```
(function (sandbox) {

    function SampleAnalysis() {
        var iidToLocation = sandbox.iidToLocation;
        var ConcolicValue = require('./../../ConcolicValue');

        var getConcrete = this.getConcrete = ConcolicValue.getConcrete;
        var getSymbolic = this.getSymbolic = ConcolicValue.getSymbolic;

//        this.installAxiom = function (c) {};
//
//        this.makeConcolic = function (idx, val, getNextSymbol) {
//            return val;
//        };
//
//        this.makeConcolicPost = function () {};
//
//        this.declare = function (iid, name, val, isArgument) {};
//
//        this.literalPre = function (iid, val, hasGetterSetter) {};
//
//        this.literal = function (iid, val, hasGetterSetter) {
//            return val;
//        };
//
//        this.invokeFunPre = function (iid, f, base, args, isConstructor) {};
//
//        this.invokeFun = function (iid, f, base, args, val, isConstructor) {
//            return val;
//        };
//
//        this.getFieldPre = function (iid, base, offset) {};
//
//        this.getField = function (iid, base, offset, val) {
//            return val;
//        }
//
//        this.putFieldPre = function (iid, base, offset, val) {
//            return val;
//        };
//
//        this.putField = function (iid, base, offset, val) {
//            return val;
//        };
//
//        this.readPre = function (iid, name, val, isGlobal) {};
//
//        this.read = function (iid, name, val, isGlobal) {
//            return val;
//        };
//
//        this.writePre = function (iid, name, val, oldValue) {};
//
//        this.write = function (iid, name, val, oldValue) {
//            return val;
//        };
//
//        this.binaryPre = function (iid, op, left, right) {};
//
//        this.binary = function (iid, op, left, right, result_c) {
//            return result_c;
//        };
//
//        this.unaryPre = function (iid, op, left) {};
//
//        this.unary = function (iid, op, left, result_c) {
//            return result_c;
//        };
//
//        this.conditionalPre = function (iid, left) {};
//
//        this.conditional = function (iid, left, result_c) {
//            return left;
//        };
//
//        this.beginExecution = function (data) {};
//
//        this.endExecution = function () {};
//
//        this.functionEnter = function (iid, fun, dis /* this */, args) {};
//
//        this.functionExit = function (iid) {
//            return false;
//            /* a return of false means that do not backtrack inside the function */
//        };
//
//        this.return_ = function (val) {
//            return val;
//        };
//
//        this.scriptEnter = function (iid, fileName) {};
//
//        this.scriptExit = function (iid) {};
//
//        this.instrumentCode = function(iid, code) {
//            return code;
//        };
    }

    sandbox.analysis = new SampleAnalysis();
}(J$));
``` 

See the file _src/js/analyses/objectalloc/ObjectAllocationTracker.js_ for a sample replay analysis.
A replay analysis can be peformed on a JavaScript file in node.js by issuing the following commands:

    node src/js/instrument/esnstrument.js tests/octane/deltablue.js
	node src/js/commands/record.js --tracefile jalangi_trace tests/octane/deltablue_jalangi_.js
    node src/js/commands/replay.js --tracefile jalangi_trace --analysis src/js/analyses/objectalloc/ObjectAllocationTrackerEngine.js

One can run a shadow-memory based analysis during replay by issuing:

    node src/js/commands/replay.js --smemory --tracefile jalangi_trace --analysis src/js/analyses/objectalloc/ObjectAllocationTrackerEngineIB.js

 
A replay analysis can be performed in the Chrome browser by issuing the following commands:

    node src/js/commands/instrument.js --outputDir /tmp tests/tizen/annex
    killall node
    python scripts/jalangi.py rrserver file:///tmp/annex/index.html    
    cp jalangi_trace1 /tmp/annex
    node src/js/commands/replay.js --tracefile /tmp/annex/jalangi_trace1 --analysis src/js/analyses/objectalloc/ObjectAllocationTrackerEngine
    
### Universal Analsyis ###

If an analysis does not use shadow memory or shadow value, it can be written in a way so that it can be treated both as a direct analysis and a replay analysis.  Such analyses can be found in src/js/analyses/logNaN and src/js/analyses/callgraph.

// Author: Michael Pradel

(function(module){
	var getIIDInfo = require('./../../utils/IIDInfo');
	
	var ConcolicValue = require('./../../ConcolicValue');
    var getConcrete = ConcolicValue.getConcrete;
    var getSymbolic = ConcolicValue.getSymbolic;
	
    function UnnecCompEngine(executionIndex) {
    	this.getConcrete = ConcolicValue.getConcrete;
        this.getSymbolic = ConcolicValue.getSymbolic;
    	
        if (!(this instanceof UnnecCompEngine)) {
            return new UnnecCompEngine(executionIndex);
        }

        this.literal = function(iid, val) {
        	var val_s = getSymbolic(val);
        	if (val_s) {
        		return val;
        	} else {
        		var depNode = new DepNode(iid);
                return new ConcolicValue(val, depNode);	
        	}
        };
    }

    function DepNode(iid) {
        this.toString = function() {
            return ""+iid;
        }
    }

    module.exports = UnnecCompEngine;
}(module));
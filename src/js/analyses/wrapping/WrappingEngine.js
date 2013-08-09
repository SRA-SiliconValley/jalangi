(function(module){

    function isPrimitive(val) {
	t = typeof val;
	return t == "number" ||
	    t == "boolean" ||
	    t == "string" 
    }

    function WrapperEngine(executionIndex) {
        var ConcolicValue = require('./../../ConcolicValue');
	var getIIDInfo = require('./../../utils/IIDInfo');

        if (!(this instanceof WrapperEngine)) {
            return new WrapperEngine(executionIndex);
        }

        var getConcrete = this.getConcrete = ConcolicValue.getConcrete;
        var getSymbolic = this.getSymbolic = ConcolicValue.getSymbolic;
	var report = []

        this.installAxiom = function(c) { }


        this.makeConcolic = function(idx, val, getNextSymbol) {
            return val;
        }

        this.makeConcolicPost = function() { }

        this.literalPre = function(iid, val) { }

        this.literal = function(iid, val) {
            return val;
        }

        this.invokeFunPre = function(iid, f, base, args, isConstructor) { }

        this.invokeFun = function(iid, f, base, args, val, isConstructor) {
            return val;
        }

        this.getFieldPre = function(iid, base, offset) { }

        this.getField = function(iid, base, offset, val) {
            return val;
        }

        this.putFieldPre = function(iid, base, offset, val) {
	}

        this.putField = function(iid, base, offset, val) {
	    if (isPrimitive(base))
		report.push(iid)
	}

        this.readPre = function(iid, name, val) { }

        this.read = function(iid, name, val) {
            return val;
        }

        this.writePre = function(iid, name, val) { }

        this.write = function(iid, name, val) { }

        this.binaryPre = function(iid, op, left, right) { }

        this.binary = function (iid, op, left, right, result_c) {
            return result_c;
        }

        this.unaryPre = function(iid, op, left) { }

        this.unary = function (iid, op, left, result_c) {
            return result_c;
        }

        this.conditionalPre = function(iid, left) { }

        this.conditional = function (iid, left, result_c) {
            return left;
        }

        this.beginExecution = function(data) { 
	}

        this.endExecution = function() {
	    for (var iid in report) {
		console.log("Suspicious wrapping at: " + getIIDInfo(report[iid]));
	    } }

    }

    module.exports = WrapperEngine;
}(module));
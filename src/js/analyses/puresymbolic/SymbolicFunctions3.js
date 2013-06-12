

(function(sandbox) {
    function regex_escape (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }

    sandbox.string_indexOf = function(str, startPos) {
        var reg = new RegExp(".*"+regex_escape(str)+".*");
        startPos = startPos | 0;

        if (reg.test(this)) {
            var T = J$.readInput("", true);
            var S1 = J$.readInput("",true);
            var S2 = J$.readInput("",true);
            var pos = J$.readInput(0,true);

            if (startPos < 0) {
                pos = 0;
            } else if (startPos >= this.length) {
                pos = this.length;
            } else {
                pos = startPos;
            }

            J$.addAxiom(pos === T.length);
            J$.addAxiom(this === (T + S1 + str + S2));
            J$.addAxiom(!reg.test(S1));
            return pos + S1.length;
        } else {
            return -1;
        }
    };

    sandbox. string_lastIndexOf = function(str, startPos) {
        var reg = new RegExp(".*"+regex_escape(str)+".*");

        if (arguments.length <= 1) {
            startPos = this.length - 1;
        }

        if (reg.test(this)) {
            var T = J$.readInput("", true);
            var S1 = J$.readInput("",true);
            var S2 = J$.readInput("",true);
            var pos = J$.readInput(0,true);

            if (startPos < 0){
                pos = -1;
            } else if (startPos >= this.length) {
                pos = this.length-1;
            } else {
                pos = startPos;
            }
            J$.addAxiom(pos === this.length - T.length -1);
            J$.addAxiom(this === (S1 + str + S2 + T));
            J$.addAxiom(!reg.test(S2));
            return S1.length;
        } else {
            return -1;
        }
    };


    sandbox.string_charCodeAt = function(idx) {
        var ret = J$.readInput(0,true);
        var c = this.substring(idx, idx + 1);

        if (c !== ''){
            J$.addAxiom(c === String.fromCharCode(ret));
        } else {
            J$.addAxiom(ret === -100000);
        } // @todo should be NaN, but no way to model NaN.

        return ret;

    }

    sandbox.string_substring = function(start, end) {

        if (arguments.length <= 1) {
            end = this.length;
        }

        var ret = J$.readInput("",true);
        var S1 = J$.readInput("",true);
        var S2 = J$.readInput("",true);
        var s = J$.readInput(0,true);
        var e = J$.readInput(0,true);

        if (start < 0) {
            s = 0;
        } else if (start >= this.length) {
            s = this.length;
        } else {
            s = start;
        }
        if (end < 0) {
            e = 0;
        } else if (end >= this.length) {
            e = this.length;
        } else {
            e = end;
        }
        if (s <= e) {
            J$.addAxiom(this === S1 + ret + S2);
            J$.addAxiom(s === S1.length);
            J$.addAxiom(e - s === ret.length);
        } else {
            J$.addAxiom(ret === "");
        }
        return ret;
    }

    sandbox.string_substr = function(start, length) {

        var ret = J$.readInput("",true);

        var S1 = J$.readInput("",true);
        var S2 = J$.readInput("",true);
        var s = J$.readInput(0,true);
        var l = J$.readInput(0,true);

        if (start >= this.length) {
            s = this.length;
        } else if (start >= 0 && start < this.length) {
            s = start;
        } else if (start < 0 && start >= - this.length) {
            s = this.length + start;
        } else {
            s = 0;
        }
        if (length < 0){
            l = 0;
        } else if (length > this.length - s) {
            l = this.length - s;
        } else {
            l = length;
        }
        J$.addAxiom(this === S1 + ret + S2);
        J$.addAxiom(s === S1.length);
        J$.addAxiom(l === ret.length);

        return ret;
    };


    sandbox.string_charAt = function(start) {
        // assuming start >= 0 and end >= start and end === undefined or end <= this.length

        var ret = J$.readInput("",true);
        var S1 = J$.readInput("",true);
        var S2 = J$.readInput("",true);

        if (start < 0) {
            J$.addAxiom(ret === "");
        } else if (start >= this.length) {
            J$.addAxiom(ret === "");
        } else {
            J$.addAxiom(this === S1 + ret + S2);
            J$.addAxiom(start === S1.length);
            J$.addAxiom(ret.length === 1);

        }
        return ret;
    }


    sandbox.builtin_parseInt = function(s) {
        var ret = J$.readInput(0,true);
        J$.addAxiom(ret === s * 1);
        return ret;
    }

    sandbox.object_getField = function(base, offset) {
        var ret = J$.readInput(0,true);

        J$.addAxiom("begin");
        for (var i in base) {
            J$.addAxiom("begin");
            J$.addAxiom(i === offset+"");
            J$.addAxiom(ret === base[i]);
            J$.addAxiom("and");
        }
        J$.addAxiom("or");

        return ret;

    }

}(module.exports));

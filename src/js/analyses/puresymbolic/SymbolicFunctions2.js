

(function(sandbox) {
    function regex_escape (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }

    sandbox.string_indexOf = function(str, startPos) {
        var reg = new RegExp(".*"+regex_escape(str)+".*");
        var ret = J$.readInput(0,true);

        startPos = startPos | 0;

        J$.addAxiom("begin");
        J$.addAxiom("begin");
        var T = J$.readInput("", true);
        var S1 = J$.readInput("",true);
        var S2 = J$.readInput("",true);
        var pos = J$.readInput(0,true);

        J$.addAxiom("begin");

        J$.addAxiom("begin");
        J$.addAxiom(startPos < this.length);
        J$.addAxiom(startPos >= 0);
        J$.addAxiom(pos === startPos);
        J$.addAxiom("and");

        J$.addAxiom("begin");
        J$.addAxiom(startPos < 0);
        J$.addAxiom(pos === 0);
        J$.addAxiom("and");

        J$.addAxiom("begin");
        J$.addAxiom(startPos >= this.length);
        J$.addAxiom(pos === this.length);
        J$.addAxiom("and");

        J$.addAxiom("or");


        J$.addAxiom(pos === T.length);
        J$.addAxiom(this === (T + S1 + str + S2));
        J$.addAxiom(ret === pos + S1.length);
        J$.addAxiom(!reg.test(S1));
        J$.addAxiom("and");


        J$.addAxiom("begin");
        J$.addAxiom(ret===-1);
        J$.addAxiom(!reg.test(this));
        J$.addAxiom("and");

        J$.addAxiom("or");
        return ret;
    }

    sandbox. string_lastIndexOf = function(str, startPos) {
        var reg = new RegExp(".*"+regex_escape(str)+".*");
        var ret = J$.readInput(0,true);

        if (arguments.length <= 1) {
            startPos = this.length - 1;
        }

        J$.addAxiom("begin");

        J$.addAxiom("begin");
        var T = J$.readInput("", true);
        var S1 = J$.readInput("",true);
        var S2 = J$.readInput("",true);
        var pos = J$.readInput(0,true);

        J$.addAxiom("begin");

        J$.addAxiom("begin");
        J$.addAxiom(startPos < this.length);
        J$.addAxiom(startPos >= 0);
        J$.addAxiom(pos === startPos);
        J$.addAxiom("and");

        J$.addAxiom("begin");
        J$.addAxiom(startPos < 0);
        J$.addAxiom(pos === -1);
        J$.addAxiom("and");

        J$.addAxiom("begin");
        J$.addAxiom(startPos >= this.length);
        J$.addAxiom(pos === this.length-1);
        J$.addAxiom("and");

        J$.addAxiom("or");


        J$.addAxiom(pos === this.length - T.length -1);
        J$.addAxiom(this === (S1 + str + S2 + T));
        J$.addAxiom(ret === S1.length);
        J$.addAxiom(!reg.test(S2));
        J$.addAxiom("and");

        J$.addAxiom("begin");
        J$.addAxiom(ret===-1);
        J$.addAxiom(!reg.test(this));
        J$.addAxiom("and");

        J$.addAxiom("or");
        return ret;
    }


    sandbox.string_charCodeAt = function(idx) {
        var ret = J$.readInput(0,true);
        var c = this.substring(idx, idx + 1);

        J$.addAxiom("begin");

        J$.addAxiom("begin");
        J$.addAxiom(c !== '');
        J$.addAxiom(c === String.fromCharCode(ret));
        J$.addAxiom("and");

        J$.addAxiom("begin");
        J$.addAxiom(c === '');
        J$.addAxiom(ret === -100000); // @todo should be NaN, but no way to model NaN.
        J$.addAxiom("and");

        J$.addAxiom("or");

        return ret;

    }

    sandbox.string_substring = function(start, end) {

        if (arguments.length <= 1) {
            end = this.length;
        }

        var ret = J$.readInput("",true);

        J$.addAxiom("begin");
        var S1 = J$.readInput("",true);
        var S2 = J$.readInput("",true);
        var s = J$.readInput(0,true);
        var e = J$.readInput(0,true);

        J$.addAxiom("begin");

        J$.addAxiom("begin");
        J$.addAxiom(start >= 0);
        J$.addAxiom(start < this.length);
        J$.addAxiom(s === start);
        J$.addAxiom("and");

        J$.addAxiom("begin");
        J$.addAxiom(start < 0);
        J$.addAxiom(s === 0);
        J$.addAxiom("and");

        J$.addAxiom("begin");
        J$.addAxiom(start >= this.length);
        J$.addAxiom(s === this.length);
        J$.addAxiom("and");

        J$.addAxiom("or");

        J$.addAxiom("begin");

        J$.addAxiom("begin");
        J$.addAxiom(end >= 0);
        J$.addAxiom(end < this.length);
        J$.addAxiom(e === end);
        J$.addAxiom("and");

        J$.addAxiom("begin");
        J$.addAxiom(end < 0);
        J$.addAxiom(e === 0);
        J$.addAxiom("and");

        J$.addAxiom("begin");
        J$.addAxiom(end >= this.length);
        J$.addAxiom(e === this.length);
        J$.addAxiom("and");


        J$.addAxiom("or");

        J$.addAxiom("begin");

        J$.addAxiom("begin");
        J$.addAxiom(s <= e);
        J$.addAxiom(this === S1 + ret + S2);
        J$.addAxiom(s === S1.length);
        J$.addAxiom(e - s === ret.length);
        J$.addAxiom("and");


        J$.addAxiom("begin");
        J$.addAxiom(s > e);
        J$.addAxiom(ret === "");
        J$.addAxiom("and");

        J$.addAxiom("or");

        J$.addAxiom("and");

        return ret;
    }

    sandbox.string_substr = function(start, length) {

        var ret = J$.readInput("",true);

        J$.addAxiom("begin");
        var S1 = J$.readInput("",true);
        var S2 = J$.readInput("",true);
        var s = J$.readInput(0,true);
        var l = J$.readInput(0,true);

        J$.addAxiom("begin");

        J$.addAxiom("begin");
        J$.addAxiom(start >= 0);
        J$.addAxiom(start < this.length);
        J$.addAxiom(s === start);
        J$.addAxiom("and");

        J$.addAxiom("begin");
        J$.addAxiom(start >= this.length);
        J$.addAxiom(s === this.length);
        J$.addAxiom("and");

        J$.addAxiom("begin");
        J$.addAxiom(start < 0);
        J$.addAxiom(start >= - this.length);
        J$.addAxiom(s === this.length + start);
        J$.addAxiom("and");

        J$.addAxiom("begin");
        J$.addAxiom(start < -this.length);
        J$.addAxiom(s === 0);
        J$.addAxiom("and");

        J$.addAxiom("or");

        J$.addAxiom("begin");

        J$.addAxiom("begin");
        J$.addAxiom(length >= 0);
        J$.addAxiom(length <= this.length - s);
        J$.addAxiom(l === length);
        J$.addAxiom("and");

        J$.addAxiom("begin");
        J$.addAxiom(length < 0);
        J$.addAxiom(l === 0);
        J$.addAxiom("and");

        J$.addAxiom("begin");
        J$.addAxiom(length > this.length - s);
        J$.addAxiom(l === this.length - s);
        J$.addAxiom("and");

        J$.addAxiom("or");

        J$.addAxiom("begin");
        J$.addAxiom(this === S1 + ret + S2);
        J$.addAxiom(s === S1.length);
        J$.addAxiom(l === ret.length);
        J$.addAxiom("and");


        J$.addAxiom("and");

        return ret;
    }


    sandbox.string_charAt = function(start) {
        // assuming start >= 0 and end >= start and end === undefined or end <= this.length

        var ret = J$.readInput("",true);


        J$.addAxiom("begin");

        J$.addAxiom("begin");
        var S1 = J$.readInput("",true);
        var S2 = J$.readInput("",true);

        J$.addAxiom(start >= 0);
        J$.addAxiom(start < this.length);
        J$.addAxiom(this === S1 + ret + S2);
        J$.addAxiom(start === S1.length);
        J$.addAxiom(ret.length === 1);
        J$.addAxiom("and");

        J$.addAxiom("begin");
        J$.addAxiom(start < 0);
        J$.addAxiom(ret === "");
        J$.addAxiom("and");

        J$.addAxiom("begin");
        J$.addAxiom(start >= this.length);
        J$.addAxiom(ret === "");
        J$.addAxiom("and");


        J$.addAxiom("or");


        return ret;
    }


    sandbox.builtin_parseInt = function(s) {
        var ret = J$.readInput(0,true);

        J$.addAxiom("begin");
        J$.addAxiom(ret === s * 1);
        J$.addAxiom("and");

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

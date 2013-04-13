

(function(sandbox) {
    function regex_escape (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }

    sandbox.string_indexOf = function(result, str, startPos) {
        var reg = new RegExp(".*"+regex_escape(str)+".*");
        var ret = $7.readInput(result,true);

        startPos = startPos | 0;

        $7.addAxiom("begin");

        $7.addAxiom("begin");
        var T = $7.readInput("", true);
        var S1 = $7.readInput("",true);
        var S2 = $7.readInput("",true);
        var pos = $7.readInput(0,true);

        $7.addAxiom("begin");

        $7.addAxiom("begin");
        $7.addAxiom(startPos < this.length);
        $7.addAxiom(startPos >= 0);
        $7.addAxiom(pos === startPos);
        $7.addAxiom("and");

        $7.addAxiom("begin");
        $7.addAxiom(startPos < 0);
        $7.addAxiom(pos === 0);
        $7.addAxiom("and");

        $7.addAxiom("begin");
        $7.addAxiom(startPos >= this.length);
        $7.addAxiom(pos === this.length);
        $7.addAxiom("and");

        $7.addAxiom("or");


        $7.addAxiom(pos === T.length);
        $7.addAxiom(this === (T + S1 + str + S2));
        $7.addAxiom(ret === pos + S1.length);
        $7.addAxiom(!reg.test(S1));
        $7.addAxiom("and");

        $7.addAxiom("begin");
        $7.addAxiom(ret===-1);
        $7.addAxiom(!reg.test(this));
        $7.addAxiom("and");

        $7.addAxiom("or");
        return ret;
    }

    sandbox. string_lastIndexOf = function(result, str, startPos) {
        var reg = new RegExp(".*"+regex_escape(str)+".*");
        var ret = $7.readInput(result,true);

        if (startPos === undefined) {
            startPos = this.length - 1;
        }

        $7.addAxiom("begin");

        $7.addAxiom("begin");
        var T = $7.readInput("", true);
        var S1 = $7.readInput("",true);
        var S2 = $7.readInput("",true);
        var pos = $7.readInput(0,true);

        $7.addAxiom("begin");

        $7.addAxiom("begin");
        $7.addAxiom(startPos < this.length);
        $7.addAxiom(startPos >= 0);
        $7.addAxiom(pos === startPos);
        $7.addAxiom("and");

        $7.addAxiom("begin");
        $7.addAxiom(startPos < 0);
        $7.addAxiom(pos === -1);
        $7.addAxiom("and");

        $7.addAxiom("begin");
        $7.addAxiom(startPos >= this.length);
        $7.addAxiom(pos === this.length-1);
        $7.addAxiom("and");

        $7.addAxiom("or");


        $7.addAxiom(pos === this.length - T.length -1);
        $7.addAxiom(this === (S1 + str + S2 + T));
        $7.addAxiom(ret === S1.length);
        $7.addAxiom(!reg.test(S2));
        $7.addAxiom("and");

        $7.addAxiom("begin");
        $7.addAxiom(ret===-1);
        $7.addAxiom(!reg.test(this));
        $7.addAxiom("and");

        $7.addAxiom("or");
        return ret;
    }


    sandbox.string_charCodeAt = function(result, idx) {
        var ret = $7.readInput(result,true);

        $7.addAxiom("begin");
        $7.addAxiom(this.substring(idx, idx + 1) === String.fromCharCode(ret));
        $7.addAxiom("and");

        return ret;

    }

    sandbox.string_substring = function(result, start, end) {

        if (end === undefined) {
            end = this.length;
        }

        var ret = $7.readInput(result,true);

        $7.addAxiom("begin");
        var S1 = $7.readInput("",true);
        var S2 = $7.readInput("",true);
        var s = $7.readInput(0,true);
        var e = $7.readInput(0,true);

        $7.addAxiom("begin");

        $7.addAxiom("begin");
        $7.addAxiom(start >= 0);
        $7.addAxiom(start < this.length);
        $7.addAxiom(s === start);
        $7.addAxiom("and");

        $7.addAxiom("begin");
        $7.addAxiom(start < 0);
        $7.addAxiom(s === 0);
        $7.addAxiom("and");

        $7.addAxiom("begin");
        $7.addAxiom(start >= this.length);
        $7.addAxiom(s === this.length);
        $7.addAxiom("and");

        $7.addAxiom("or");

        $7.addAxiom("begin");

        $7.addAxiom("begin");
        $7.addAxiom(end >= 0);
        $7.addAxiom(end < this.length);
        $7.addAxiom(e === end);
        $7.addAxiom("and");

        $7.addAxiom("begin");
        $7.addAxiom(end < 0);
        $7.addAxiom(e === 0);
        $7.addAxiom("and");

        $7.addAxiom("begin");
        $7.addAxiom(end >= this.length);
        $7.addAxiom(e === this.length);
        $7.addAxiom("and");


        $7.addAxiom("or");

        $7.addAxiom("begin");

        $7.addAxiom("begin");
        $7.addAxiom(s <= e);
        $7.addAxiom(this === S1 + ret + S2);
        $7.addAxiom(s === S1.length);
        $7.addAxiom(e - s === ret.length);
        $7.addAxiom("and");


        $7.addAxiom("begin");
        $7.addAxiom(s > e);
        $7.addAxiom(ret === "");
        $7.addAxiom("and");

        $7.addAxiom("or");

        $7.addAxiom("and");

        return ret;
    }

    sandbox.string_substr = function(result, start, length) {

        var ret = $7.readInput(result,true);

        $7.addAxiom("begin");
        var S1 = $7.readInput("",true);
        var S2 = $7.readInput("",true);
        var s = $7.readInput(0,true);
        var l = $7.readInput(0,true);

        $7.addAxiom("begin");

        $7.addAxiom("begin");
        $7.addAxiom(start >= 0);
        $7.addAxiom(start < this.length);
        $7.addAxiom(s === start);
        $7.addAxiom("and");

        $7.addAxiom("begin");
        $7.addAxiom(start >= this.length);
        $7.addAxiom(s === this.length);
        $7.addAxiom("and");

        $7.addAxiom("begin");
        $7.addAxiom(start < 0);
        $7.addAxiom(start >= - this.length);
        $7.addAxiom(s === this.length + start);
        $7.addAxiom("and");

        $7.addAxiom("begin");
        $7.addAxiom(start < -this.length);
        $7.addAxiom(s === 0);
        $7.addAxiom("and");

        $7.addAxiom("or");

        $7.addAxiom("begin");

        $7.addAxiom("begin");
        $7.addAxiom(length >= 0);
        $7.addAxiom(length <= this.length - s);
        $7.addAxiom(l === length);
        $7.addAxiom("and");

        $7.addAxiom("begin");
        $7.addAxiom(length < 0);
        $7.addAxiom(l === 0);
        $7.addAxiom("and");

        $7.addAxiom("begin");
        $7.addAxiom(length > this.length - s);
        $7.addAxiom(l === this.length - s);
        $7.addAxiom("and");

        $7.addAxiom("or");

        $7.addAxiom("begin");
        $7.addAxiom(this === S1 + ret + S2);
        $7.addAxiom(s === S1.length);
        $7.addAxiom(l === ret.length);
        $7.addAxiom("and");


        $7.addAxiom("and");

        return ret;
    }


    sandbox.string_charAt = function(result, start) {
        // assuming start >= 0 and end >= start and end === undefined or end <= this.length

        var ret = $7.readInput(result,true);


        $7.addAxiom("begin");

        $7.addAxiom("begin");
        var S1 = $7.readInput("",true);
        var S2 = $7.readInput("",true);

        $7.addAxiom(start >= 0);
        $7.addAxiom(start < this.length);
        $7.addAxiom(this === S1 + ret + S2);
        $7.addAxiom(start === S1.length);
        $7.addAxiom(ret.length === 1);
        $7.addAxiom("and");

        $7.addAxiom("begin");
        $7.addAxiom(start < 0);
        $7.addAxiom(ret === "");
        $7.addAxiom("and");

        $7.addAxiom("begin");
        $7.addAxiom(start >= this.length);
        $7.addAxiom(ret === "");
        $7.addAxiom("and");


        $7.addAxiom("or");


        return ret;
    }


    sandbox.builtin_parseInt = function(result, s) {
        var ret = $7.readInput(result,true);

        $7.addAxiom("begin");
        $7.addAxiom(ret === s * 1);
        $7.addAxiom("and");

        return ret;
    }

    sandbox.object_getField = function(result, base, offset) {
        var ret = $7.readInput(0,true);

        $7.addAxiom("begin");
        for (var i in base) {
            $7.addAxiom("begin");
            $7.addAxiom(i === offset+"");
            $7.addAxiom(ret === base[i]);
            $7.addAxiom("and");
        }
        $7.addAxiom("or");

        return ret;

    }





}(module.exports));

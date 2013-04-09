

(function(sandbox) {
    function regex_escape (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }

    sandbox.string_indexOf = function(result, str) {
        var reg = new RegExp(".*"+regex_escape(str)+".*");
        var ret = $7.readInput(result,true);

        $7.addAxiom("begin");

        $7.addAxiom("begin");
        var S1 = $7.readInput("",true);
        var S2 = $7.readInput("",true);
        $7.addAxiom(this === (S1 + str + S2));
        $7.addAxiom(ret === S1.length);
        $7.addAxiom(!reg.test(S1));
        $7.addAxiom("and");

        $7.addAxiom("begin");
        $7.addAxiom(ret===-1);
        $7.addAxiom(!reg.test(this));
        $7.addAxiom("and");

        $7.addAxiom("or");
        return ret;
    }

    sandbox.string_substring = function(result, start, end) {
        // assuming start >= 0 and end >= start and end === undefined or end <= this.length

        if (end === undefined) {
            end = this.length;
        }

        var ret = $7.readInput(result,true);

        $7.addAxiom("begin");
        var S1 = $7.readInput("",true);
        var S2 = $7.readInput("",true);
        $7.addAxiom(start <= end);
        $7.addAxiom(this === S1 + ret + S2);
        $7.addAxiom(start === S1.length);
        $7.addAxiom(end-start === ret.length);
        $7.addAxiom("and");

        return ret;
    }


    sandbox. string_lastIndexOf = function(result, str) {
        var reg = new RegExp(".*"+regex_escape(str)+".*");
        var ret = $7.readInput(result,true);

        $7.addAxiom("begin");

        $7.addAxiom("begin");
        var S1 = $7.readInput("",true);
        var S2 = $7.readInput("",true);
        $7.addAxiom(this===S1+str+S2);
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



}(module.exports));

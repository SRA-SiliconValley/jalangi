

(function(BDD){
    var SymbolicBool = require('../concolic/SymbolicBool');

    function Hash() {
        this.table = [];
        this.nextNodeId = 2;
    }

    Hash.prototype = {
        constructor: Hash,

        put: function(i, l, h, u) {
            l = l.id;
            h = h.id;
            var tmp = this.table[l];
            if (!tmp) {
                tmp = this.table[l] = [];
            }
            var tmp2 = tmp[h];
            if (!tmp2) {
                tmp2 = tmp[h] = {};
            }
            tmp2[i] = u;
        },

        get: function(i, l, h) {
            l = l.id;
            h = h.id;
            var tmp;
            if (!(tmp = this.table[l])) {
                return null;
            }
            if (!(tmp = tmp[h])) {
                return null;
            }
            if (!(tmp = tmp[i])) {
                return null;
            }
            return tmp;
        },

        clear: function() {
            this.table = [];
            this.nextNodeId = 2;
        },

        getNextNodeID: function() {
            var ret = this.nextNodeId;
            this.nextNodeId = ret + 1;
            return ret;
        }

    }

    function Graph() {
        this.table = [];
    }

    Graph.prototype = {
        constructor: Graph,

        put: function(u1, u2, u) {
            u1 = u1.id;
            u2 = u2.id;
            var tmp = this.table[u1];
            if (!tmp) {
                tmp = this.table[u1] = [];
            }
            tmp[u2] = u;
        },

        get: function(u1, u2) {
            u1 = u1.id;
            u2 = u2.id;
            var tmp;
            if (!(tmp = this.table[u1])) {
                return null;
            }
            if (!(tmp = tmp[u2])) {
                return null;
            }
            return tmp;
        },

        clear: function() {
            this.table = [];
        }

    }

    var H = new Hash();

    function Node(i, l, h, id) {
        this.var = i;
        this.low = l;
        this.high = h;
        this.id = id;
    }

    Node.prototype.toString = function() {
      return BDD.getFormula(this).toString();
    };

    Node.prototype.and = function(u) {
        return BDD.apply("&&", this, u);
    };

    Node.prototype.or = function(u) {
        return BDD.apply("||", this, u);
    };

    Node.prototype.not = function(u) {
        return BDD.not(this);
    };

    Node.prototype.isZero = function() {
        return this === BDD.zero;
    };

    BDD.one = new Node(10000000, null, null, 1);
    BDD.zero = new Node(10000000, null, null, 0);

    BDD.isZeroOne = function(u) {
        return u === BDD.one || u === BDD.zero;
    };

    function make (i, l, h) {
        var ret;
        if (l===h) {
            return l;
        } else if (ret = H.get(i, l, h)) {
            return ret;
        } else {
            ret = new Node(i, l, h, H.getNextNodeID());
            H.put(i, l, h, ret);
            return ret;
        }
    }

    function applyToBool(op, u1, u2) {
        var ret, tmp1 = u1.id, tmp2 = u2.id;
        switch(op) {
            case "&&":
                ret = tmp1 && tmp2;
                break;
            case "||":
                ret = tmp1 || tmp2;
                break;
            case "=>":
                ret = (!tmp1) || tmp2;
                break;
            default:
                throw new Error("Unknown op "+op);
        }
        return ret?BDD.one:BDD.zero;
    }

    var G;

    function app(op, u1, u2) {
        var ret;
        if ((ret = G.get(u1, u2))) {
            return ret;
        }
        if (BDD.isZeroOne(u1) && BDD.isZeroOne(u2)) {
            return applyToBool(op, u1, u2);
        }
        if (u1.var === u2.var) {
            ret = make(u1.var, app(op, u1.low, u2.low), app(op, u1.high, u2.high));
        } else if (u1.var < u2.var) {
            ret = make(u1.var, app(op, u1.low, u2), app(op, u1.high, u2));
        } else {
            ret = make(u2.var, app(op, u1, u2.low), app(op, u1, u2.high));
        }
        G.put(u1, u2, ret);
        return ret;
    }

    function not(u) {
        var ret;
        if (u === BDD.one) {
            return BDD.zero;
        }
        if (u === BDD.zero) {
            return BDD.one;
        }
        ret = make(u.var, not(u.low), not(u.high));
        return ret;
    }

    BDD.build = function(i) {
        return new Node(i, BDD.zero, BDD.one, 2);
    };

    BDD.buildNot = function(i) {
        return new Node(i, BDD.one, BDD.zero, 2);
    };

    BDD.apply = function(op, u1, u2) {
        G = new Graph();
        H.clear();
        return app(op, u1, u2);
    };


    BDD.not = function(u) {
        H.clear();
        return not(u);
    };



    BDD.size = function(u)  {
        var nodes = {size:0};
        size(u, nodes);
        return nodes.size;
    };

    function size (u, nodes) {
        if (u !== BDD.one && u !== BDD.zero) {
            if (!Object.prototype.hasOwnProperty.call(nodes, u.id)) {
                nodes.size = nodes.size + 1;
                nodes[u.id] = true;
            }
            size (u.high, nodes);
            size (u.low, nodes);
        }
    }

    BDD.getFormula = function(u, literalToFormulas) {
        if (u === BDD.one) {
            return SymbolicBool.true;
        }
        if (u === BDD.zero) {
            return SymbolicBool.false;
        }
        var t;

        t = literalToFormulas?literalToFormulas[u.var-1]: new SymbolicBool(u.var);

        return new SymbolicBool("||",
            new SymbolicBool("&&",
                t,
                BDD.getFormula(u.high, literalToFormulas)),
            new SymbolicBool("&&",
                t.not(),
                BDD.getFormula(u.low, literalToFormulas)));
    };

    BDD.Node = Node;

    //console.log("Initialized BDD module.")
})(module.exports);

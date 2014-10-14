(function (sandbox) {
    var Constants = sandbox.Constants;

    var SPECIAL_PROP = Constants.SPECIAL_PROP + "M";
    var objectId = 1;
    var HOP = Constants.HOP;
    var hasGetterSetter = Constants.hasGetterSetter;

    function isArr(obj) {
        return Array.isArray(obj) || (obj && obj.constructor && (obj instanceof Uint8Array || obj instanceof Uint16Array ||
            obj instanceof Uint32Array || obj instanceof Uint8ClampedArray ||
            obj instanceof ArrayBuffer || obj instanceof Int8Array || obj instanceof Int16Array ||
            obj instanceof Int32Array || obj instanceof Float32Array || obj instanceof Float64Array));
    }

    function isNormalNumber(num) {
        if (typeof num === 'number' && !isNaN(num)) {
            return true;
        } else if (typeof num === 'string' && (this.parseInt(num) + "" === num)) {
            return true;
        }
        return false;
    }

    function createShadowObject(iid, val) {
        var type = typeof val;
        if ((type === 'object' || type === 'function') && val !== null && !HOP(val, SPECIAL_PROP)) {
            if (Object && Object.defineProperty && typeof Object.defineProperty === 'function') {
                Object.defineProperty(val, SPECIAL_PROP, {
                    enumerable:false,
                    writable:true
                });
            }
            try {
                val[SPECIAL_PROP] = Object.create(null);
                val[SPECIAL_PROP][SPECIAL_PROP] = objectId;
                objectId = objectId + 2;
                val[SPECIAL_PROP].iid = iid;
            } catch (e) {
                // cannot attach special field in some DOM Objects.  So ignore them.
            }
        }

    }

    function getShadowObject(iid, val) {
        var value;
        createShadowObject(iid, val);
        var type = typeof val;
        if ((type === 'object' || type === 'function') && val !== null && HOP(val, SPECIAL_PROP)) {
            value = val[SPECIAL_PROP];
        } else {
            value = undefined;
        }
        return value;
    }

    var info = {};

    function incOld(hash, property) {
        hash[property] = (hash[property]|0) + 1;
    }

    function inc(hash) {
        var i, len = arguments.length, map = hash, info, key;
        for (i = 1; i < len; i++) {
            key = arguments[i];
            if (!(info = map[key])) {
                info = map[key] = {count: 0, details: {}};
            }
            info.count++;
            map = info.details;
        }
    }


    function updateSObjArrayNonUniformity(iid, sobj, elem) {
        if (!sobj.typeInitialized) {
            sobj.type = typeof elem;
            sobj.typeInitialized = true;
            sobj.isUniform = true;
        } else if (sobj.isUniform) {
            sobj.isUniform = (sobj.type == (typeof elem));
            if (!sobj.isUniform) {
                inc(info, "arrayNonUniform", "IID" + sobj.iid, "IID" + iid);
            }
        }
    }

    function updateSObjObjectNonUniformity(iid, sobj, elem) {
        if (sobj && sobj.isDynamic) {
            if (!sobj.typeInitialized) {
                sobj.type = typeof elem;
                sobj.typeInitialized = true;
                sobj.isUniform = true;
            } else if (sobj.isUniform) {
                sobj.isUniform = (sobj.type == (typeof elem));
                if (!sobj.isUniform) {
                    inc(info, "objectNonUniformHash", "IID" + sobj.iid, "IID" + iid);
                }
            }
        }
    }

    function checkObjectUniformity(iid, sobj, obj, elem) {
        if (!sobj.isDynamic) {
            sobj.isDynamic = true;
            inc(info, "objectHash", "IID" + sobj.iid, "IID" + iid);
            for (var p in obj) {
                if (!hasGetterSetter(obj, p, true))
                    updateSObjObjectNonUniformity(iid, sobj, obj[p]);
            }
        }
        if (sobj.isDynamic) {
            updateSObjObjectNonUniformity(iid, sobj, elem);
        }
    }

    function checkArrayUniformity(iid, val) {
        if (isArr(val)) {
            inc(info,"arrayTotal");
            var sobj = getShadowObject(iid, val);
            var i;
            for (i=0; i<val.length; i++) {
                updateSObjArrayNonUniformity(iid, sobj, val[i]);
            }
        }
    }

    function getCreateObjectInfo(iid, obj, isPrototype) {
        if (!isArr(obj) && typeof obj === "object") {
            var sobj = getShadowObject(iid, obj);
            if (sobj) {
                if (sobj.isUsedInForIn === undefined) {
                    inc(info, "objectTotal");
                    sobj.isUsedInForIn = false;
                    sobj.isPrototype = isPrototype;
                }
            }
        }
        return sobj;
    }

    function forInUse(iid, obj) {
        var sobj = getCreateObjectInfo(iid, obj, false);
        if (sobj && !sobj.isUsedInForIn) {
            sobj.isUsedInForIn = true;
            inc(info, "objectUsedInForIn", "IID" + sobj.iid, "IID" + iid);
        }
    }

    var isCallingConstructor = false;
    var constructorFun;
    var thisStack = [];
    var currThis;

    function MyAnalysis () {
        this.invokeFunPre = function(iid, f, base, args, isConstructor, isMethod){
            switch (f) {
                case Array.prototype.concat:
                    inc(info, "Array.prototype.concat");
                    break;
                case Array.prototype.indexOf:
                    inc(info, "Array.prototype.indexOf");
                    break;
                case Array.prototype.join:
                    inc(info, "Array.prototype.join");
                    break;
                case Array.prototype.lastIndexOf:
                    inc(info, "Array.prototype.lastIndexOf");
                    break;
                case Array.prototype.pop:
                    inc(info, "Array.prototype.pop");
                    break;
                case Array.prototype.push:
                    inc(info, "Array.prototype.push");
                    break;
                case Array.prototype.reverse:
                    inc(info, "Array.prototype.reverse");
                    break;
                case Array.prototype.shift:
                    inc(info, "Array.prototype.shift");
                    break;
                case Array.prototype.slice:
                    inc(info, "Array.prototype.slice");
                    break;
                case Array.prototype.sort:
                    inc(info, "Array.prototype.sort");
                    break;
                case Array.prototype.splice:
                    inc(info, "Array.prototype.splice");
                    break;
                case Array.prototype.unshift:
                    inc(info, "Array.prototype.unshift");
                    break;
            }

            isCallingConstructor = isConstructor;
            constructorFun = f;

            return {f:f,base:base,args:args,skip:false};
        };

        this.invokeFun = function(iid, f, base, args, result, isConstructor, isMethod){
            if (isConstructor) {
                checkArrayUniformity(iid, result);
                getCreateObjectInfo(iid, result, false);
            }
            return {result:result};
        };

        this.literal = function(iid, val, hasGetterSetter) {
            checkArrayUniformity(iid, val);
            getCreateObjectInfo(iid, val, false);
            return {result:val};
        };

        this.forinObject = function (iid, val) {
            forInUse(iid, val);
            return {result: val};
        };

        this.declare = function (iid, name, val, isArgument, argumentIndex){return {result:val};};

        this.getFieldPre = function(iid, base, offset){return {base:base,offset:offset,skip:false};};

        this.getField = function (iid, base, offset, val) {
            if (typeof base === 'function' && offset === "prototype") {
                getCreateObjectInfo(iid, val, true);
            }
            if (!isArr(base) && typeof base === 'object') {
                inc(info, "objectPropRead");
                if (!HOP(base, offset)) {
                    if (typeof val === "function") {
                        inc(info, "objectSuperFunPropRead");
                    } else {
                        inc(info, "objectSuperOtherPropRead", "IID" + iid, offset);
                    }
                }
            }
            return {result: val};
        };

        this.putFieldPre = function(iid, base, offset, val){
            var sobj;
            if (isArr(base)) {
                inc(info, "arrayPropWrite");
                if (isNormalNumber(offset) || offset === 'length') {
                    if (offset === 'length') {
                        inc(info, "arrayLengthWrite");
                    } else if (offset < 0 || offset >= base.length) {
                        if (offset === base.length) {
                            inc(info, "arrayAppendPropWrite", "IID" + iid);
                        } else {
                            inc(info, "arrayOutOfBoundNumberPropWrite", "IID" + iid);
                        }
                    }
                } else {
                    //console.log(offset);
                    inc(info, "arrayNonNumberPropWrite", "IID" + iid, offset);
                }
                sobj = getShadowObject(iid, base);
                updateSObjArrayNonUniformity(iid, sobj, val);
            } else if (typeof base === "object") {
                inc(info, "objectPropWrite");
                if (!HOP(base, offset) && base !== currThis) {
                    sobj = getCreateObjectInfo(iid, base, false);
                    if (!sobj || !sobj.isPrototype) {
                        inc(info, "objectAddPropWrite", "IID" + iid, offset);
                        if (sobj) {
                            checkObjectUniformity(iid, sobj, base, val);
                        }
                    }
                }
            }
            return {base:base,offset:offset,val:val,skip:false};
        };

        this.putField = function (iid, base, offset, val) {
            return {result: val};
        };

        this.read = function(iid, name, val, isGlobal, isPseudoGlobal){return {result:val};};

        this.write = function(iid, name, val, lhs, isGlobal, isPseudoGlobal) {return {result:val};};

        this.functionEnter = function (iid, f, dis, args) {
            if (isCallingConstructor && f === constructorFun) {
                currThis = dis;
            } else {
                currThis = undefined;
            }
            thisStack.push(currThis);
        };

        this.functionExit = function (iid, returnVal, exceptionVal) {
            thisStack.pop();
            currThis = thisStack[thisStack.length - 1];
            return {returnVal: returnVal, exceptionVal: exceptionVal, isBacktrack: false};
        };

        this.scriptEnter = function(iid, val){};

        this.scriptExit = function(iid, exceptionVal){return {exceptionVal:exceptionVal,isBacktrack:false};};

        this.binaryPre = function(iid, op, left, right){return {op:op,left:left,right:right,skip:false};};

        this.binary = function(iid, op, left, right, result){return {result:result};};

        this.unaryPre = function(iid, op, left) {return {op:op,left:left,skip:false};};

        this.unary = function(iid, op, left, result){return {result:result};};

        this.conditional = function(iid, result){return {result:result};};

        this.endExecution = function() {
            console.log(JSON.stringify(info, null, 4));
        };
    }
    sandbox.analysis = new MyAnalysis();
})(J$);


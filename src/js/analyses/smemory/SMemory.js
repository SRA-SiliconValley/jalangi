//----------------------------------- Record Replay Engine ---------------------------------

// create / reset J$ global variable to hold analysis runtime
if (typeof J$ === 'undefined') {
    J$ = {};
}

(function (sandbox) {
    sandbox.SMemory = function () {
        var Constants = (typeof sandbox.Constants === 'undefined' ? require('../../Constants.js') : sandbox.Constants);

        var SPECIAL_PROP = Constants.SPECIAL_PROP;
        var SPECIAL_PROP2 = Constants.SPECIAL_PROP2;
        var SPECIAL_PROP3 = Constants.SPECIAL_PROP3;
        var objectId = 1;
        var frameId = 2;
        var HOP = Constants.HOP;


        var frame = {};
        frame[SPECIAL_PROP] = frameId;
        frameId = frameId + 2;

        var frameStack = [frame];
        var evalFrames = [];


        function createShadowObject(val) {
            var type = typeof val;
            if ((type === 'object' || type === 'function') && !HOP(val, SPECIAL_PROP)) {
                if (Object && Object.defineProperty && typeof Object.defineProperty === 'function') {
                    Object.defineProperty(val, SPECIAL_PROP, {
                        enumerable:false,
                        writable:true
                    });
                }
                val[SPECIAL_PROP] = {};
                val[SPECIAL_PROP][SPECIAL_PROP] = objectId;
                objectId = objectId + 2;
            }

        }

        this.getShadowObject = function (val) {
            var value;
            createShadowObject(val);
            if (HOP(val, SPECIAL_PROP)) {
                value = val[SPECIAL_PROP];
            } else {
                value = undefined;
            }
            return value;
        };

        this.getFrameContainingVar = function (name) {
            var tmp = frame;
            while (tmp && !HOP(tmp, name)) {
                tmp = tmp[SPECIAL_PROP3];
            }
            if (tmp) {
                return tmp;
            } else {
                return frameStack[0]; // return global scope
            }
        };

        this.evalBegin = function () {
            evalFrames.push(frame);
            frame = frameStack[0];
        };

        this.evalEnd = function () {
            frame = evalFrames.pop();
        };


        this.initialize = function (iid, name) {
            frame[name] = undefined;
        };

        this.functionEnter = function (iid, val) {
            frameStack.push(frame = {});
            frame[SPECIAL_PROP] = frameId;
            frameId = frameId + 2;
            frame[SPECIAL_PROP3] = val[SPECIAL_PROP3];
        };

        this.functionReturn = function (iid) {
            frameStack.pop();
            frame = frameStack[frameStack.length - 1];
        };

        this.scriptEnter = function (iid) {
            frameStack.push(frame = {});
            frame[SPECIAL_PROP] = frameId;
            frameId = frameId + 2;
            frame[SPECIAL_PROP3] = frameStack[0];
        };

        this.scriptReturn = function (iid) {
            frameStack.pop();
            frame = frameStack[frameStack.length - 1];
        };

    };

    if (typeof module !== 'undefined') {
        module.exports = sandbox.SMemory;
    }

}(J$));



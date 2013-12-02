/*
 * Copyright 2013 Samsung Information Systems America, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Author: Koushik Sen
// Author: Manu Sridharan

/*jslint node: true */
/*global window */

function HOP(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * name of the global variable holding the Jalangi runtime objects
 */
var JALANGI_VAR = "J$";

/**
 * information on surrounding AST context, to be used by visitors passed
 * to transformAst()
 */
var CONTEXT = {
	// TODO what is this?
    RHS:1,
    // TODO what is this?
    IGNORE:2,
    // inside the properties of an ObjectExpression
    OEXP:3,
    // inside the formal parameters of a FunctionDeclaration or FunctionExpression
    PARAMS:4,
    // TODO what is this?
    OEXP2:5,
    // inside a getter
    GETTER:6,
    // inside a setter
    SETTER:7
};

/**
 * invoked by transformAst() to see if a sub-ast should be ignored.  For now,
 * only ignoring calls to J$.I()
 */
function ignoreSubAst(node) {
    return node.type === 'CallExpression' && node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Identifier' && node.callee.object.name === JALANGI_VAR &&
        node.callee.property.type === 'Identifier' && node.callee.property.name === 'I';
}

/**
 * generic AST visitor that allows for AST transformation.
 * 
 * @param object the root AST node to be visited
 * @param visitorPost an object defining visitor methods to be executed after a node's children 
 * have been visited.  The properties of visitorPost should be named with AST node types, and the
 * property values should be functions that take the node to be visited and a context value (see
 * the CONTEXT object above).  E.g., a post-visitor could be:
 * { 'AssignmentExpression': function (node, context) {
 *      // node.type === 'AssignmentExpression'	
 *   }
 * }
 * The value returned by the visitorPost method for a node will replace the node in the AST.
 * @param visitorPre an object defining visitor me5thods to be executed before a node's children
 * have been visited.  Structure should be similar to visitorPost (see above).  The return value
 * of visitorPre functions is ignored.
 * @param context the context of the surrounding AST; see the CONTEXT object above
 * @param {boolean} noIgnore if true, no sub-ast will be ignored.  Otherwise, sub-ASTs will be ignored
 * if ignoreAST() returns true.
 */
function transformAst(object, visitorPost, visitorPre, context, noIgnore) {
    var key, child, type, ret, newContext;

    type = object.type;
    if (visitorPre && HOP(visitorPre, type))
        visitorPre[type](object, context);

    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null && key !== "scope" && (noIgnore || !ignoreSubAst(object))) {
                if ((type === 'AssignmentExpression' && key === 'left') ||
                    (type === 'UpdateExpression' && key === 'argument') ||
                    (type === 'UnaryExpression' && key === 'argument' && object.operator === 'delete') ||
                    (type === 'ForInStatement' && key === 'left') ||
                    ((type === 'FunctionExpression' || type === 'FunctionDeclaration') && key === 'id') ||
                    (type === 'LabeledStatement' && key === 'label') ||
                    (type === 'BreakStatement' && key === 'label') ||
                    (type === 'CatchClause' && key === 'param') ||
                    (type === 'ContinueStatement' && key === 'label') ||
                    ((type === 'CallExpression' || type === 'NewExpression') &&
                        key === 'callee' &&
                        (object.callee.type === 'MemberExpression' ||
                            (object.callee.type === 'Identifier' && object.callee.name === 'eval'))) ||
                    (type === 'VariableDeclarator' && key === 'id') ||
                    (type === 'MemberExpression' && !object.computed && key === 'property')) {
                    newContext = CONTEXT.IGNORE;
                } else if (type === 'ObjectExpression' && key === 'properties') {
                    newContext = CONTEXT.OEXP;
                } else if ((type === 'FunctionExpression' || type === 'FunctionDeclaration') && key === 'params') {
                    newContext = CONTEXT.PARAMS;
                } else if (context === CONTEXT.OEXP) {
                    newContext = CONTEXT.OEXP2;
                } else if (context === CONTEXT.OEXP2 && key === 'key') {
                    newContext = CONTEXT.IGNORE;
                } else if (context === CONTEXT.PARAMS) {
                    newContext = CONTEXT.IGNORE;
                } else if (type === 'Property' && key === 'value' && object.kind === 'get') {
                    newContext = CONTEXT.GETTER;
                } else if (type === 'Property' && key === 'value' && object.kind === 'set') {
                    newContext = CONTEXT.SETTER;
                } else {
                    newContext = CONTEXT.RHS;
                }
                object[key] = transformAst(child, visitorPost, visitorPre, newContext, noIgnore);

            }
        }
    }

    if (visitorPost && HOP(visitorPost, type))
        ret = visitorPost[type](object, context);
    else
        ret = object;
    return ret;

}

/**
 * computes a map from iids to the corresponding AST nodes for root.  The root AST is destructively updated to
 * include SymbolicReference nodes that reference other nodes by iid, in order to save space in the map.
 */
function serialize(root) {
    var parentFunOrScript = root;
    var parentReplacement;
    var iidToAstTable = {};

    function handleFun(node) {
        parentFunOrScript = node;
        parentReplacement = {type:"SymbolicReference", value:null};
        return parentReplacement;
    }

    var visitorPre = {
        'Program':handleFun,
        'FunctionDeclaration':handleFun,
        'FunctionExpression':handleFun
    };

    var visitorPost = {
        'CallExpression':function (node) {
            try {
                if (node.callee.object && node.callee.object.name === 'J$' && (node.callee.property.name === 'Se' || node.callee.property.name === 'Fe')) {
                    iidToAstTable[node.arguments[0].value] = parentFunOrScript;
                    parentReplacement.value = node.arguments[0].value;
                    return node;
                } else if (node.callee.object && node.callee.object.name === 'J$' && node.arguments[0]) {
                    iidToAstTable[node.arguments[0].value] = node;
                    return {type:"SymbolicReference", value:node.arguments[0].value};
                }
                return node;
            } catch (e) {
                console.log(JSON.stringify(node));
                throw e;
            }
        }
    };

    transformAst(root, visitorPost, visitorPre);
    return iidToAstTable;
}

/**
 * given an iidToAstTable constructed by the serialize() function, destructively
 * update the AST values to remove SymbolicReference nodes, replacing them with a 
 * pointer to the appropriate actual AST node.
 */
function deserialize(iidToAstTable) {
	Object.keys(iidToAstTable).forEach(function (iid) {
		var curAst = iidToAstTable[iid];
		var visitorPost = {
			'SymbolicReference': function (node) {
				return iidToAstTable[node.value];
			}	
		};
		transformAst(curAst, visitorPost);
	});
}

// handle node.js and browser
// TODO use browserify
var exportObj;
if (typeof exports === 'undefined') {
	exportObj = {};
	if (typeof window !== 'undefined') {
		window.astUtil = exportObj;
	}
} else {
	exportObj = exports;
}
exportObj.serialize = serialize;
exportObj.deserialize = deserialize;
exportObj.JALANGI_VAR = JALANGI_VAR;
exportObj.CONTEXT = CONTEXT;
exportObj.transformAst = transformAst;
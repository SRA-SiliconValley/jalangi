var domroot = document.documentElement
document.createElementOrig = document.createElement
document.createElement = function (elem) {
    var res = document.createElementOrig(elem)
    observe(res)
    return res
}

var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mut) {
        DOMWalker(mut.target, mut.removedNodes.length)
    })
})
var config = { attributes:true, childList:true, characterData:true, subtree:false};
function observe(node) {
    observer.observe(node, config);
    node.isObserved = true
}
function isObserved(node) {
    return node.isObserved === true
}

function DOMWalker(n, extraLen) {
    var children = n.childNodes
    n.childNodes = children
    n.isDom = true
    for (var i = 0; i < children.length; i++) {
        var child = children[i]
        children[i] = child
        if (!isObserved(children[i])) {
            observe(children[i])
        }
        DOMWalker(children[i], 0)
    }
    for (; i < children.length + extraLen; i++) {
        children[i] = undefined;
    }
}

document.addEventListener("DOMContentLoaded", function (event) {
    DOMWalker(domroot, 0)
});

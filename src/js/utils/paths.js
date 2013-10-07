(function () {
    var sanf = function(path) {
	if (process.platform == "win32") {
	    return path.split("\\").join("\\\\")
	}
	return path
    }
    if (typeof window == 'undefined')
	exports.sanitizePath = sanf
    else
	window.sanitizePath = sanf
})()

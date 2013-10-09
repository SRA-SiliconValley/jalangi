exports.sanitizePath = function(path) {
    if (process.platform == "win32") {
	return path.split("\\").join("\\\\")
    }
    return path
}

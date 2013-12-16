/*global require console phantom */

var page = require('webpage').create(),
    system = require('system'),
    address;

if (system.args.length === 1) {
    console.log('Usage: loadnormal.js <some URL>');
    phantom.exit();
}

address = system.args[1];
page.onConsoleMessage = function (msg) {
	// just echo it
    console.log(msg);
};

page.open(address, function (status) {
    phantom.exit();
});

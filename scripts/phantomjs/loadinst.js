/*global require console phantom window */

var page = require('webpage').create(),
    system = require('system'),
    address;

if (system.args.length === 1) {
    console.log('Usage: loadinst.js <some URL>');
    phantom.exit();
}

address = system.args[1];

// set a flag indicating we're running in PhantomJS
page.onInitialized = function () {
	page.evaluate(function () {
		window.__JALANGI_PHANTOM__ = true;
	});
};

page.onConsoleMessage = function (msg) {
    console.log(msg);
};

var fs = require('fs');

page.open(address, function (status) {
    var trace = page.evaluate(function () {
         return window.J$.trace_output.join("");
      });
    fs.write("jalangi_trace", trace);
    phantom.exit();
});

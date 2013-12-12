var jsdom = require("jsdom");
var fs = require("fs");
var jalangi = !!process.argv[2];

var scripts = jalangi ?   ['../../../src/js/analysis.js', '../../../src/js/InputManager.js', '../../../node_modules/escodegen/escodegen.browser.js', '../../../node_modules/esprima/esprima.js', '../../../src/js/utils/astUtil.js', '../../../src/js/instrument/esnstrument.js', '../jquery-2.0.2_jalangi_.js'] : ['../jquery-2.0.2.js'];

jsdom.env(
  '<html><head></head><body></body></html>',
  scripts,
  function (errors, window) {
    if (errors) {
      console.log("errors!");
      console.log(errors);
    }
    fs.writeFileSync("jalangi_trace", window.J$.trace_output.join(''));
  }
);

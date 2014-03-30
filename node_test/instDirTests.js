/*
 * Copyright 2014 Samsung Information Systems America, Inc.
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

// Author: Manu Sridharan


/*global describe */
/*global it */

var instDir = require('./../src/js/commands/instrumentDir');
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var temp = require('temp');


describe('instrument dir tests', function () {
    it('should handle extra app scripts', function (done) {
        var options = {
            inputDir: "tests/html/unitApps/app1",
            outputDir: temp.dir,
            // the exact script doesn't matter for this test
            extra_app_scripts: "tests/unit/date-conversion.js"
        };
        instDir.instDir(options, function (err) {
            assert(!err, err);
            assert(fs.existsSync(path.join(options.outputDir, "app1", instDir.EXTRA_SCRIPTS_DIR, "date-conversion.js")));
            assert(!fs.existsSync(path.join(options.inputDir, instDir.EXTRA_SCRIPTS_DIR)));
            var html = String(fs.readFileSync(path.join(options.outputDir, "app1", "index.html")));
            assert(html.indexOf("<script src=\"__jalangi_extra/date-conversion.js\">") !== -1);
            done();
        });

    });
    it('should handle multiple extra app scripts', function (done) {
        var options = {
            inputDir: "tests/html/unitApps/app1",
            outputDir: temp.dir,
            // the exact script doesn't matter for this test
            extra_app_scripts:
                "tests/unit/date-conversion.js" + path.delimiter +
                "tests/unit/gettersetter.js"
        };
        instDir.instDir(options, function (err) {
            assert(!err, err);
            assert(fs.existsSync(path.join(options.outputDir, "app1", instDir.EXTRA_SCRIPTS_DIR, "date-conversion.js")));
            assert(fs.existsSync(path.join(options.outputDir, "app1", instDir.EXTRA_SCRIPTS_DIR, "gettersetter.js")));
            assert(!fs.existsSync(path.join(options.inputDir, instDir.EXTRA_SCRIPTS_DIR)));
            var html = String(fs.readFileSync(path.join(options.outputDir, "app1", "index.html")));
            assert(html.indexOf("<script src=\"__jalangi_extra/date-conversion.js\">") !== -1);
            assert(html.indexOf("<script src=\"__jalangi_extra/gettersetter.js\">") !== -1);
            done();
        });

    });

});
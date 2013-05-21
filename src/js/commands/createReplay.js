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

(function(){
    var traceWfh;
    var fs;
    var TRACE_FILE_NAME = process.argv[2]?process.argv[2]:"jalangi_trace";
    var OUTPUT_FILE_NAME = TRACE_FILE_NAME+".html";
    var FileLineReader = require('./../utils/FileLineReader');
    var traceRfh = new FileLineReader(TRACE_FILE_NAME);
    var F_TYPE = 0,
        F_VALUE = 1,
        F_IID = 2,
        F_FUNNAME = 4,
        F_SEQ = 3;

//    var N_LOG_LOAD = 0,
//    var N_LOG_FUN_CALL = 1,
//      N_LOG_METHOD_CALL = 2,
    var  N_LOG_FUNCTION_ENTER = 4,
//      N_LOG_FUNCTION_RETURN = 5,
        N_LOG_SCRIPT_ENTER = 6,
//      N_LOG_SCRIPT_EXIT = 7,
        N_LOG_GETFIELD = 8,
//      N_LOG_GLOBAL = 9,
        N_LOG_ARRAY_LIT = 10,
        N_LOG_OBJECT_LIT = 11,
        N_LOG_FUNCTION_LIT = 12,
        N_LOG_RETURN = 13,
        N_LOG_REGEXP_LIT = 14,
//      N_LOG_LOCAL = 15,
//      N_LOG_OBJECT_NEW = 16,
        N_LOG_READ = 17,
//      N_LOG_FUNCTION_ENTER_NORMAL = 18,
        N_LOG_HASH = 19,
        N_LOG_SPECIAL = 20,
        N_LOG_STRING_LIT = 21,
        N_LOG_NUMBER_LIT = 22,
        N_LOG_BOOLEAN_LIT = 23,
        N_LOG_UNDEFINED_LIT = 24,
        N_LOG_NULL_LIT = 25;


    function openWriteFile() {
        if (traceWfh === undefined) {
            fs = require('fs');
            traceWfh = fs.openSync(OUTPUT_FILE_NAME, 'w');
        }
    }

    function writeLine(str) {
        if (traceWfh) {
            fs.writeSync(traceWfh, str);
            fs.writeSync(traceWfh, "\n");
        }
    }


    function closeWriteFile() {
        if (traceWfh) {
            fs.closeSync(traceWfh);
        }
    }


    openWriteFile();
    writeLine('<!DOCTYPE html>');
    writeLine('<html>');
    writeLine('<head>');
    writeLine('<title></title>');
    writeLine('<script type="text/javascript">');
    writeLine('window.JALANGI_MODE="replay"');
    writeLine('window.JALANGI_ANALYSIS="none"');
    writeLine('</script>');
    //writeLine('<script src="thirdparty/smoothie/base/require.js" type="text/javascript"></script>');
    writeLine('<script src="src/js/analysis.js" type="text/javascript"></script>');
    writeLine('<script src="src/js/InputManager.js" type="text/javascript"></script>');
    //writeLine('<script src="thirdparty/source-map/dist/source-map.js"></script>');
    writeLine('<script src="thirdparty/esprima/esprima.js"></script>');
    writeLine('<script src="thirdparty/escodegen/escodegen.browser.js"></script>');
    writeLine('<script src="src/js/instrument/esnstrument.js" type="text/javascript"></script>');
    writeLine('<script src="inputs.js" type="text/javascript"></script>');

    writeLine('<script type="text/javascript">');

//    var count = 0;
    while (traceRfh.hasNextLine()) {
        var line = traceRfh.nextLine();
//        var record = JSON.parse(line);
//        if (record[F_FUNNAME] === N_LOG_SCRIPT_ENTER) {
//            ++count;
//        }
        writeLine("J$.addRecord("+JSON.stringify(line)+");")
    }
    traceRfh.close();

//    writeLine('try {');
    writeLine('J$.replay();');
//    writeLine('} finally {');
//    writeLine('J$.endExecution();');
//    writeLine('}');
    writeLine('</script>');

    closeWriteFile();
}());



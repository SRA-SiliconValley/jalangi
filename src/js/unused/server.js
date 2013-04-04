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

var http = require('http'),
    url = require('url'),
    sys = require('sys'),
    fs = require('fs');

var    host = (process.argv[2]) ? process.argv[2] : "127.0.0.1";
var    port = (process.argv[3]) ? process.argv[3] : 8080;
var TRACE_FILE_NAME = 'jalangi_trace';
var traceFh;
var fileIndex = 1;

http.createServer(function (req, res) {
    var request = url.parse(req.url, true);

    var msg =  request.query.string;
    if (msg) {
        if (msg==='reset') {
            traceFh = fs.openSync(TRACE_FILE_NAME+fileIndex, 'w');
            fileIndex++;

        } else {
            fs.writeSync(traceFh,msg);
        }
        var img = fs.readFileSync('./tinytrans.gif');
        res.writeHead(200, {'Content-Type': 'image/gif' });
        res.write(img,'binary');
        res.end();
    }
}).listen(port, host);
console.log('Server running at http://'+host+':'+port+'/');

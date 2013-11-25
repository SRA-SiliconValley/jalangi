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

/*jslint node: true */

var WebSocketServer = require('websocket').server,
    http = require('http'),
    sys = require('sys'),
    fs = require('fs'),
    path = require('path');

var TRACE_FILE_NAME = 'jalangi_trace';
var fileIndex = 1;


function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}


/**
 * possible options:
 * - options.port: port on which to listen (defaults to 8080)
 * - options.url: URL to open in Chrome
 * - options.outputDir: directory in which to write trace file (defaults to working directory)
 */
function start(options) {
	var port = options.port ? options.port : 8080;
	var url = options.url ? options.url : "";
	var outputDir = options.outputDir ? options.outputDir : ".";
	if (!port) {
		port = 8080;
	}
	if (!url) {
		url = "";
	}
	var server = http.createServer(function(request, response) {
	    console.log((new Date()) + ' Received request for ' + request.url);
	    response.writeHead(404);
	    response.end();
	});
	server.listen(port, function() {
	    console.log((new Date()) + ' Server is listening on port 8080');
	});
	
	var wsServer = new WebSocketServer({
	    httpServer: server
	});
	wsServer.on('request', function(request) {
	    var traceFh;
	    var isOpen = false;
	
	    if (!originIsAllowed(request.origin)) {
	        // Make sure we only accept requests from an allowed origin
	        request.reject();
	        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
	        return;
	    }
	
	    var connection = request.accept('log-protocol', request.origin);
	    console.log((new Date()) + ' Connection accepted.');
	    connection.on('message', function(message) {
	        var msg;
	        if (message.type === 'utf8') {
	            msg = message.utf8Data;
	
	            if (msg === 'reset') {
	                if (isOpen) {
	                    fs.closeSync(traceFh);
	                    isOpen = false;
	                }
	                traceFh = fs.openSync(path.join(outputDir, TRACE_FILE_NAME+fileIndex), 'w');
	                isOpen = true;
	                fileIndex++;
	            } else if (msg === 'restart') {
	//                fileIndex = 1;
	//                if (isOpen) {
	//                    fs.closeSync(traceFh);
	//                    isOpen = false;
	//                }
	                var sys = require('sys');
	                var exec = require('child_process').exec;
	                var puts = function(error, stdout, stderr) { sys.puts(stdout); };
	                exec("./por "+url, puts);
	            } else {
	                fs.writeSync(traceFh,msg);
	            }
	//            console.log("Sending done");
	            connection.sendUTF("done");
	        }
	    });
	    connection.on('close', function(reasonCode, description) {
	        if (isOpen) {
	            fs.closeSync(traceFh);
	            isOpen = false;
	        }
	        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected. '+reasonCode+" "+description);
	    });
	});		
}

exports.start = start;

if (require.main === module) {
	// TODO what is 'host' for?  kill it?
	var host = (process.argv[2]) ? process.argv[2] : "127.0.0.1";
	var port = process.argv[3];
	var url = process.argv[4];
	start({port : port, url: url});
}




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

var WebSocketServer = require('websocket').server;
var http = require('http');

var sys = require('sys'),
    fs = require('fs');

var    host = (process.argv[2]) ? process.argv[2] : "127.0.0.1";
var    port = (process.argv[3]) ? process.argv[3] : 8080;
var url = process.argv[4]? process.argv[4]:"";
var TRACE_FILE_NAME = 'jalangi_trace';
var fileIndex = 1;

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    maxReceivedFrameSize: 64*1024*1024,
    maxReceivedMessageSize: 64*1024*1024,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

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
                traceFh = fs.openSync(TRACE_FILE_NAME+fileIndex, 'w');
                isOpen = true;
                fileIndex++;
            } else if (msg === 'restart') {
//                fileIndex = 1;
//                if (isOpen) {
//                    fs.closeSync(traceFh);
//                    isOpen = false;
//                }
                var sys = require('sys')
                var exec = require('child_process').exec;
                function puts(error, stdout, stderr) { sys.puts(stdout) }
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

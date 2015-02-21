#!/usr/bin/env node

var http = require('http');
var fs = require('fs');
var util = require('util');

var downloadInProgress = 0;
var downloadTotal = 0;

function download(url, dest) {
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function (response) {
		downloadInProgress++;
		downloadTotal++;
        response.pipe(file);
        file.on('finish', function () {
			downloadInProgress--;
            file.close();
        });
        file.on('error', function (err) {
			downloadInProgress--;
			console.log('error');
            fs.unlink(dest);
        });
    });
}

setInterval(function(){
	util.print("\u001b[2J\u001b[0;0H");
	console.log('Downloads');
	console.log('Total:       ' + downloadTotal);
	console.log('In Progress: ' + downloadInProgress);
}, 1000)

http.createServer(function (req, res) {
	if(req.method == 'PUT'){
		var fullBody = '';
		req.on('data', function(chunk) {
			fullBody += chunk.toString();
		});
		req.on('end', function() {
			var query = JSON.parse(fullBody);
			console.log(query.url + ' -> ' + query.destination);
			download(query.url, query.destination);
		}); 
		
		res.writeHead(202);
		res.end();
	} else {
		res.writeHead(400);
		res.end();
	}

}).listen(9999);

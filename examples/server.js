
/**
 * USAGE:
 *		PORT=9999 node server.js
 **/

var express = require('express');
var path = require('path');

const { lstatSync, readdirSync, existsSync } = require('fs');
const { join } = require('path');
const isFile = source => lstatSync(source).isFile();
const isDirectory = source => lstatSync(source).isDirectory();
const getDirectories = source => readdirSync(source).map(name => join(source,name)).filter(isDirectory);

const isExampleDirectory = source => isDirectory(source) && existsSync(source + '/index.html');
const getExampleDirectories = source => readdirSync(source).map(name => join(source,name)).filter(isExampleDirectory);

var app = express();
var port = process.env.PORT || 1337;


// client side
// javascript function in a frame
function on_change() {
	var select = document.getElementById('examples');
	var val = select.value;
	var frame = parent.frames['main'];
	frame.location = val + '/index.html';
}

function handle_select_frame(req, res) {
	var dirs = getExampleDirectories('.');
	var script = '<script>' + on_change.toString() + '</script>'
	var html = '<html><head>' + script + '<body>'
	html += 'Examples:&nbsp;';
	html += '<select id="examples" style="width:100px;" onchange="on_change()">';
	html += dirs.map(s => '<option value="' + s + '">' + s +'</option>').join('\n');
	html += '</select>';
	html += '</body></html>';
	res.send(html);
}

function handle_examples(req, res) {
	var dirs = getExampleDirectories('.').map(s => s+'/index.html');
	var src = dirs[0] || '';
	var html = '<html>';
	html += '<frameset rows="10%,90%" frameborder="0"><frame name="select" src="/select"></frame>';
	html += '<frame name="main" id="frame" src="' + src + '"></frame></frameset>';
	html += '</html>'
	res.send(html);
}

var route_table = {
	'/': handle_examples,
	'/select': handle_select_frame,
	'/examples': handle_examples
};

for(var key in route_table) {
	app.get(key, route_table[key]);
	app.use(key, express.static(path.join(__dirname,key.slice(1))));
}

app.use(express.static(path.join(__dirname,'share')));

app.listen(port, function(){
	console.log('open 127.0.0.1:' + port);
});


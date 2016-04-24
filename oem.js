// modules
var http = require('http');
var fs = require('fs');
var path = require("path");
var pkg = require('./package');
var colors = require('colors');

// content type enums
var CONTENT_TYPE = {};
CONTENT_TYPE.HTML = "text/html";
CONTENT_TYPE.JS = "application/javascript";
CONTENT_TYPE.PNG = "image/png";
CONTENT_TYPE.JPG = "image/jpg";
CONTENT_TYPE.CSS = "text/css";

// argument enums
var ARG = {};
ARG.HELP = 'help';
ARG.RUN = 'run';

// cli args
var ARGS = process.argv.filter(function(arg, i){ return i > 1; });

//Lets define a port we want to listen to
const PORT = 8080;

/**
 * Load script tags
 * @param  {[type]} files [description]
 * @return {[type]}       [description]
 */
function scriptTags(files) {
    var tags = '';
    files.forEach(function(file){
        tags += '<script src="'+file+'"></script>\n';        
    });
    return tags;
}

/**
 * Get content type
 * @param  {[type]} extname [description]
 * @return {[type]}         [description]
 */
function getContentType(extname){
    var contentType = CONTENT_TYPE.HTML;
    switch (extname) {
        case '.js':
            contentType = CONTENT_TYPE.JS;
            break;
        case '.png':
            contentType = CONTENT_TYPE.PNG;
            break;
        case '.jpg':
            contentType = CONTENT_TYPE.JPG;
            break;
        case '.css':
            contentType = CONTENT_TYPE.CSS;
            break;
    }
    return contentType;
}

/**
 * Handle http requests
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function handleRequest(req, res) {

    if (req.url === "/") {

        var template = fs.readFileSync('./template.html', 'utf8');
        var html = fs.readFileSync('./src/component.html', 'utf8');
        var js = scriptTags(pkg.oem.js);
        template = template.replace("<!-- html -->", html);
        template = template.replace("<!-- js -->", js);
        res.writeHead(200, { "Content-Type": CONTENT_TYPE.HTML });
        res.write(template);
        res.end();

    // else serve asset
    } else {

        var filePath = '.' + req.url;
        var extname = path.extname(filePath);
        var contentType = getContentType(extname);

        fs.readFile(filePath, function(error, content) {
            if (error) {
                if (error.code == 'ENOENT') {
                    res.writeHead(404);
                    res.end('404');
                    res.end();
                } else {
                    res.writeHead(500);
                    res.end('500');
                    res.end();
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });

    }

}

/**
 * Start OEM server
 * @return {[type]} [description]
 */
function startServer(){
    //Create a server
    var server = http.createServer(handleRequest);

    //Lets start our server
    server.listen(PORT, function() {
        console.log(" OEM ".inverse.green, "http://localhost:" + PORT);
    });
}

/**
 * Show help
 * @return {[type]} [description]
 */
function showHelp(){
    console.log();
    console.log(" OEM ".inverse.green);
    console.log();
    console.log("USAGE".white);
    console.log("--------------------------------------------");
    console.log("node oem [option] [arguments]");
    console.log();
    console.log("OPTIONS".white);
    console.log("--------------------------------------------");
    console.log(ARG.HELP.white, "   - usage documentation");
    console.log(ARG.RUN.white, "    - run the development server. argument: [oem configuration]");
    console.log();
    console.log();
}

// trigger
switch(ARGS[0]){
    case ARG.RUN:
        startServer();
        break;
    case ARG.HELP:
        showHelp();
        break;
    default:
        showHelp();
}

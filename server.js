//Lets require/import the HTTP module
var http = require('http');
var fs = require('fs');
var path = require("path");
var pkg = require('./package');

//Lets define a port we want to listen to
const PORT = 8080;


function jsFiles(files) {
    var scripts = '';
    files.forEach(function(file){
        scripts += '<script src="'+file+'"></script>\n';        
    });
    return scripts;
}

//We need a function which handles requests and send response
function handleRequest(request, response) {
    // console.log(request.url, response);
    // response.end('It Works!! Path Hit: ' + request.url);
    console.log(request.url);

    // if "/", serve template
    if (request.url === "/") {

        var template = fs.readFileSync('./template.html', 'utf8');
        var html = fs.readFileSync('./src/component.html', 'utf8');
        var js = jsFiles(pkg.oem.js);
        var css = '<link rel="stylesheet" type="text/css" href="./src/component.css">';
        template = template.replace("<!-- html -->", html);
        template = template.replace("<!-- js -->", js);
        template = template.replace("<!-- css -->", css);
        response.writeHead(200, {
            "Content-Type": "text/html"
        });
        response.write(template);
        response.end();

    // else serve asset
    } else {

        var filePath = '.' + request.url;
        var extname = path.extname(filePath);
        var contentType = 'text/html';
        switch (extname) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
                contentType = 'image/jpg';
                break;
        }

        fs.readFile(filePath, function(error, content) {
            if (error) {
                if (error.code == 'ENOENT') {
                    fs.readFile('./404.html', function(error, content) {
                        response.writeHead(200, {
                            'Content-Type': contentType
                        });
                        response.end(content, 'utf-8');
                    });
                } else {
                    response.writeHead(500);
                    response.end('Error: ' + error.code + ' ..\n');
                    response.end();
                }
            } else {
                response.writeHead(200, {
                    'Content-Type': contentType
                });
                response.end(content, 'utf-8');
            }
        });

    }

}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function() {
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});
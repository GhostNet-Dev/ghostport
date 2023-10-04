const http = require('http');
const fs = require('fs');
const mime = require('mime');
const websock = require('ws');

const server = http.createServer(function (request: any, response: any) { 
    var url = request.url;
    if (request.url == '/' || request.url.startsWith("/?")) {
        url = '/index_web.html';	// 실행할 url
    }
    console.log("." + request.url);
    try {
        const type = mime.getType("."+ url);
        console.log(type);
        response.setHeader("Content-Type", type); //Solution!
        response.writeHead(200);
        response.end(fs.readFileSync("." + url));
    } catch {
        response.writeHead(404);
        response.end();
    }
});

// 3. listen 함수로 8080 포트를 가진 서버를 실행한다. 서버가 실행된 것을 콘솔창에서 확인하기 위해 'Server is running...' 로그를 출력한다
const httpServer = server.listen(8090);

const websockServer = new websock.Server({
    server: httpServer,
});
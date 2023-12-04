import http from 'http'

function GetPublicIp(callback: Function) {
    fetch("https://api.ipify.org?format=json", { method: 'GET' })
        .then(res => res.json())
        .then(data => callback(data.ip))
        .catch((err)=>{
            console.log(err)
            fetch("http://lb.ghostnetroot.com:58083/getip")
                .then(res => res.json())
                .then(data => callback(data.ip))
        });

        /*
    // Set the URL of the request to the ipify API
    const options = {
        host: 'api.ipify.org',
        port: 80,
        path: '/?format=json'
    };

    let resultIp = "";
    // Create a new http.ClientRequest object
    const req =  http.request(options, (res) => {
        // Set the response encoding to utf8
        res.setEncoding('utf8');

        // When a chunk of data is received, append it to the body
        let body = '';
        res.on('data', (chunk) => {
            body += chunk;
        });

        // When the response completes, parse the JSON and log the IP address
        res.on('end', () => {
            const data = JSON.parse(body);
            callback(data.ip)
        });
    });

    // Send the request
    req.end();
    return req;
    */
}

export { GetPublicIp }
import { spawn, ChildProcessWithoutNullStreams } from "child_process";

let g_gws!: ChildProcessWithoutNullStreams;

export const CreateAccount = (gwsPath: string, id: string, pw: string, 
    ip: string, port: string, callback: Function) => {
    const gws = spawn(gwsPath, ['create', '-u', id, '-p', pw,
        '--ip', ip, '--port', port])

    const thisObj = this;
    gws.on('exit', function (code, signal) {
        console.log('child process exited with ' +
            `code ${code} and signal ${signal}`)
        callback();
    })

    gws.stdout.on('data', data => {
        console.log(`child stdout: ${data}`);
    })
    gws.stderr.on('data', data => {
        console.log(`child stderr: ${data}`);
    })
}

export const ExecuteProcess = (gwsPath: string, id: string, pw: string, 
    ip: string, port: string, exit: Function, out: Function, err: Function) => {
        g_gws = spawn(gwsPath, ['-u', id, '-p', pw,
            '--ip', ip, '--port', port])

        g_gws.on('exit', function (code, signal) {
            console.log('child process exited with ' +
                `code ${code} and signal ${signal}`)
            exit(code)
        })

        g_gws.stdout.on('data', data => {
            //console.log(`child stdout: ${data}`);
            out(data);
        })
        g_gws.stderr.on('data', data => {
            //console.log(`child stderr: ${data}`);
            err(data);
        })
}
import { spawn, ChildProcessWithoutNullStreams } from "child_process";

let g_gws!: ChildProcessWithoutNullStreams;
let g_accountRunning: boolean = false;
let g_running: boolean = false;

export const CheckRunning = (): boolean => {
    return g_running;
}

export const CreateAccount = (gwsPath: string, id: string, pw: string, 
    ip: string, port: string, callback: Function) => {
    const gws = spawn(gwsPath, ['create', '-u', id, '-p', pw,
        '--ip', ip, '--port', port]);
    g_accountRunning = true;

    gws.on('exit', function (code, signal) {
        console.log('child process exited with ' +
            `code ${code} and signal ${signal}`)
        g_accountRunning = false;
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
        if (g_running == true) return;

        g_gws = spawn(gwsPath, ['-u', id, '-p', pw,
            '--ip', ip, '--port', port])
        g_running = true;

        g_gws.on('exit', function (code, signal) {
            console.log('child process exited with ' +
                `code ${code} and signal ${signal}`)
            g_running = false;
            exit(code)
        })

        g_gws.stdout.on('data', data => {
            out(data);
        })
        g_gws.stderr.on('data', data => {
            err(data);
        })
}
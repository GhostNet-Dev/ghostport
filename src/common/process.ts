import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import * as fs from "fs"
import * as path from "path"

let g_gws!: ChildProcessWithoutNullStreams;
let g_accountRunning: boolean = false;
let g_running: boolean = false;

export const CheckRunning = (): boolean => {
    return g_running;
}

export const AbortService = () => {
    //controller.abort()
    //if (g_gws == undefined || g_gws.pid == undefined) return
    //process.kill(-g_gws.pid, 'SIGTERM')
    try {
        g_gws.stdout.pause()
        g_gws.stderr.pause()
        g_gws.kill()
    } catch (e) {
        console.log(e)
    }
    g_running = false
    console.log("abort and restart")
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

let g_id: string
let g_pw: string
let g_ip: string
let g_port: string
let g_wport: string
let g_exit: Function
let g_out: Function
let g_err: Function

export const RestartProcess = (gwsPath: string) => {
    ExecuteProcess(gwsPath, g_id, g_pw, g_ip, g_port, g_wport, g_exit, g_out, g_err)
}

export const ExecuteProcess = (gwsPath: string, id: string, pw: string, 
    ip: string, port: string, wport:string, exit: Function, out: Function, err: Function) => {
        if (g_running == true) return;

        g_id = id; g_pw = pw; g_ip = ip; g_port = port
        g_wport = wport; g_exit = exit; g_out = out; g_err = err

        g_gws = spawn(gwsPath, ['-u', id, '-p', pw,
            '--ip', ip, '--port', port, '--wport', wport])
        g_running = true;

        g_gws.on('exit', function (code, signal) {
            console.log('child process exited with ' +
                `code ${code} and signal ${signal}`)
            g_running = false;
            console.log("exit program : ", code)
            exit(code)
        })
        g_gws.on('err', err => {
            console.log(err)
        })

        g_gws.stdout.on('data', data => {
            out(data);
        })
        g_gws.stderr.on('data', data => {
            err(data);
        })
}

export const DiffusionProcess = (prompt: string, nprompt: string, height: string,
    width: string, step: string, seed: string, filename: string, initFilename: string,
    exit: Function, out: Function, err: Function) => {
        !fs.existsSync("./outputs") && fs.mkdirSync("./outputs");
        filename = path.join("./outputs", filename);
        prompt = prompt.toLowerCase();
        nprompt = nprompt.toLowerCase();

        const sd = spawn("./bins/sd", ['-h', height, '-w', width,
            '-s', step, '-r', seed, '-p', prompt, '-n', nprompt,
            '-f', filename ,'-i', ""])

        sd.on('exit', function (code, signal) {
            console.log('child process exited with ' +
                `code ${code} and signal ${signal}`)
            g_running = false;
            console.log("exit program : ", code)
            exit(code)
        })

        sd.stdout.on('data', data => {
            out(data);
        })
        sd.stderr.on('data', data => {
            err(data);
        })

}
import * as http from "http"
import * as fs from "fs";
import checkDiskSpace from 'check-disk-space'

const filedownload = (masterAddr: string, filename: string, callback :Function) => {
    const file = fs.createWriteStream(filename, {mode: 0o777});
    const url = `${masterAddr}?os=${process.platform}`;

    console.log(url);
    const request = http.get(url, function (response) {
        //console.log(file);
        response.pipe(file);

        // after download completed close filestream
        file.on("finish", () => {
            file.close();
            console.log("Download Completed");
            callback(true);
        });
    }).on('error', err =>{
        callback(false);
    });
    //console.log(request);
}

const fileExist = (filename: string):boolean => {
    let ret = false;
    if (fs.existsSync(filename)) {
        // File exists in path
        ret = true;
    } else {
        // File doesn't exist in path
        console.log("file doesn't exists: ", filename);
    }
    return ret;
}

const getDiskSpace = (path: string, callback: Function) => {
    checkDiskSpace(path).then((diskSpace) => {
        callback(diskSpace)
        // {
        //     diskPath: 'C:',
        //     free: 12345678,
        //     size: 98756432
        // }
        // Note: `free` and `size` are in bytes
    })
}

export { getDiskSpace, filedownload, fileExist }

import * as http from "http"
import * as path from "path"
import * as fs from "fs";
import checkDiskSpace from 'check-disk-space'
import { FileInfo } from "../models/param.js";

const filedownload = (uri: string, filename: string, callback :Function) => {
    const file = fs.createWriteStream(filename, {mode: 0o777});
    const url = `${uri}/gws?os=${process.platform}`;

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

const requestHttpGet = (uri: string, fileinfo: FileInfo, type: string, filepath: string, callback: Function) => {
    const filename = fileinfo.filename
    if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath);
    }
    if(fs.existsSync(path.join(filepath , filename))) {
        if (fs.statSync(path.join(filepath , filename)).size == fileinfo.filesize) {
            return 
        }
    }

    const file = fs.createWriteStream(path.join(filepath , filename), { mode: 0o777 });
    return http.get(`${uri}/download?type=${type}&os=${process.platform}&filename=${filename}`, (response) => {
        response.pipe(file);

        // after download completed close filestream
        file.on("finish", () => {
            file.close();
            console.log("Download Completed");
            callback(filename);
        });
    })
}

const downloads = async (uri: string, assetList: FileInfo[], binsList: FileInfo[], libsList: FileInfo[], callback: Function) => {
    const assetRequests = assetList.map((fileinfo: FileInfo) => {
        return requestHttpGet(uri, fileinfo, "asset", "./assets", callback)
    });
    const binsRequests = binsList.map((fileinfo: FileInfo) => {
        return requestHttpGet(uri, fileinfo, "bins", "./bins", callback)
    });
    const libsRequests = libsList.map((fileinfo: FileInfo) => {
        return requestHttpGet(uri, fileinfo, "libs", "/usr/local/lib", callback)
    });
    await Promise.all([
        assetRequests, binsRequests, libsRequests
    ])
}

const checkAssets = (assetList: FileInfo[]): FileInfo[] => {
    for (let i = 0; i < assetList.length; i++) {
        const asset = assetList[i]
        if(fs.existsSync(path.join("./assets", asset.filename))) {
            if (fs.statSync(path.join("./assets", asset.filename)).size == asset.filesize) {
                assetList.splice(i, 1)
            }
        }
    }
    return assetList
}

const fileExist = (filepath: string, filename: string):boolean => {
    let ret = false;
    if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath);
        return ret;
    }
    if (fs.existsSync(path.join(filepath, filename))) {
        // File exists in path
        if (fs.statSync(path.join(filepath, filename)).size > 0)
            ret = true;
    } else {
        // File doesn't exist in path
        console.log("file doesn't exists: ", filename);
    }
    return ret;
}

const getDiskSpace = (filepath: string, callback: Function) => {
    checkDiskSpace(filepath).then((diskSpace) => {
        callback(diskSpace)
        // {
        //     diskPath: 'C:',
        //     free: 12345678,
        //     size: 98756432
        // }
        // Note: `free` and `size` are in bytes
    })
}

const fileWrite = (filepath: string, file: ArrayBuffer) => {
    fs.writeFile(filepath, new DataView(file), 'binary', (err) => { console.log(err) })
}

export { getDiskSpace, filedownload, fileExist, fileWrite, downloads}

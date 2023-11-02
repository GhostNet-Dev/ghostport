import * as fs from "fs";
import * as path from "path";

const GetAccountFileList = (): string[] => {
    var filelist : string[] = []
    fs.readdirSync("./").forEach((file) => {
        if (path.extname(file) == ".ghost") {
            filelist.push(file)
        }
    })
    
    return filelist
}

export { GetAccountFileList }
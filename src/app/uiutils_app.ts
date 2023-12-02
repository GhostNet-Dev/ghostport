import "module-alias/register"
import { AppFactory } from "@src/factory/appfactory";
import { GhostWebUser } from "@src/models/param";
import { Base } from "@src/views/base";
import * as config from "@src/models/config.js";

export const factory = new AppFactory();
const blockStore = factory.GetBlockStore();
const session = factory.GetSession();
const funcMap = factory.Build();

const base = new Base("./", funcMap, blockStore, session)


window.ClickLoadPage = (key: string, fromEvent: boolean, ...args: string[]) => {
    base.ClickLoadPage(key, fromEvent, ...args)
}

window.onpopstate = (event) => {
    //window.ClickLoadPage(event.state['key'], event.state['fromEvent'], event.state['args'])
    base.includeContentHTML(window.MasterAddr)
};

base.InitIncludeHTML()

const parseResponse = (nodes: GhostWebUser[]): GhostWebUser => {
    return base.parseResponse(nodes)
}


addEventListener("load", () => {
    fetch(config.RootAddress + "/nodes")
        .then((response) => response.json())
        .then(parseResponse)
        .then(base.loadNodesHtml)
        .then((url) => base.includeContentHTML(url))
});


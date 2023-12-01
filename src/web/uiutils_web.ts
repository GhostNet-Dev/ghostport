import { WebFactory } from "../factory/webfactory.js";
import { GhostWebUser } from "../models/param.js";
import { Base } from "../views/base.js";
import * as config from "../models/config.js";

const factory = new WebFactory();
const blockStore = factory.GetBlockStore();
const funcMap = factory.Build();

const base = new Base("../", funcMap, blockStore)

window.ClickLoadPage = (key: string, fromEvent: boolean, ...args: string[]) => {
    base.ClickLoadPage(key, fromEvent, ...args)
}

window.onpopstate = (event) => {
    //window.ClickLoadPage(event.state['key'], event.state['fromEvent'], event.state['args'])
    base.includeContentHTML(window.MasterAddr)
};


const parseResponse = (nodes: GhostWebUser[]): GhostWebUser => {
    return base.parseResponse(nodes)
}

base.InitIncludeHTML()

addEventListener("load", () => {
    fetch(config.RootAddress + "/nodes")
        .then((response) => response.json())
        .then(parseResponse)
        .then(base.loadNodesHtml)
        .then((url) => base.includeContentHTML(url))
});

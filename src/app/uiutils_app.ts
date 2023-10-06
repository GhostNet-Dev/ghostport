import "module-alias/register"
import { factory, includeContentHTML, includeHTML, parseResponse, loadNodesHtml } from "@src/app/ghostapp.js";

includeHTML("header", "navbar.html");
includeHTML("footer", "foot.html");

addEventListener("load", () =>
    fetch("http://ghostnetroot.com:58080/nodes")
        .then((response) => response.json())
        .then(parseResponse)
        .then(loadNodesHtml)
        .then((url) => includeContentHTML(url))
        .then(() => factory.OpenTerminal()));

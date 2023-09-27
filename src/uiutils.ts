import "module-alias/register"
import { includeContentHTML, includeHTML, parseResponse, loadNodesHtml } from "@src/ghostweb.js";

addEventListener("load", () =>
    fetch("http://ghostnetroot.com:58080/nodes")
        .then((response) => response.json())
        .then(parseResponse)
        .then(loadNodesHtml)
        .then((url) => includeContentHTML(url)));



includeHTML("header", "navbar.html");
includeHTML("footer", "foot.html");
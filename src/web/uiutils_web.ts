import { includeContentHTML, includeHTML, parseResponse, loadNodesHtml } from "./ghostweb.js";

includeHTML("header", "navbar.html");
includeHTML("footer", "foot.html");

addEventListener("load", () =>
    fetch("http://ghostnetroot.com:58080/nodes")
        .then((response) => response.json())
        .then(parseResponse)
        .then(loadNodesHtml)
        .then((url) => includeContentHTML(url)));

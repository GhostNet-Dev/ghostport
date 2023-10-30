import "module-alias/register"
import { factory, includeContentHTML, includeHTML, parseResponse, loadNodesHtml } from "@src/app/ghostapp.js";
import * as config from "@src/models/config.js";

includeHTML("header", "navbar.html");
includeHTML("footer", "foot.html");

addEventListener("load", () =>
    fetch(config.RootAddress)
        .then((response) => response.json())
        .then(parseResponse)
        .then(loadNodesHtml)
        .then((url) => includeContentHTML(url))
        .then(() => factory.OpenTerminal()));

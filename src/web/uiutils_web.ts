import { includeContentHTML, includeHTML, parseResponse, loadNodesHtml } from "./ghostweb.js";
import * as config from "../models/config.js";

includeHTML("header", "navbar.html");
includeHTML("footer", "foot.html");

addEventListener("load", () =>
    fetch(config.RootAddress)
        .then((response) => response.json())
        .then(parseResponse)
        .then(loadNodesHtml)
        .then((url) => includeContentHTML(url)));

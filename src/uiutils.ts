import "module-alias/register"
import { includeContentHTML, includeHTML, parseResponse, loadNodesHtml } from "@src/ghostweb.js";

addEventListener("load", () =>
    fetch("http://ghostnetroot.com:58080/nodes")
        .then((response) => response.json())
        .then(parseResponse)
        .then(loadNodesHtml)
        .then((url) => includeContentHTML(url))
        .then(() => {
            const navbar = document.querySelector("navbar");
            const navbarHeight = navbar?.getBoundingClientRect().height || 40;
            addEventListener("scroll", () => {
                if (window.scrollY > navbarHeight) {
                    navbar?.classList.remove("navbar-dark");
                    navbar?.classList.remove("bg-dark");
                    navbar?.classList.add("navbar-transition");
                } else {
                    navbar?.classList.remove("navbar-transition");
                    navbar?.classList.add("navbar-dark");
                    navbar?.classList.add("bg-dark");
                }
            })
        }));



includeHTML("header", "navbar.html");
includeHTML("footer", "foot.html");
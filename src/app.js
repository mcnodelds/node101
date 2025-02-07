import express from "express";
import { Eta } from "eta";
import { hello } from "./world.js";
import path from "path";

const port = process.env.MCNODADS_PORT || 3000;

const app = express();

const eta = new Eta({
    views: path.join(import.meta.dirname, "views"),
});

app.engine("eta", (path, opts, callback) => {
    try {
        const content = eta.readFile(path);
        const rendered = eta.renderString(content, opts);
        callback(null, rendered);
    } catch (error) {
        callback(error);
    }
});

app.set("view engine", "eta");
app.set("views", path.join(import.meta.dirname, "views"));

/**
 * @typedef {{
 *     name: string,
 *     role: string,
 *     gh: string,
 *     description: string
 * }} Developer
 */

app.get("/about", (_req, res) => {
    res.render("pages/about", {
        /** @type {[Developer]} */
        devteam: [
            {
                name: "Vladyslav Nosylevskyi",
                role: "",
                gh: "wvlab",
                description: "",
            },
            // TODO: add all members
        ],
    });
});

app.get("/", (_req, res) => {
    res.render("/index", { hehe: hello() });
});

app.listen(port);

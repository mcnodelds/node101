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

app.use(express.static(path.join(import.meta.dirname, "../public")));

/**
 * @typedef {{
 *     name: string,
 *     role: string,
 *     gh: string,
 *     pfplink?: string,
 *     description: string
 * }} Developer
 */

app.get("/about", (_req, res) => {
    res.render("pages/about", {
        /** @type {Developer[]} */
        devteam: [
            {
                name: "Vladyslav Nosylevskyi",
                role: "dunno",
                gh: "wvlab",
                description: "dunno",
            },
            // TODO: add all members
            {
                name: "Vadym Rybytskyi",
                role: "dunno",
                gh: "dfc5fe",
                description: "dunno",
            },
            {
                name: "Anastasiia Prokopchuk",
                role: "dunno",
                gh: "Pr-Anastasiia",
                description: "dunno",
            },
            {
                name: "Bantik",
                role: "Slave",
                gh: "longvodyneste",
                description:
                    "Люблю добре поїсти та добре поспати. Також люблю взаємність, незалежно від того, про яку взаємність йде мова. Адже взаємність це чудово! Взаємність це прекрасно!! Ось невеличка історія про те, ким же насправді є Бантик. Бантик — незвичайний гуль із дивним почуттям стилю. Серед своїх він вирізняється маленьким, але яскравим рожевим бантом, що стирчить на його лисій, сіруватій голові. Колись він був звичайною людиною, але після перетворення зберіг дивовижну ввічливість і навіть тінь старих манер. Він блукає постапокаліптичними руїнами, допомагаючи тим, хто потребує, та уникаючи конфліктів, якщо може. Його хрипкий голос сповнений тепла, а вицвілий піджак нагадує про минулі часи, коли світ був іншим. Люди ставляться до нього з підозрою, але ті, хто дізнається його ближче, розуміють — під понівеченою шкірою б’ється добре серце",
            },
        ],
    });
});

app.get("/", (_req, res) => {
    res.render("/index", { hehe: hello() });
});

app.listen(port);

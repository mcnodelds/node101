import express from "express";
import { Eta } from "eta";
import path from "path";

const port = process.env.PORT || 3000;
const app = express();
const eta = new Eta({ views: path.join(import.meta.dirname, "views") });

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

app.get("/index", (_req, res) => {
    res.render("pages/index", { deadline: "2025-12-31T23:59:59" });
});

app.get("/index/about", (_req, res) => {
    res.redirect("/about");
});

/**
 * @typedef {{
 *     name: string,
 *     role: string,
 *     gh: string,
 *     pfplink?: string,
 *     description: string
 * }} Developer
 */

app.get("/index", (_req, res) => {
    res.render("pages/index", { deadline: "2025-12-31T23:59:59" });
});

app.get("/index/about", (_req, res) => {
    res.redirect("/about");
});

app.get("/about", (_req, res) => {
    res.render("pages/about", {
        devteam: [
            {
                name: "Vladyslav Nosylevskyi",
                role: "dunno",
                gh: "wvlab",
                description: "dunno",
            },
            {
                name: "Vadym Rybytskyi",
                role: "dunno",
                gh: "dfc5fe",
                description: "dunno",
            },
            {
                name: "Anastasiia Prokopchuk",
                role: "HR & Backend",
                gh: "Pr-Anastasiia",
                description:
                    "-. . / .-- .. .-. ..-- / .-- / ..-.. -.. .. -. --- .-. --- --. .. .--",
            },
            {
                name: "Bantik",
                role: "qa & back",
                gh: "longvodyneste",
                description:
                    "Люблю добре поїсти та добре поспати. Також люблю взаємність, незалежно від того, про яку взаємність йде мова. Адже взаємність це чудово! Взаємність це прекрасно!! Ось невеличка історія про те, ким же насправді є Бантик. Бантик — незвичайний гуль із дивним почуттям стилю. Серед своїх він вирізняється маленьким, але яскравим рожевим бантом, що стирчить на його лисій, сіруватій голові. Колись він був звичайною людиною, але після перетворення зберіг дивовижну ввічливість і навіть тінь старих манер. Він блукає постапокаліптичними руїнами, допомагаючи тим, хто потребує, та уникаючи конфліктів, якщо може. Його хрипкий голос сповнений тепла, а вицвілий піджак нагадує про минулі часи, коли світ був іншим. Люди ставляться до нього з підозрою, але ті, хто дізнається його ближче, розуміють — під понівеченою шкірою б’ється добре серце",
            },
        ],
    });
});

app.get("/", (_req, res) => {
    res.redirect("/index");
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

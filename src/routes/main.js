import { authorize } from "#middleware/auth.js";
import { lookup } from "#utils.js";
import { Router } from "express";

/** @type {Router} */
const router = Router();

router.get(
    "/",
    authorize({ mode: "ignore", check: () => true }),
    (req, res) => {
        const claims = lookup(req, "claims");
        res.render("pages/index", { claims });
    }
);

/**
 * @typedef {{
 *     name: string,
 *     role: string,
 *     gh: string,
 *     pfplink?: string,
 *     description: string
 * }} Developer
 */

router.get("/about", (_req, res) => {
    res.render("pages/about", {
        devteam: [
            {
                name: "Vladyslav Nosylevskyi",
                role: "Lead Backend & DevOps (oops)",
                gh: "wvlab",
                description:
                    "Dans les salles des arts numériques demeure un curieux artisan nommé wvlab, qui œuvre dans les arts anciens des murmures mécaniques et de l'alchimie computationnelle. Son instrument de prédilection est le mystique Elixir, avec lequel il tisse les fils mêmes du silicium et de la logique. Tel un maître artisan d'antan, il façonne son ouvrage aux plus profonds niveaux du métier, parlant directement aux cœurs métalliques des machines. Sa connaissance coule profonde comme un ruisseau de montagne, transformant l'instruction brute en création artistique, tout comme les anciens maîtres transformaient le métal vil en or précieux.",
            },
            {
                name: "Vadym Rybytskyi",
                role: "Deputy for seriousness and corruption, Front End, Back Beninging",
                gh: "dfc5fe",
                description:
                    "If you have any question, you can ask it to me for a 30-hour monologue that won't answer your question, but I'll seem serious as hell. Actually, this explains a lot - almost no one saw me, but everyone heard, sometimes even too much.",
            },
            {
                name: "Anastasiia Prokopchuk",
                role: "HR & Backend",
                gh: "Pr-Anastasiia",
                description:
                    "-. . / .-- .. .-. ..-- / .-- / ..-.. -.. .. -. --- .-. --- --. .. .--",
            },
            {
                name: "Dmytro Statkevych",
                role: "qa & back",
                gh: "longvodyneste",
                description:
                    "Люблю добре поїсти та добре поспати. Також люблю взаємність, незалежно від того, про яку взаємність йде мова. Адже взаємність це чудово! Взаємність це прекрасно!! Ось невеличка історія про те, ким же насправді є Бантик. Бантик — незвичайний гуль із дивним почуттям стилю. Серед своїх він вирізняється маленьким, але яскравим рожевим бантом, що стирчить на його лисій, сіруватій голові. Колись він був звичайною людиною, але після перетворення зберіг дивовижну ввічливість і навіть тінь старих манер. Він блукає постапокаліптичними руїнами, допомагаючи тим, хто потребує, та уникаючи конфліктів, якщо може. Його хрипкий голос сповнений тепла, а вицвілий піджак нагадує про минулі часи, коли світ був іншим. Люди ставляться до нього з підозрою, але ті, хто дізнається його ближче, розуміють — під понівеченою шкірою б’ється добре серце",
            },
        ],
    });
});

router.get("/moralsupport", (_req, res) => {
    res.render("pages/moralsupport");
});

export default router;

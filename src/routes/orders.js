import { Router } from "express";
import { authorize } from "#middleware/auth.js";
import { lookup } from "#utils.js";

/** @type {Router} */
const router = Router();

router.get(
    "/",
    authorize({ mode: "client", check: () => true }),
    (req, res) => {
        const claims = lookup(req, "claims");
        res.render("pages/orders", { claims });
    }
);

router.get(
    "/:id",
    authorize({ mode: "client", check: () => true }),
    (req, res) => {
        const claims = lookup(req, "claims");
        res.render("pages/orders", { claims });
    }
);

export default router;

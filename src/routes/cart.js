import { Router } from "express";
import { authorize } from "#middleware/auth.js";
import { lookup } from "#utils.js";

/** @type {Router} */
const router = Router();

router.get("/", (_req, res) => {
    res.render("pages/cart", {});
});

router.get(
    "/checkout",
    authorize({ mode: "client", check: () => true }),
    (req, res) => {
        const claims = lookup(req, "claims");
        res.render("pages/checkout", { claims });
    }
);

export default router;

import { Router } from "express";

/** @type {Router} */
const router = Router();

router.get("/", (_req, res) => {
    res.render("cart", {});
});

router.get("/checkout", (_req, res) => {
    res.render("checkout", {});
});

export default router;

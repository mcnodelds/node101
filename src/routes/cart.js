import { Router } from "express";

/** @type {Router} */
const router = Router();

router.get("/", (_req, res) => {
    res.render("pages/cart", {});
});

router.get("/checkout", (_req, res) => {
    res.render("pages/checkout", {});
});

export default router;

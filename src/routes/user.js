import { Router } from "express";

/** @type {Router} */
const router = Router();

router.get("/", (_req, res) => {
    res.render("user", {});
});

router.get("/login", (_req, res) => {
    res.render("pages/login", {});
});

router.get("/register", (_req, res) => {
    res.render("pages/register", {});
});

export default router;

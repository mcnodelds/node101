import { Router } from "express";
import { authorize } from "#middleware/auth.js";
import { lookup } from "#utils.js";

/** @type {Router} */
const router = Router();

router.use(authorize({ roleWhitelist: ["admin"] }));

router.get("/", (req, res) => {
    const claims = lookup(req, "claims");
    res.render("pages/admin", { claims });
});

router.get("/menu", (req, res) => {
    const claims = lookup(req, "claims");
    res.render("pages/admin/menu", { claims });
});

router.get("/menu/add", (req, res) => {
    const claims = lookup(req, "claims");
    res.render("pages/admin/addmenuitem", { claims });
});

router.get("/menu/edit/:id", (req, res) => {
    const claims = lookup(req, "claims");
    res.render("pages/admin/editmenuitem", { claims, dishId: req.params.id });
});

router.get("/orders", (req, res) => {
    const claims = lookup(req, "claims");
    res.render("pages/admin/orders", { claims });
});

export default router;

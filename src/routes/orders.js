import { Router } from "express";

/** @type {Router} */
const router = Router();

router.get("/", (_req, res) => {
    res.render("orders", {});
});

router.get("/:id", (req, res) => {
    res.send(req.params.id);
});

export default router;

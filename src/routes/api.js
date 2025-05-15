import express from "express";
import authRouter from "#routes/api/auth.js";
import menuRouter from "#routes/api/menu.js";

/** @type {express.Router} */
const router = express.Router();

router.use(express.json());

router.use("/auth", authRouter);
router.use("/menu", menuRouter);

router.get("/", (_req, res) => {
    res.json({ message: "Welcome to the API" });
});

router.use((_req, res) => {
    res.status(404).send();
});

export default router;

import express from "express";
import authRouter from "./api/auth.js";

/** @type {express.Router} */
const router = express.Router();

router.use(express.json());

router.use("/auth", authRouter);

router.get("/", (req, res) => {
    res.json({ message: "Welcome to the API" });
});

export default router;

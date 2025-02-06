import express from "express";
import { hello } from "./world.js";
const app = express();
const port = process.env.MCNODADS_PORT || 3000;

app.get("/", (req, res) => {
    res.send(hello());
});

app.listen(port);

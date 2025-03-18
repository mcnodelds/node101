import express from "express";
import { Eta } from "eta";
import path from "path";
import { cartRoutes, mainRoutes, orderRoutes, userRoutes } from "./routes.js";

const port = process.env.PORT || 3000;
const app = express();
const eta = new Eta({ views: path.join(import.meta.dirname, "views") });

app.engine("eta", (path, opts, callback) => {
    try {
        const content = eta.readFile(path);
        const rendered = eta.renderString(content, opts);
        callback(null, rendered);
    } catch (error) {
        callback(error);
    }
});

app.set("trust proxy", true)
app.set("view engine", "eta");
app.set("views", path.join(import.meta.dirname, "views"));
app.use(express.static(path.join(import.meta.dirname, "../public")));
app.use("/", mainRoutes);
app.use("/user", userRoutes);
app.use("/orders", orderRoutes);
app.use("/cart", cartRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

import express from "express";
import { z } from "zod";
import { tryCatch, asyncHandler } from "#utils.js";
import { validate } from "#middleware/validate.js";
import { authorize } from "#middleware/auth.js";
import repo from "#repo.js";

/** @type {express.Router} */
const router = express.Router();

router.get(
    "/",
    asyncHandler(async (req, res) => {
        const { result: menu, error } = await tryCatch(repo.getMenu);

        if (error != null) {
            console.error("Menu error:", error);
            res.status(500).json({
                message: "Something went wrong",
            });
            return;
        }

        res.status(200).json(menu);
        return;
    })
);

const createItemSchema = z.object({
    name: z.string(),
    portion: z.number(),
    price: z.number(),
    description: z.string(),
    imageurl: z.string().url(),
});

router.post(
    "/item",
    validate(createItemSchema),
    authorize({ roleWhitelist: ["admin"] }),
    asyncHandler(async (req, res) => {
        const { name, portion, price, description, imageurl } = req.body;
        const { result: dish, error } = await tryCatch(() =>
            repo.createMenuItem(name, portion, price, description, imageurl)
        );

        if (error != null) {
            console.error("Create dish error:", error);
            res.status(500).json({
                message: "Something went wrong",
            });
            return;
        }

        res.status(200).json(dish);
        return;
    })
);

router.get(
    "/item/:id",
    asyncHandler(async (req, res) => {
        const id = Number(req.params.id);
        if (Number.isNaN(id) || !Number.isInteger(id)) {
            res.status(400).json({
                message: "Id should be an int.",
            });
            return;
        }

        const { result: dish, error } = await tryCatch(() =>
            repo.findMenuItemById(id)
        );

        if (error != null) {
            console.error("Update dish error:", error);
            res.status(500).json({
                message: "Something went wrong",
            });
            return;
        }

        if (dish == null) {
            res.status(400).json({
                message: "Dish not found by Id.",
            });
            return;
        }

        res.status(200).json(dish);
        return;
    })
);

router.put(
    "/item/:id",
    validate(createItemSchema),
    authorize({ roleWhitelist: ["admin"] }),
    asyncHandler(async (req, res) => {
        const id = Number(req.params.id);
        if (Number.isNaN(id) || !Number.isInteger(id)) {
            res.status(400).json({
                message: "Id should be an int.",
            });
            return;
        }

        const { name, portion, price, description, imageurl } = req.body;
        const { result: dish, error } = await tryCatch(() =>
            repo.updateMenuItemById(
                id,
                name,
                portion,
                price,
                description,
                imageurl
            )
        );

        if (error != null) {
            console.error("Update dish error:", error);
            res.status(500).json({
                message: "Something went wrong",
            });
            return;
        }

        if (dish == null) {
            res.status(400).json({
                message: "Dish not found by Id.",
            });
            return;
        }

        res.status(200).json(dish);
        return;
    })
);

router.delete(
    "/item/:id",
    authorize({ roleWhitelist: ["admin"] }),
    asyncHandler(async (req, res) => {
        const id = Number(req.params.id);
        if (Number.isNaN(id) || !Number.isInteger(id)) {
            res.status(400).json({
                message: "Id should be an int.",
            });
            return;
        }

        const { error } = await tryCatch(() => repo.deleteMenuItemById(id));
        if (error != null) {
            console.error("Delete dish error:", error);
            res.status(500).json({
                message: "Something went wrong",
            });
            return;
        }

        res.status(200).json({ message: "successful" });
        return;
    })
);

export default router;

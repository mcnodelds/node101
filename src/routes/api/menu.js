import express from "express";
import { z } from "zod";
import { tryCatch, asyncHandler } from "#utils.js";
import { validate } from "#middleware/validate.js";
import { authorize } from "#middleware/auth.js";
import { schema as dishSchema } from "#models/dish.js";
import repo from "#repo.js";

/** @type {express.Router} */
const router = express.Router();

router.get(
    "/",
    asyncHandler(async (_req, res) => {
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

const createItemSchema = dishSchema.omit({ id: true });

router.post(
    "/item",
    validate(createItemSchema),
    authorize({ roleWhitelist: ["admin"] }),
    asyncHandler(async (req, res) => {
        /** @type {import("zod").infer<typeof createItemSchema>} */
        const item = req.body;

        const { result: existingDish } = await tryCatch(() =>
            repo.findMenuItemByName(item.name)
        );
        if (existingDish) {
            res.status(400).json({
                message: "Menu item with this name already exists.",
            });
            return;
        }

        const { result: dish, error } = await tryCatch(() =>
            repo.createMenuItem(
                item.name,
                item.portion,
                item.price,
                item.description,
                item.imageurl,
            )
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

        /** @type {import("zod").infer<typeof createItemSchema>} */
        const item = req.body;
        const { result: dish, error } = await tryCatch(() =>
            repo.updateMenuItemById(
                id,
                item.name,
                item.portion,
                item.price,
                item.description,
                item.imageurl
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

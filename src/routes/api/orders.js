import express from "express";
import { z } from "zod";
import { tryCatch, asyncHandler, lookup } from "#utils.js";
import { validate } from "#middleware/validate.js";
import { authorize } from "#middleware/auth.js";
import repo from "#repo.js";
import { statusSchema } from "#models/order.js";

/** @type {express.Router} */
const router = express.Router();

const createOrderSchema = z.object({
    userId: z.number().int({ message: "User ID must be an integer." }),
    items: z.record(
        z.number().int().min(1, { message: "Quantity must be at least 1." })
    ),
    name: z.string().min(1, { message: "Name is required." }),
    address: z.string().min(1, { message: "Address is required." }),
    phone: z
        .string()
        .regex(/^\+?\d{10,15}$/, { message: "Invalid phone number." }),
});

router.get(
    "/",
    authorize({ roleWhitelist: ["admin"] }),
    asyncHandler(async (_req, res) => {
        const orders = await repo.getAllOrders();
        res.status(200).json(orders);
    })
);

router.post(
    "/",
    validate(createOrderSchema),
    authorize({ roleWhitelist: ["user", "admin"] }),
    asyncHandler(async (req, res) => {
        /** @type {z.infer<typeof createOrderSchema>} */
        const { userId, items, name, address, phone } = req.body;
        const claims = lookup(req, "claims");

        if (claims?.role !== "admin" && claims?.id !== userId) {
            return res
                .status(403)
                .json({ message: "Cannot create order for another user" });
        }

        const { result: order, error } = await tryCatch(() =>
            repo.createOrder(userId, items, name, address, phone)
        );
        if (error != null) {
            console.error("Create order error:", error);
            return res.status(500).json({ message: "Something went wrong" });
        }

        res.status(201).json(order);
    })
);

router.get(
    "/:id",
    authorize({ roleWhitelist: ["user", "admin"] }),
    asyncHandler(async (req, res) => {
        const id = Number(req.params.id);
        if (Number.isNaN(id) || !Number.isInteger(id)) {
            return res.status(400).json({ message: "ID must be an integer" });
        }

        const { result: order, error } = await tryCatch(() =>
            repo.findOrderById(id)
        );
        if (error != null) {
            console.error("Find order error:", error);
            return res.status(500).json({ message: "Something went wrong" });
        }

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const claims = lookup(req, "claims");

        if (claims?.role !== "admin" && claims?.id !== order.userId) {
            return res
                .status(403)
                .json({ message: "Cannot view another user's order" });
        }

        res.status(200).json(order);
    })
);

router.get(
    "/user/:userId",
    authorize({ roleWhitelist: ["user", "admin"] }),
    asyncHandler(async (req, res) => {
        const userId = Number(req.params.userId);
        if (Number.isNaN(userId) || !Number.isInteger(userId)) {
            return res
                .status(400)
                .json({ message: "User ID must be an integer" });
        }

        const claims = lookup(req, "claims");

        if (claims?.role !== "admin" && claims?.id !== userId) {
            return res
                .status(403)
                .json({ message: "Cannot view another user's orders" });
        }

        const { result: orders, error } = await tryCatch(() =>
            repo.findOrdersByUserId(userId)
        );
        if (error != null) {
            console.error("Find orders error:", error);
            return res.status(500).json({ message: "Something went wrong" });
        }

        res.status(200).json(orders);
    })
);

const updateOrderSchema = z.object({
    status: statusSchema,
});

router.put(
    "/:id",
    validate(updateOrderSchema),
    authorize({ roleWhitelist: ["admin"] }),
    asyncHandler(async (req, res) => {
        /** @type {z.infer<typeof updateOrderSchema>} */
        const { status } = req.body;

        const id = Number(req.params.id);
        if (Number.isNaN(id) || !Number.isInteger(id)) {
            return res.status(400).json({ message: "ID must be an integer" });
        }

        const { result: order, error } = await tryCatch(async () => {
            const existingOrder = await repo.findOrderById(id);
            if (!existingOrder) return null;
            return repo.updateOrderStatusById(id, status);
        });
        if (error != null) {
            console.error("Update order error:", error);
            return res.status(500).json({ message: "Something went wrong" });
        }

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    })
);

export default router;

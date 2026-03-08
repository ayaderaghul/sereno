import express from "express";
import { createEntry,getEntries,deleteEntry } from "../controllers/entry.controller.js";
import {authMiddleware} from "../middlewares/auth.middleware.js"
const router = express.Router();

router.post("/",authMiddleware, createEntry);
router.get("/", authMiddleware, getEntries)
router.delete("/:id", authMiddleware, deleteEntry)

export default router;

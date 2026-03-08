import express from "express";
import { getSuggestion } from "../controllers/ai.controller.js";
import {authMiddleware} from "../middlewares/auth.middleware.js"
const router = express.Router();

router.post("/",authMiddleware, getSuggestion);


export default router;

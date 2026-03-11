import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { searchUsersController } from "../controllers/searchController.js";

const router = express.Router();

// GET /api/search/users?q=<query>
router.get("/users", verifyToken, searchUsersController);

export default router;

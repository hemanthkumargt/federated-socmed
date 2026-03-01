import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { searchUsers } from "../controllers/searchController.js";

const router = express.Router();

// GET /api/search/users?q=<query>&limit=<n>
// Auth required so we can resolve follow‑status for the requesting user (Story 6)
router.get("/users", verifyToken, searchUsers);

export default router;

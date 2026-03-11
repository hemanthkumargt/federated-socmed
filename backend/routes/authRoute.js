import express from "express"
import { loginUser, registerUser, unlockAccount, setupPresentationData } from "../controllers/authController.js";

const router = express.Router()


router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/unlock", unlockAccount);
router.get("/setup", setupPresentationData);


export default router
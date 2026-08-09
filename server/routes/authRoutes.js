import express from "express";
import { signup, login, getMe, logout } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
// Alias for /signup — some clients/specs expect POST /api/auth/register.
// Both routes hit the exact same controller, so there's only one
// registration code path (no duplicate auth system).
router.post("/register", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout", logout);

export default router;

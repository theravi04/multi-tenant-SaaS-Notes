import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createNote, getNotes, getNoteById, updateNote, deleteNote } from "../controllers/noteController.js";

const router = express.Router();

router.post("/", protect, createNote);
router.get("/", protect, getNotes);
router.get("/:id", protect, getNoteById);
router.put("/:id", protect, updateNote);
router.delete("/:id", protect, deleteNote);

export default router;

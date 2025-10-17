import express from "express";
import {
  createScore,
  getUserScores,
  getRanking,
} from "../controllers/score.controller.js";

const router = express.Router();

// 📌 Crear puntaje
router.post("/", createScore);

// 📜 Obtener historial de un usuario
router.get("/user/:id", getUserScores);

// 🏆 Obtener ranking general por juego
router.get("/ranking", getRanking);

export default router;

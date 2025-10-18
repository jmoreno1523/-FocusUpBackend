// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db/mongo.js";

// 🔗 Importar rutas
import authRoutes from "./routes/auth.routes.js";
import scoreRoutes from "./routes/score.routes.js"; // rutas de puntajes

dotenv.config();
const app = express();

// 🌐 Configuración CORS (versión definitiva)
app.use(
  cors()//
);

// ✅ Maneja las solicitudes preflight (para peticiones POST con headers)
app.options("*", cors());

// 🧠 Middleware para JSON
app.use(express.json());

// 🧾 Middleware de logs de peticiones (para depuración)
app.use((req, res, next) => {
  console.log(`➡️ [${req.method}] ${req.url}`);
  next();
});

// 📦 Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/scores", scoreRoutes);

// 🩺 Ruta de prueba
app.get("/health", (req, res) => {
  res.json({ ok: true, msg: "Servidor funcionando correctamente" });
});

// 🚀 Conectar DB y levantar servidor
const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("✅ Conectado a MongoDB Atlas");
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    console.log(`📡 Esperando peticiones desde el frontend...`);
    console.log("🌐 CORS habilitado para http://localhost:5173 y http://localhost:5174");
  });
});

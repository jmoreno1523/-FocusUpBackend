import Score from "../models/Score.js";
import FocusUser from "../models/FocusUser.js"; // ✅ para verificar existencia del usuario

// 📌 Crear puntaje
export const createScore = async (req, res) => {
  try {
    const { userId, guestId, game, score, timeMs } = req.body;

    if (!game || score == null || timeMs == null) {
      return res.status(400).json({ ok: false, msg: "Datos incompletos" });
    }

    // Si es un usuario registrado, verificamos el userId
    if (userId) {
      const userExists = await FocusUser.findById(userId);
      if (!userExists) {
        return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
      }
    }

    // Si no es un usuario registrado, aseguramos que haya un guestId
    if (!userId && !guestId) {
      return res.status(400).json({ ok: false, msg: "Se requiere userId o guestId" });
    }

    const newScore = new Score({ userId, guestId, game, score, timeMs });
    await newScore.save();

    res.status(201).json({
      ok: true,
      msg: "Puntaje registrado correctamente",
      data: newScore,
    });
  } catch (error) {
    console.error("❌ Error al crear puntaje:", error);
    res.status(500).json({ ok: false, msg: "Error interno del servidor" });
  }
};

// 📌 Obtener historial de un usuario
export const getUserScores = async (req, res) => {
  try {
    const { id } = req.params;
    const scores = await Score.find({ userId: id }).sort({ createdAt: -1 });
    res.json({ ok: true, data: scores });
  } catch (error) {
    console.error("❌ Error al obtener puntajes:", error);
    res.status(500).json({ ok: false, msg: "Error interno del servidor" });
  }
};

// 🏆 Obtener ranking general por juego (TOP 10)
export const getRanking = async (req, res) => {
  try {
    const { game } = req.query;

    if (!game) {
      return res
        .status(400)
        .json({ ok: false, msg: "Debes enviar el parámetro ?game=reaction|focus|cups" });
    }

    // 🔁 En 'reaction', menor tiempo es mejor; en los demás, mayor puntaje es mejor
    const sortBy = game === "reaction" ? { score: 1 } : { score: -1 };

    const topScores = await Score.find({ game })
      .sort(sortBy)
      .limit(10)
      .populate("userId", "name email");

    res.json({ ok: true, data: topScores });
  } catch (error) {
    console.error("❌ Error al obtener ranking:", error);
    res.status(500).json({ ok: false, msg: "Error interno del servidor" });
  }
};

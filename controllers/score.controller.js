import Score from "../models/Score.js";
import FocusUser from "../models/FocusUser.js"; // ✅ para verificar existencia del usuario

// 📌 Crear puntaje
// 📌 Crear puntaje - CON SOPORTE PARA MODO INVITADO EXCLUSIVO
export const createScore = async (req, res) => {
  try {
    const { userId, guestId, game, score, timeMs, playerName } = req.body;

    // Validaciones básicas
    if (!game || score == null || timeMs == null) {
      return res.status(400).json({ ok: false, msg: "Datos incompletos" });
    }

    // ✅ PARA JUEGO MEMORY EN MODO INVITADO: No requiere userId
    if (game === "memory" && !userId) {
      // Para memoria en modo invitado, guestId es opcional pero playerName es requerido
      if (!playerName) {
        return res.status(400).json({ ok: false, msg: "Nombre de jugador requerido para modo invitado" });
      }

      // Generar un guestId único si no se proporciona
      const finalGuestId = guestId || `memory_guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newScore = new Score({ 
        userId: null, // Explicitamente null para invitados
        guestId: finalGuestId,
        game,
        score: timeMs, // Para memoria, el score es el tiempo en ms
        timeMs,
        playerName: playerName.trim()
      });

      await newScore.save();

      return res.status(201).json({
        ok: true,
        msg: "Puntaje de memoria guardado correctamente",
        data: newScore,
      });
    }

    // ✅ PARA USUARIOS REGISTRADOS (otros juegos)
    if (userId) {
      const userExists = await FocusUser.findById(userId);
      if (!userExists) {
        return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
      }

      const newScore = new Score({ 
        userId, 
        guestId: null,
        game, 
        score, 
        timeMs,
        playerName: userExists.name // Usar nombre del usuario registrado
      });

      await newScore.save();

      return res.status(201).json({
        ok: true,
        msg: "Puntaje registrado correctamente",
        data: newScore,
      });
    }

    // ❌ Si no es memoria y no tiene userId, error
    return res.status(400).json({ ok: false, msg: "Se requiere userId para este juego" });

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

// 🏆 Obtener ranking general por juego (TOP 10) - VERSIÓN CORREGIDA
export const getRanking = async (req, res) => {
  try {
    const { game } = req.query;

    if (!game) {
      return res.status(400).json({ 
        ok: false, 
        msg: "Debes enviar el parámetro ?game=reaction|focus|cups|memory" 
      });
    }

    // 🎴 LÓGICA ESPECIAL PARA JUEGO DE MEMORIA
    if (game === "memory") {
      const memoryRanking = await Score.aggregate([
        { $match: { game: "memory" } },
        {
          $group: {
            _id: {
              playerName: "$playerName",
              guestId: "$guestId",
              userId: "$userId" // 👈 Incluir userId para el populate
            },
            bestTime: { $min: "$timeMs" },
            attempts: { $sum: 1 },
            lastPlayed: { $max: "$createdAt" },
            isGuest: { $first: { $eq: ["$userId", null] } }
          }
        },
        { $sort: { bestTime: 1 } },
        { $limit: 20 }
      ]);

      // Procesar los resultados CON POPULATE
      const processedRanking = await Promise.all(
        memoryRanking.map(async (item, index) => {
          let playerName = item._id.playerName || "Invitado";
          
          // Si tiene userId, buscar el usuario en la base de datos
          if (item._id.userId) {
            const user = await FocusUser.findById(item._id.userId);
            playerName = user ? user.name : "Usuario eliminado";
          }

          return {
            _id: item._id.userId || item._id.guestId || `guest_${index}`,
            rank: index + 1,
            playerName: playerName,
            game: "memory",
            score: item.bestTime,
            timeMs: item.bestTime,
            isGuest: item.isGuest,
            attempts: item.attempts,
            lastPlayed: item.lastPlayed
          };
        })
      );

      return res.json({ ok: true, data: processedRanking });
    }

    // 🎯 LÓGICA PARA OTROS JUEGOS (reaction, focus, cups)
    let sortBy;
    let selectBest;

    if (game === "reaction") {
      sortBy = { bestScore: 1 };
      selectBest = { $min: "$score" };
    } else {
      sortBy = { bestScore: -1 };
      selectBest = { $max: "$score" };
    }

    // Para juegos normales, usar populate de mongoose en lugar de aggregate
    const topScores = await Score.find({ game })
      .sort(game === "reaction" ? { score: 1 } : { score: -1 })
      .limit(10)
      .populate("userId", "name email") // 👈 Hacer populate aquí
      .exec();

    // Procesar resultados para juegos normales
    const processedRanking = topScores.map((item, index) => {
      // Para usuarios registrados, usar el nombre del usuario
      // Para invitados, usar el playerName guardado o "Invitado"
      const playerName = item.userId 
        ? item.userId.name 
        : (item.playerName || "Invitado");

      return {
        _id: item._id,
        rank: index + 1,
        playerName: playerName,
        game: item.game,
        score: item.score,
        timeMs: item.timeMs,
        isGuest: !item.userId,
        userId: item.userId ? {
          _id: item.userId._id,
          name: item.userId.name,
          email: item.userId.email
        } : null
      };
    });

    res.json({ ok: true, data: processedRanking });

  } catch (error) {
    console.error("❌ Error al obtener ranking:", error);
    res.status(500).json({ ok: false, msg: "Error interno del servidor" });
  }
};
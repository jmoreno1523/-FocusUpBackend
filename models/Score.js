import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "FocusUser", // ✅ referencia al modelo correcto
      required: false  // Permitimos que sea opcional, para los usuarios invitados
    },
    guestId: { 
      type: String, // Usamos un String para almacenar el guestId, que podría ser un UUID u otro identificador único
      required: false // Solo se asigna si es un invitado
    },
    game: { 
      type: String, 
      required: true 
    }, // ejemplo: "reaction" o "focus"
    score: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    timeMs: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    suspicious: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

export default mongoose.model("Score", scoreSchema);

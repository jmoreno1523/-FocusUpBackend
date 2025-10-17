import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "FocusUser",
      required: false
    },
    guestId: { 
      type: String,
      required: false
    },
    playerName: { // ✅ ESTE CAMPO ES CRÍTICO
      type: String,
      required: false
    },
    game: { 
      type: String, 
      required: true 
    },
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
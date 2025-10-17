
import mongoose from "mongoose";

const focusUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" }
  },
  { timestamps: true }
);

// 👇 nota: el primer parámetro "FocusUser" es el nombre de la colección
export default mongoose.model("FocusUser", focusUserSchema);

import bcrypt from "bcryptjs";
import FocusUser from "../models/FocusUser.js"; // modelo personalizado

// 📌 Registrar usuario nuevo
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, msg: "Todos los campos son obligatorios" });
    }

    // Verificar si ya existe el correo
    const userExist = await FocusUser.findOne({ email });
    if (userExist) {
      return res.status(400).json({ ok: false, msg: "El correo ya está registrado" });
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = new FocusUser({ name, email, passwordHash });
    await newUser.save();

    // ✅ Enviar el usuario con _id
    res.status(201).json({
      ok: true,
      msg: "Usuario registrado correctamente",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("❌ Error en register:", error);
    res.status(500).json({ ok: false, msg: "Error interno del servidor" });
  }
};

// 📌 Iniciar sesión
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, msg: "Correo y contraseña requeridos" });
    }

    const user = await FocusUser.findOne({ email });
    if (!user) {
      return res.status(400).json({ ok: false, msg: "Usuario no encontrado" });
    }

    // Validar contraseña
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ ok: false, msg: "Contraseña incorrecta" });
    }

    // ✅ Devolver usuario con _id
    res.json({
      ok: true,
      msg: "Inicio de sesión exitoso",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ ok: false, msg: "Error interno del servidor" });
  }
};

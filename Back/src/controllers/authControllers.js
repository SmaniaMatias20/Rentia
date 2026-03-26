const { pool } = require("../dbs/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 🔐 REGISTER
async function register(req, res) {
    try {
        const { username, password } = req.body;

        // Validación
        if (!username || !password) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        // Hashear password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar usuario
        const result = await pool.query(
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
            [username, hashedPassword]
        );

        res.status(201).json({
            message: "Usuario creado",
            user: result.rows[0],
        });

    } catch (error) {
        // Usuario duplicado
        if (error.code === "23505") {
            return res.status(400).json({ error: "El usuario ya existe" });
        }

        res.status(500).json({ error: error.message });
    }
}

// 🔑 LOGIN
async function login(req, res) {
    try {
        const { username, password } = req.body;

        // 1️⃣ Buscar usuario
        const result = await pool.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Usuario no existe" });
        }

        const user = result.rows[0];

        // 2️⃣ Validar password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: "Password incorrecto" });
        }

        // 3️⃣ Crear token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1h" }
        );

        // 4️⃣ Respuesta (IMPORTANTE)
        res.json({
            message: "Login exitoso",
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// 🚪 LOGOUT
async function logout(req, res) {
    res.json({ message: "Logout exitoso (el frontend elimina el token)" });
}

module.exports = {
    login,
    register,
    logout,
};
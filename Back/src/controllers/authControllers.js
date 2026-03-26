const { pool } = require("../dbs/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        // Validación
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Faltan datos" });
        }

        // Hashear password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar usuario con role por defecto (owner)
        const result = await pool.query(
            `INSERT INTO users (username, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role`,
            [
                username.toLowerCase(),
                email.toLowerCase(),
                hashedPassword,
                'owner' // 👈 explícito como pediste
            ]
        );

        res.status(201).json({
            message: "Usuario creado",
            user: result.rows[0],
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(400).json({ error: "Usuario o email ya existe" });
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
const { pool } = require("../dbs/db.js");

// ==========================
// 🧑‍💼 TENANTS
// ==========================

// Obtener todos los tenants
async function getAll(req, res) {
    try {
        const result = await pool.query(
            `SELECT * FROM users WHERE role = 'tenant' ORDER BY created_at DESC`
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener tenants" });
    }
}

// Obtener tenants por usuario
async function getByUser(req, res) {
    const { userId } = req.params;
    const { filter } = req.query;

    try {
        let query = `
      SELECT * FROM users
      WHERE owner_id = $1 AND role = 'tenant'
    `;

        if (filter === "active") query += ` AND is_enabled = true`;
        if (filter === "inactive") query += ` AND is_enabled = false`;

        query += ` ORDER BY created_at DESC`;

        const result = await pool.query(query, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener tenants" });
    }
}

// Obtener un tenant
async function getById(req, res) {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM users WHERE id = $1`,
            [id]
        );

        res.json(result.rows[0] || null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener tenant" });
    }
}

// Crear tenant
async function create(req, res) {
    const { username, email, phone, role, owner_id } = req.body;

    try {
        // Validar username único
        const existing = await pool.query(
            `SELECT id FROM users WHERE username = $1 LIMIT 1`,
            [username.toLowerCase().trim()]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({
                message: "El nombre de usuario ya está en uso",
            });
        }

        const result = await pool.query(
            `INSERT INTO users
      (username, email, phone, role, owner_id)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *`,
            [
                username.toLowerCase().trim(),
                email.toLowerCase().trim(),
                phone,
                role,
                owner_id,
            ]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear tenant" });
    }
}

// Actualizar tenant
async function update(req, res) {
    const { id } = req.params;
    const data = req.body;

    try {
        const fields = [];
        const values = [];
        let index = 1;

        // Construcción dinámica del UPDATE
        for (let key in data) {
            fields.push(`${key} = $${index}`);
            values.push(data[key]);
            index++;
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: "No hay datos para actualizar" });
        }

        values.push(id);

        const query = `
      UPDATE users SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING *
    `;

        const result = await pool.query(query, values);

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar tenant" });
    }
}

// Eliminar tenant
async function remove(req, res) {
    const { id } = req.params;

    try {
        // limpiar propiedades
        await pool.query(
            `UPDATE properties SET tenant_id = NULL WHERE tenant_id = $1`,
            [id]
        );

        // eliminar comentarios
        await pool.query(
            `DELETE FROM comments WHERE tenant_id = $1`,
            [id]
        );

        // eliminar usuario
        await pool.query(
            `DELETE FROM users WHERE id = $1`,
            [id]
        );

        res.json({ message: "Tenant eliminado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar tenant" });
    }
}

// Activar / desactivar tenant
async function toggle(req, res) {
    const { id } = req.params;
    const { is_enabled } = req.body;

    try {
        await pool.query(
            `UPDATE users SET is_enabled = $1 WHERE id = $2`,
            [is_enabled, id]
        );

        res.json({ message: "Estado actualizado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar estado" });
    }
}


// ==========================
// 💬 COMMENTS
// ==========================

// Todos los comentarios
async function getAllComments(req, res) {
    try {
        const result = await pool.query(
            `SELECT * FROM comments ORDER BY created_at DESC`
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener comentarios" });
    }
}

// Comentarios por tenant
async function getCommentsByTenant(req, res) {
    const { tenantId } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM comments WHERE tenant_id = $1 ORDER BY created_at DESC`,
            [tenantId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener comentarios" });
    }
}

// Crear comentario
async function createComment(req, res) {
    const { tenant_id, owner_id, content } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO comments (tenant_id, owner_id, content)
       VALUES ($1,$2,$3)
       RETURNING *`,
            [tenant_id, owner_id, content]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear comentario" });
    }
}

// Eliminar comentario
async function deleteComment(req, res) {
    const { id } = req.params;

    try {
        await pool.query(
            `DELETE FROM comments WHERE id = $1`,
            [id]
        );

        res.json({ message: "Comentario eliminado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar comentario" });
    }
}

// Mostrar / ocultar comentario
async function toggleComment(req, res) {
    const { id } = req.params;

    try {
        const current = await pool.query(
            `SELECT show FROM comments WHERE id = $1`,
            [id]
        );

        const newValue = !current.rows[0].show;

        await pool.query(
            `UPDATE comments SET show = $1 WHERE id = $2`,
            [newValue, id]
        );

        res.json({ message: "Comentario actualizado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar comentario" });
    }
}


// ==========================
// EXPORTS
// ==========================

module.exports = {
    getAll,
    getByUser,
    getById,
    create,
    update,
    remove,
    toggle,

    // comments
    getAllComments,
    getCommentsByTenant,
    createComment,
    deleteComment,
    toggleComment,
};
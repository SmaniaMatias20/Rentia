const { pool } = require("../dbs/db.js");


async function getAll(req, res) {
    try {
        const result = await pool.query(`
      SELECT p.*, u.username
      FROM properties p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.name
    `);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener propiedades" });
    }
}


async function createProperty(req, res) {
    try {
        const { user_id, name, address } = req.body;

        const result = await pool.query(
            `INSERT INTO properties (user_id, name, address)
       VALUES ($1, $2, $3) RETURNING *`,
            [user_id, name.toLowerCase(), address]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear propiedad" });
    }
}

async function getByUser(req, res) {
    try {
        const { userId } = req.params;
        const { filter } = req.query;

        let query = `
      SELECT * FROM properties
      WHERE user_id = $1
    `;

        if (filter === "active") query += " AND is_enabled = true";
        if (filter === "inactive") query += " AND is_enabled = false";

        const result = await pool.query(query, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener propiedades" });
    }
}

async function getWithoutTenant(req, res) {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            `SELECT * FROM properties
       WHERE user_id = $1 AND tenant_id IS NULL`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener propiedades" });
    }
}

async function deleteProperty(req, res) {
    try {
        const { id } = req.params;

        await pool.query(`DELETE FROM contracts WHERE property_id = $1`, [id]);
        await pool.query(`DELETE FROM properties WHERE id = $1`, [id]);

        res.json({ message: "Propiedad eliminada" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar propiedad" });
    }
}

async function toggleProperty(req, res) {
    try {
        const { id } = req.params;
        const { is_enabled } = req.body;

        await pool.query(
            `UPDATE properties SET is_enabled = $1 WHERE id = $2`,
            [is_enabled, id]
        );

        res.json({ message: "Estado actualizado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar propiedad" });
    }
}

async function getProperty(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT * FROM properties WHERE id = $1`,
            [id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener propiedad" });
    }
}

async function updateProperty(req, res) {
    try {
        const { id } = req.params;
        const data = req.body;

        if (data.name) data.name = data.name.toLowerCase();

        await pool.query(
            `UPDATE properties
       SET name = $1, address = $2
       WHERE id = $3`,
            [data.name, data.address, id]
        );

        res.json({ message: "Propiedad actualizada" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar propiedad" });
    }
}

module.exports = {
    getAll,
    createProperty,
    getByUser,
    getWithoutTenant,
    deleteProperty,
    toggleProperty,
    getProperty,
    updateProperty,
};
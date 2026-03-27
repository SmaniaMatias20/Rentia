const { pool } = require("../dbs/db.js");

async function getAll(req, res) {
    try {
        const { data: contracts, error } = await pool.query(
            `SELECT * FROM contracts ORDER BY created_at DESC`
        );

        if (error) return res.status(500).json(error);

        res.json(contracts.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function createContract(req, res) {
    try {
        const contract = req.body;

        // 1️⃣ Check conflictos
        const conflicts = await pool.query(
            `SELECT id FROM contracts
       WHERE property_id = $1
       AND (
         (valid_from <= $2 AND valid_to >= $3)
         OR (valid_from <= $2 AND valid_to IS NULL)
       )`,
            [contract.property_id, contract.valid_to, contract.valid_from]
        );

        if (conflicts.rows.length > 0) {
            return res.status(400).json({
                error: "Ya existe un contrato en ese rango de fechas",
            });
        }

        // 2️⃣ Insert
        const result = await pool.query(
            `INSERT INTO contracts (
        property_id, tenant_id, rent_amount, currency,
        increase_percentage, increase_frequency,
        valid_from, valid_to, owner_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
            [
                contract.property_id,
                contract.tenant_id,
                contract.rent_amount,
                contract.currency,
                contract.increase_percentage,
                contract.increase_frequency,
                contract.valid_from,
                contract.valid_to,
                contract.owner_id,
            ]
        );

        res.json(result.rows[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getByUser(req, res) {
    try {
        const { userId } = req.params;
        const { filter } = req.query;

        let query = `
            SELECT 
                c.*,
                u.username AS tenant_name,
                p.name AS property_name
            FROM contracts c
            JOIN users u ON u.id = c.tenant_id
            JOIN properties p ON p.id = c.property_id
            WHERE c.owner_id = $1
        `;

        const params = [userId];

        if (filter === 'active') query += ` AND c.status = true`;
        if (filter === 'inactive') query += ` AND c.status = false`;

        const contracts = await pool.query(query, params);

        res.json(contracts.rows);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteContract(req, res) {
    try {
        const { id } = req.params;

        await pool.query(`DELETE FROM contracts WHERE id = $1`, [id]);

        res.json({ message: "Contrato eliminado" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await pool.query(
            `UPDATE contracts SET status = $1 WHERE id = $2`,
            [status, id]
        );

        res.json({ message: "Estado actualizado" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


module.exports = {
    getAll,
    createContract,
    getByUser,
    deleteContract,
    updateStatus,
};
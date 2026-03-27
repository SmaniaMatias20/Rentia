const { pool } = require("../dbs/db.js");

// 🧾 GET ALL PAYMENTS
async function getAllPayments(req, res) {
    try {
        const result = await pool.query(
            `SELECT * FROM payments ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener pagos" });
    }
}

// 💳 GET ALL TRANSACTIONS
async function getAllTransactions(req, res) {
    try {
        const result = await pool.query(
            `SELECT * FROM payment_transactions ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener transacciones" });
    }
}

// 🔎 GET TRANSACTIONS BY PAYMENT ID
async function getTransactionsByPaymentId(req, res) {
    const { paymentId } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM payment_transactions WHERE payment_id = $1`,
            [paymentId]
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener detalles" });
    }
}

// ❌ DELETE TRANSACTION
async function deleteTransaction(req, res) {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const deleteResult = await client.query(
            `DELETE FROM payment_transactions
       WHERE id = $1
       RETURNING *`,
            [id]
        );

        if (deleteResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "No encontrado" });
        }

        const transaction = deleteResult.rows[0];

        await client.query(
            `UPDATE payments
       SET rent_amount = rent_amount - $1
       WHERE id = $2`,
            [transaction.amount, transaction.payment_id]
        );

        await client.query("COMMIT");

        res.json({ message: "Detalle eliminado" });

    } catch (error) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: "Error al eliminar detalle" });
    } finally {
        client.release();
    }
}

// 📄 GET PAYMENTS BY CONTRACT
async function getPaymentsByContract(req, res) {
    const { contractId } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM payments WHERE contract_id = $1`,
            [contractId]
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener pagos" });
    }
}

// ➕ CREATE PAYMENT
async function createPayment(req, res) {
    const payment = req.body;

    try {
        const status =
            payment.water &&
            payment.electricy &&
            payment.gas &&
            payment.hoa_fees &&
            Number(payment.rent_amount) >= Number(payment.total_rent_amount);

        const result = await pool.query(
            `INSERT INTO payments
            (
                contract_id,
                rent_amount,
                total_rent_amount,
                water,
                electricy,
                gas,
                hoa_fees,
                water_amount,
                electricy_amount,
                gas_amount,
                hoa_fees_amount,
                payment_method,
                description,
                status,
                rent_month
            )
            VALUES (
                $1,$2,$3,$4,$5,$6,$7,
                $8,$9,$10,$11,$12,$13,$14,$15
            )
            RETURNING *`,
            [
                payment.contract_id,
                payment.rent_amount,
                payment.total_rent_amount,
                payment.water,
                payment.electricy,
                payment.gas,
                payment.hoa_fees,
                payment.water_amount,
                payment.electricy_amount,
                payment.gas_amount,
                payment.hoa_fees_amount,
                payment.payment_method,
                payment.description,
                status,
                payment.rent_month,
            ]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear pago" });
    }
}

// ✏️ UPDATE PAYMENT
async function updatePayment(req, res) {
    const { id } = req.params;
    const payment = req.body;

    try {
        const status =
            payment.water &&
            payment.electricy &&
            payment.gas &&
            payment.hoa_fees &&
            Number(payment.rent_amount) >= Number(payment.total_rent_amount);

        await pool.query(
            `UPDATE payments SET
                rent_amount = $1,
                total_rent_amount = $2,
                water = $3,
                electricy = $4,
                gas = $5,
                hoa_fees = $6,
                water_amount = $7,
                electricy_amount = $8,
                gas_amount = $9,
                hoa_fees_amount = $10,
                payment_method = $11,
                description = $12,
                status = $13,
                rent_month = $14
            WHERE id = $15`,
            [
                payment.rent_amount,
                payment.total_rent_amount,
                payment.water,
                payment.electricy,
                payment.gas,
                payment.hoa_fees,
                payment.water_amount,
                payment.electricy_amount,
                payment.gas_amount,
                payment.hoa_fees_amount,
                payment.payment_method,
                payment.description,
                status,
                payment.rent_month,
                id,
            ]
        );

        res.json({ message: "Pago actualizado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar pago" });
    }
}

// ➕ CREATE TRANSACTION
async function createTransaction(req, res) {
    const { paymentId, amount, payment_method } = req.body;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            `INSERT INTO payment_transactions (payment_id, amount, payment_method)
       VALUES ($1,$2,$3)`,
            [paymentId, amount, payment_method]
        );

        await client.query(
            `UPDATE payments
       SET rent_amount = rent_amount + $1
       WHERE id = $2`,
            [amount, paymentId]
        );

        await client.query("COMMIT");

        res.json({ message: "Detalle creado" });

    } catch (error) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: "Error al crear detalle" });
    } finally {
        client.release();
    }
}

async function getMonthlyRent(req, res) {
    const { userId, year, month } = req.query;

    try {
        const result = await pool.query(
            `
      SELECT COALESCE(SUM(p.rent_amount),0) as total
      FROM payments p
      JOIN contracts c ON c.id = p.contract_id
      WHERE c.owner_id = $1
      AND c.status = true
      AND DATE_PART('year', p.rent_month::DATE) = $2
      AND DATE_PART('month', p.rent_month::DATE) = $3
      `,
            [userId, year, month]
        );

        res.json(Number(result.rows[0].total));
    } catch {
        res.status(500).json({ error: "Error rent" });
    }
}

async function getMonthlyElectricity(req, res) {
    const { userId, year, month } = req.query;

    try {
        const result = await pool.query(
            `
      SELECT COALESCE(SUM(p.electricy_amount),0) as total
      FROM payments p
      JOIN contracts c ON c.id = p.contract_id
      WHERE c.owner_id = $1
      AND c.status = true
      AND p.electricy = true
      AND DATE_PART('year', p.rent_month::DATE) = $2
      AND DATE_PART('month', p.rent_month::DATE) = $3
      `,
            [userId, year, month]
        );

        res.json(Number(result.rows[0].total));
    } catch {
        res.status(500).json({ error: "Error electricity" });
    }
}

async function getMonthlyCount(req, res) {
    const { userId, year, month } = req.query;

    try {
        const result = await pool.query(
            `
      SELECT COUNT(p.id) as total
      FROM payments p
      JOIN contracts c ON c.id = p.contract_id
      WHERE c.owner_id = $1
      AND c.status = true
      AND DATE_PART('year', p.rent_month::DATE) = $2
      AND DATE_PART('month', p.rent_month::DATE) = $3
      `,
            [userId, year, month]
        );

        res.json(Number(result.rows[0].total));
    } catch {
        res.status(500).json({ error: "Error count" });
    }
}

async function getMonthlyGas(req, res) {
    const { userId, year, month } = req.query;

    try {
        const result = await pool.query(
            `
      SELECT COALESCE(SUM(p.gas_amount),0) as total
      FROM payments p
      JOIN contracts c ON c.id = p.contract_id
      WHERE c.owner_id = $1
      AND c.status = true
      AND p.gas = true
      AND DATE_PART('year', p.rent_month::DATE) = $2
      AND DATE_PART('month', p.rent_month::DATE) = $3
      `,
            [userId, year, month]
        );

        res.json(Number(result.rows[0].total));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error reporte gas" });
    }
}

async function getMonthlyWater(req, res) {
    const { userId, year, month } = req.query;

    try {
        const result = await pool.query(
            `
      SELECT COALESCE(SUM(p.water_amount),0) as total
      FROM payments p
      JOIN contracts c ON c.id = p.contract_id
      WHERE c.owner_id = $1
      AND c.status = true
      AND p.water = true
      AND DATE_PART('year', p.rent_month::DATE) = $2
      AND DATE_PART('month', p.rent_month::DATE) = $3
      `,
            [userId, year, month]
        );

        res.json(Number(result.rows[0].total));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error reporte water" });
    }
}

async function getMonthlyHoa(req, res) {
    const { userId, year, month } = req.query;

    try {
        const result = await pool.query(
            `
      SELECT COALESCE(SUM(p.hoa_fees_amount),0) as total
      FROM payments p
      JOIN contracts c ON c.id = p.contract_id
      WHERE c.owner_id = $1
      AND c.status = true
      AND p.hoa_fees = true
      AND DATE_PART('year', p.rent_month::DATE) = $2
      AND DATE_PART('month', p.rent_month::DATE) = $3
      `,
            [userId, year, month]
        );

        res.json(Number(result.rows[0].total));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error reporte hoa" });
    }
}


module.exports = {
    getAllPayments,
    getAllTransactions,
    getTransactionsByPaymentId,
    deleteTransaction,
    getPaymentsByContract,
    createPayment,
    updatePayment,
    createTransaction,
    getMonthlyRent,
    getMonthlyElectricity,
    getMonthlyCount,
    getMonthlyGas,
    getMonthlyWater,
    getMonthlyHoa,
};


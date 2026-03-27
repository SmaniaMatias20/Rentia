const { pool } = require("../dbs/db.js");

async function getStatisticsByUser(req, res) {
    try {
        const { userId } = req.params;

        const today = new Date().toISOString();

        // 🚀 Ejecutar todo en paralelo
        const [
            propertiesTotal,
            propertiesWithTenant,
            tenants,
            activeContracts,
            contractsToExpire,
            contractsExpired,
            contractsPending,
            rents
        ] = await Promise.all([
            getQuantityOfPropertiesByUser(userId),
            getPropertiesWithTenant(userId),
            getTenants(userId),
            getActiveContracts(userId, today),
            getContractsToExpire(userId),
            getContractsExpired(userId, today),
            getContractsPending(userId),
            getRents(userId, today)
        ]);

        const propertiesWithoutTenant = propertiesTotal - propertiesWithTenant;

        const percentageWithTenant =
            propertiesTotal > 0
                ? Math.round((propertiesWithTenant / propertiesTotal) * 100)
                : 0;

        const percentageWithoutTenant =
            propertiesTotal > 0
                ? Math.round((propertiesWithoutTenant / propertiesTotal) * 100)
                : 0;

        res.json({
            properties: {
                total: propertiesTotal,
                withTenant: propertiesWithTenant,
                withoutTenant: propertiesWithoutTenant,
                percentageWithTenant: percentageWithTenant,
                percentageWithoutTenant: percentageWithoutTenant,
            },
            tenants,
            rents,
            contracts: {
                active: activeContracts,
                toExpire: contractsToExpire,
                expired: contractsExpired,
                pending: contractsPending,
            },
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al obtener estadísticas"
        });
    }
}

async function getQuantityOfPropertiesByUser(userId) {
    const result = await pool.query(
        `SELECT COUNT(*) FROM properties WHERE user_id = $1`,
        [userId]
    );

    return parseInt(result.rows[0].count);
}

async function getPropertiesWithTenant(userId) {
    const result = await pool.query(
        `
    SELECT COUNT(DISTINCT p.id)
    FROM properties p
    JOIN contracts c ON p.id = c.property_id
    WHERE p.user_id = $1
    AND c.valid_from <= NOW()
    AND (c.valid_to >= NOW() OR c.valid_to IS NULL)
    `,
        [userId]
    );

    return parseInt(result.rows[0].count);
}

async function getTenants(userId) {
    const result = await pool.query(
        `
    SELECT COUNT(*) FROM users
    WHERE owner_id = $1 AND role = 'tenant'
    `,
        [userId]
    );

    return parseInt(result.rows[0].count);
}

async function getActiveContracts(userId) {
    const result = await pool.query(
        `
    SELECT COUNT(*) FROM contracts
    WHERE owner_id = $1
    AND valid_from <= NOW()
    AND (valid_to >= NOW() OR valid_to IS NULL)
    `,
        [userId]
    );

    return parseInt(result.rows[0].count);
}

async function getContractsToExpire(userId) {
    const result = await pool.query(
        `
    SELECT COUNT(*) FROM contracts
    WHERE owner_id = $1
    AND valid_from <= NOW()
    AND valid_to IS NOT NULL
    AND valid_to >= NOW()
    AND valid_to <= NOW() + INTERVAL '90 days'
    `,
        [userId]
    );

    return parseInt(result.rows[0].count);
}

async function getContractsExpired(userId) {
    const result = await pool.query(
        `
    SELECT COUNT(*) FROM contracts
    WHERE owner_id = $1
    AND valid_to IS NOT NULL
    AND valid_to < NOW()
    `,
        [userId]
    );

    return parseInt(result.rows[0].count);
}

async function getContractsPending(userId) {
    const result = await pool.query(
        `
    SELECT COUNT(*) FROM contracts
    WHERE owner_id = $1
    AND valid_from > NOW()
    `,
        [userId]
    );

    return parseInt(result.rows[0].count);
}

async function getRents(userId) {
    const result = await pool.query(
        `
    SELECT 
      MAX(rent_amount) as highest,
      MIN(rent_amount) as lowest
    FROM contracts
    WHERE owner_id = $1
    `,
        [userId]
    );

    return {
        highest: parseInt(result.rows[0].highest) || 0,
        lowest: parseInt(result.rows[0].lowest) || 0
    };
}

module.exports = {
    getStatisticsByUser
};
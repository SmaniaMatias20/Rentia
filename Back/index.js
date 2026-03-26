const express = require('express');
const cors = require('cors');
const routes = require("./src/routes/routes.js");
require("dotenv").config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/", routes);


// Ejemplo: traer datos
// app.get("/usuarios", async (req, res) => {
//     try {
//         const result = await pool.query("SELECT * FROM users");
//         res.json(result.rows);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Error en la DB" });
//     }
// });

app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
});
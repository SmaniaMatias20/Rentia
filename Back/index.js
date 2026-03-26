import express from "express";
import cors from "cors";
import { pool } from "./src/dbs/db.js";
import routes from "./src/routes/routes.js";

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
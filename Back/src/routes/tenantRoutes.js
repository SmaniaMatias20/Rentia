const express = require("express");
const router = express.Router();
const tenantControllers = require("../controllers/tenantControllers.js");

// ==========================
// 🧑‍💼 TENANTS
// ==========================

// Obtener todos
router.get("/all", tenantControllers.getAll);

// Obtener por usuario (con filtro)
router.get("/user/:userId", tenantControllers.getByUser);

// Obtener uno
router.get("/:id", tenantControllers.getById);

// Crear
router.post("/create", tenantControllers.create);

// Actualizar
router.put("/:id", tenantControllers.update);

// Eliminar
router.delete("/:id", tenantControllers.remove);

// Activar / desactivar
router.put("/toggle/:id", tenantControllers.toggle);


// ==========================
// 💬 COMMENTS
// ==========================

// Todos los comentarios
router.get("/comments", tenantControllers.getAllComments);

// Comentarios por tenant
router.get("/comments/:tenantId", tenantControllers.getCommentsByTenant);

// Crear comentario
router.post("/comments", tenantControllers.createComment);

// Eliminar comentario
router.delete("/comments/:id", tenantControllers.deleteComment);

// Mostrar / ocultar comentario
router.put("/comments/toggle/:id", tenantControllers.toggleComment);


module.exports = router;
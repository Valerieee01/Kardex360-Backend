import { Router } from "express";
import { usuariosController } from "./usuarios.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// LISTAR
router.get("/listar", authenticate, usuariosController.list);

// CREAR
router.post("/crear", authenticate, usuariosController.create);

// MODIFICAR
router.put("/modificar/:id", authenticate, usuariosController.update);
// (si prefieres patch)
// router.patch("/modificar/:id", authenticate, usuariosController.update);

export default router;
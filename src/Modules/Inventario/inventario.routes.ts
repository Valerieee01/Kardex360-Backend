// src/modules/movimientos/movimientos.routes.ts
import { Router } from "express";
import { movimientosController } from "./inventario.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticate, movimientosController.create);
router.get("/listar", authenticate,movimientosController.findAll);
router.get("/:codigo", authenticate,movimientosController.findById);
router.put("/actualizar/:codigo", authenticate,movimientosController.update);
router.post("/:codigo/anular",authenticate,  movimientosController.anular);

//router.delete("/eliminar/:codigo", authenticate,movimientosController.delete);

export default router;
import { Router } from "express";
import { bodegasController } from "./bodegas.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/listar", authenticate, bodegasController.findAll);
router.get("/obtener/:id", authenticate, bodegasController.findById);
router.post("/crear", authenticate, bodegasController.create);
router.put("/actualizar/:id", authenticate, bodegasController.update);
router.delete("/eliminar/:id", authenticate, bodegasController.delete);

export default router;
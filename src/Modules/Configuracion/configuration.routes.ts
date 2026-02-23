import { Router } from "express";
import { ConfiguracionController } from "./configuration.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();
const configuracionController = new ConfiguracionController();

router.get("/listar", authenticate, configuracionController.findAll);
router.get("/obtener/:identificacion", authenticate, configuracionController.findById);
router.post("/create", authenticate, configuracionController.create);
router.put("/actualizar/:identificacion", authenticate, configuracionController.update);
router.delete("/eliminar/:identificacion", authenticate, configuracionController.remove);

export default router;
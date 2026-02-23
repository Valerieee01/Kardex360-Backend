import { Router } from "express";
import { tallasController } from "./tallas.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/listar", authenticate,tallasController.list);
router.get("/obtener/:talla", authenticate,tallasController.getById);
router.post("/create", authenticate,tallasController.create);
router.put("/actualizar/:talla", authenticate,tallasController.update);
router.delete("/eliminar/:talla", authenticate, tallasController.remove);

export default router;
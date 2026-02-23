import { Router } from "express";
import { productosController } from "./productos.controller";
import { authenticate } from "../../middlewares/auth.middleware";

export const productosRoutes = Router();


productosRoutes.post("/crear",authenticate, productosController.crear);
productosRoutes.get("/listar",authenticate, productosController.listar);
productosRoutes.get("/:referencia", authenticate,productosController.obtener);
productosRoutes.put("/:referencia", authenticate,productosController.actualizar);
productosRoutes.delete("/:referencia",authenticate, productosController.eliminar);
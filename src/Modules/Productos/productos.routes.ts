import { Router } from "express";
import { productosController } from "./productos.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/listar", authenticate,productosController.list);


export default router;

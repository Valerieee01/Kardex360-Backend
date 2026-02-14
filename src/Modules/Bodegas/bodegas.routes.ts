import { Router } from "express";
import { bodegasController } from "./bodegas.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/listar", authenticate, bodegasController.list);


export default router;

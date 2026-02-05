import { Router } from "express";
import { bodegasController } from "../controllers/bodegas.controller";

const router = Router();

router.get("/", bodegasController.list);

export default router;

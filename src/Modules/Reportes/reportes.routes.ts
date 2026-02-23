import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { ReportesRepository } from "./reportes.repository";
import { ReportesService } from "./reportes.service";
import { ReportesController } from "./reportes.controller";

// Si ya tienes prisma singleton, úsalo
const prisma = new PrismaClient();

const repo = new ReportesRepository(prisma);
const service = new ReportesService(repo);
const controller = new ReportesController(service);

const router = Router();

router.get("/movimientos/resumen", controller.resumen);
router.get("/usuarios/:identificacion/movimientos", controller.porUsuario);

export default router;
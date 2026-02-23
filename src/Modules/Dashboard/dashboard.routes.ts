import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { DashboardRepository } from "./dashboard.repository";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";
import { authenticate, requireRoles } from "../../middlewares/auth.middleware";

const prisma = new PrismaClient();
const repo = new DashboardRepository(prisma);
const service = new DashboardService(repo);
const controller = new DashboardController(service);

const router = Router();

router.get("/resumen", authenticate,controller.resumen);

export default router;
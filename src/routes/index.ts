import { Router } from "express";
import bodegasRoutes from "../Modules/Bodegas/bodegas.routes";
import { authRoutes } from "../Modules/Login/auth.routes";
import { prisma } from "../db/prisma";

const router = Router();

router.get("/", (_req, res) => res.json({ ok: true, message: "Kardex API v1" }));

router.use("/bodegas", bodegasRoutes);
// Rutas principales
router.use("/auth", authRoutes(prisma));
export default router;

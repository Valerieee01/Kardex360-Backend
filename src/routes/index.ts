import { Router } from "express";
import bodegasRoutes from "./bodegas.routes";

const router = Router();

router.get("/", (_req, res) => res.json({ ok: true, message: "Kardex API v1" }));

router.use("/bodegas", bodegasRoutes);

export default router;

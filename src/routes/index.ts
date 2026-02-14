import { Router } from "express";
import bodegasRoutes from "../Modules/Bodegas/bodegas.routes";
import  productosRoutes  from "../Modules/Productos/productos.routes";
import { authRoutes } from "../Modules/Login/auth.routes";
import { prisma } from "../db/prisma";
import  usuariosRoutes  from "../Modules/Usuarios/users.routes";

const router = Router();

router.get("/", (_req, res) => res.json({ ok: true, message: "Kardex API v1" }));


// Rutas principales
router.use("/auth", authRoutes(prisma));
router.use("/bodegas", bodegasRoutes);
router.use("/productos", productosRoutes);
router.use("/users", usuariosRoutes)

export default router;

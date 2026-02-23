import { Router } from "express";
import bodegasRoutes from "../Modules/Bodegas/bodegas.routes";
import  {productosRoutes}  from "../Modules/Productos/productos.routes";
import { authRoutes } from "../Modules/Login/auth.routes";
import { prisma } from "../db/prisma";
import  usuariosRoutes  from "../Modules/Usuarios/users.routes";
import movimientosRoutes from "../Modules/Inventario/inventario.routes";
import tallasRouter from "../Modules/Tallas/tallas.routes";
import ConfiguracionRoutes from  "../Modules/Configuracion/configuration.routes";
import PermisosRoutes from  "../Modules/Permisos/permisos.routes";
import dasboardRoutes from "../Modules/Dashboard/dashboard.routes";
import resportesRoutes from "../Modules/Reportes/reportes.routes";
const router = Router();

router.get("/", (_req, res) => res.json({ ok: true, message: "Kardex API v1" }));


// Rutas principales
router.use("/auth", authRoutes(prisma));
router.use("/bodegas", bodegasRoutes);
router.use("/productos", productosRoutes);
router.use("/users", usuariosRoutes)
router.use("/movimientos", movimientosRoutes);
router.use("/tallas", tallasRouter);
router.use("/configuracion", ConfiguracionRoutes);
router.use("/permisos", PermisosRoutes);
router.use("/dashboard", dasboardRoutes);
router.use("/reportes", resportesRoutes);

export default router;

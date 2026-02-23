// src/modules/roles/role-permissions.routes.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { RolePermissionsRepository } from "./permisos.repository";
import { RolePermissionsService } from "./permisos.service";

const router = Router();
const prisma = new PrismaClient();

const repo = new RolePermissionsRepository(prisma);
const service = new RolePermissionsService(repo);

router.get("/roles/:codigoRol/permisos", async (req, res) => {
  try {
    const data = await service.getPermissionCodesForRole(req.params.codigoRol);
    return res.status(200).json({ success: true, data });
  } catch (e: any) {
    if (e.message === "ROL_NOT_FOUND") return res.status(404).json({ success: false, message: "Rol no existe" });
    return res.status(500).json({ success: false, message: "Error interno" });
  }
});

router.put("/roles/:codigoRol/permisos", async (req, res) => {
  try {
    const { permisos } = req.body as { permisos: string[] };
    if (!Array.isArray(permisos)) {
      return res.status(400).json({ success: false, message: "permisos debe ser un array de strings" });
    }

    const data = await service.replaceRolePermissions(req.params.codigoRol, permisos);
    return res.status(200).json({ success: true, message: "Permisos actualizados", data });
  } catch (e: any) {
    if (e.message === "ROL_NOT_FOUND") return res.status(404).json({ success: false, message: "Rol no existe" });
    if (e.message === "PERMISOS_INVALIDOS") {
      return res.status(400).json({ success: false, message: "Hay permisos inválidos", data: { invalidos: e.invalidos } });
    }
    return res.status(500).json({ success: false, message: "Error interno" });
  }
});

export default router;
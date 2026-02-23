// src/modules/roles/role-permissions.service.ts
import { RolePermissionsRepository } from "./permisos.repository";

export class RolePermissionsService {
  constructor(private readonly repo: RolePermissionsRepository) {}

  async getPermissionCodesForRole(codigoRol: string) {
    const rol = await this.repo.getRoleById(codigoRol);
    if (!rol) throw new Error("ROL_NOT_FOUND");

    const rows = await this.repo.listPermissionsByRole(codigoRol);
    return {
      codigo_rol: rol.codigo_rol,
      nombre: rol.nombre,
      permisos: rows.map((r) => r.codigo_permiso), // <- SOLO códigos (PERM-INVENT, etc.)
    };
  }

  async replaceRolePermissions(codigoRol: string, permisos: string[]) {
    const rol = await this.repo.getRoleById(codigoRol);
    if (!rol) throw new Error("ROL_NOT_FOUND");

    // normalizar + dedupe
    const clean = [...new Set((permisos ?? []).map(String).map((x) => x.trim()).filter(Boolean))];

    // validar contra la BD (tus 5 permisos)
    const existentes = await this.repo.listExistingPermissionCodes(clean);
    const setExistentes = new Set(existentes.map((p) => p.codigo_permiso));
    const invalidos = clean.filter((c) => !setExistentes.has(c));

    if (invalidos.length) {
      const err: any = new Error("PERMISOS_INVALIDOS");
      err.invalidos = invalidos;
      throw err;
    }

    await this.repo.replaceAll(codigoRol, clean);

    return { codigo_rol: codigoRol, permisos_asignados: clean.length };
  }
}
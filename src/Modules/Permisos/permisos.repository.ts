// src/modules/roles/role-permissions.repository.ts
import { PrismaClient } from "@prisma/client";

export class RolePermissionsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  getRoleById(codigoRol: string) {
    return this.prisma.roles.findUnique({
      where: { codigo_rol: codigoRol },
      select: { codigo_rol: true, nombre: true },
    });
  }

  listPermissionsByRole(codigoRol: string) {
    return this.prisma.rol_permisos.findMany({
      where: { codigo_rol: codigoRol },
      select: { codigo_permiso: true },
      orderBy: { codigo_permiso: "asc" },
    });
  }

  listExistingPermissionCodes(codigos: string[]) {
    return this.prisma.permisos.findMany({
      where: { codigo_permiso: { in: codigos } },
      select: { codigo_permiso: true },
    });
  }

  async replaceAll(codigoRol: string, codigosPermiso: string[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.rol_permisos.deleteMany({ where: { codigo_rol: codigoRol } });

      if (codigosPermiso.length) {
        await tx.rol_permisos.createMany({
          data: codigosPermiso.map((codigo_permiso) => ({
            codigo_rol: codigoRol,
            codigo_permiso,
          })),
          skipDuplicates: true,
        });
      }

      return true;
    });
  }
}
// usuarios.repository.ts
import { prisma } from "../../db/prisma";
import type { RoleCode } from "../../types/auth.types";

export class UsuariosRepository {
  
    findAll() {
    return prisma.usuarios.findMany({
      // si quieres que venga el rol:
      include: {
        usuario_roles: {
          include: { roles: true }, // ajusta si tu relación se llama distinto
        },
      },
      orderBy: { nombre_completo: "asc" },
    });
  }

  findByIdentification(identificacion: string) {
    return prisma.usuarios.findUnique({ where: { identificacion } });
  }

  createUser(data: {
    identificacion: string;
    nombre_completo: string;
    password_hash: string;
    estado: boolean;
  }) {
    return prisma.usuarios.create({ data });
  }

  updateUser(identificacion: string, data: any) {
    return prisma.usuarios.update({
      where: { identificacion },
      data,
    });
  }

  async replaceUserRoles(identificacion: string, roles: RoleCode[]) {
    // OJO: aquí depende del nombre real del campo en usuario_roles
    await prisma.usuario_roles.deleteMany({
      where: { identificacion }, // si tu campo se llama identificacion
      // si se llama identificacion_usuario, entonces: where: { identificacion_usuario: identificacion }
    });

    if (!roles.length) return;

    const rolesRows = await prisma.roles.findMany({
      where: { codigo_rol: { in: roles } },
      select: { codigo_rol: true },
    });

    if (rolesRows.length !== roles.length) throw new Error("ROLE_NOT_FOUND");

    await prisma.usuario_roles.createMany({
      data: rolesRows.map((r) => ({
        identificacion,      // o identificacion_usuario
        codigo_rol: r.codigo_rol, // o id_rol si tu pivote guarda id
      })),
    });
  }
}
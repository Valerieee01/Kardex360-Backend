
import { prisma } from "../../db/prisma";

export const usuariosRepository = {

  findAll: () => prisma.usuarios.findMany(),
    findById: (identificacion: string) =>
      prisma.usuarios.findFirst({
        where: { identificacion , estado: true },
      }),

}
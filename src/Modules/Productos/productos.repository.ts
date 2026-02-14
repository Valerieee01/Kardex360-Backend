import { prisma } from "../../db/prisma";

export const productosRepository = {

  findAll: () => prisma.productos.findMany(),
    findById: (referencia: string) =>
      prisma.productos.findUnique({
        where: { referencia: referencia },
      }),

}
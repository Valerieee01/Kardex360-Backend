import { prisma } from "../db/prisma";

export const bodegaRepository = {
  findAll: () => prisma.bodegas.findMany(),
  findById: (codigo: string) =>
    prisma.bodegas.findUnique({
      where: { codigo_bodega: codigo },
    }),
};

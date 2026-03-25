import { prisma } from "../../db/prisma";

export const bodegasRepository = {
  create: (data: { codigo_bodega: string; nombre_bodega: string ; ubicacion?: string; estado?: boolean }) =>
    prisma.bodegas.create({ data }),

  findAll: () =>
    prisma.bodegas.findMany({
      orderBy: { codigo_bodega: "asc" },
    }),

  findById: (codigo_bodega: string) => 
    prisma.bodegas.findFirst({
      where: { codigo_bodega },
    }),

  update: (codigo_bodega: string, data: { nombre_bodega?: string; ubicacion?: string | null; estado?: boolean }) =>
    prisma.bodegas.update({
      where: { codigo_bodega },
      data,
    }),

  // borrado lógico: solo apaga estado
  softDelete: (codigo_bodega: string) =>
    prisma.bodegas.update({
      where: { codigo_bodega },
      data: { estado: false },
    }),
};
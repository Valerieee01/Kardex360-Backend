import { prisma } from "../../db/prisma";

export const tallasRepository = {

  findAll: (args: {
    where?: any;
    skip?: number;
    take?: number;
  }) =>
    prisma.tallas.findMany({
      where: args.where,
      skip: args.skip,
      take: args.take,
      orderBy: { talla: "asc" },
    }),

  count: (where?: any) =>
    prisma.tallas.count({ where }),

  findById: (talla: string) =>
    prisma.tallas.findUnique({
      where: { talla },
    }),

  create: (talla: string) =>
    prisma.tallas.create({
      data: { talla },
    }),

  update: (talla: string, newTalla: string) =>
    prisma.tallas.update({
      where: { talla },
      data: { talla: newTalla },
    }),

  delete: (talla: string) =>
    prisma.tallas.delete({
      where: { talla },
    }),

  countStockUsage: (talla: string) =>
    prisma.stock.count({
      where: { talla },
    }),

  countMovimientoUsage: (talla: string) =>
    prisma.movimiento_detalle.count({
      where: { talla },
    }),
};
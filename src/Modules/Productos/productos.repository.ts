import { prisma } from "../../db/prisma";
import type { CreateProductoDto, UpdateProductoDto } from "./productos.schema";

export const productosRepository = {
  create: (data: CreateProductoDto) =>
    prisma.productos.create({
      data: {
        referencia: data.referencia,
        descripcion: data.descripcion ?? null,
        imagen_url: data.imagen_url ?? null,
        precio_base: data.precio_base ?? null,
        estado: data.estado ?? true,
      },
    }),

  findAll: (opts?: { onlyActivos?: boolean }) =>
    prisma.productos.findMany({
      where: opts?.onlyActivos ? { estado: true } : undefined,
      orderBy: { created_at: "desc" },
    }),

  findByReferencia: (referencia: string) =>
    prisma.productos.findUnique({ where: { referencia } }),

  update: (referencia: string, data: UpdateProductoDto) =>
    prisma.productos.update({
      where: { referencia },
      data: {
        descripcion: data.descripcion ?? undefined,
        imagen_url: data.imagen_url ?? undefined,
        precio_base: data.precio_base ?? undefined,
        estado: data.estado ?? undefined,
        updated_at: new Date(),
      },
    }),

  softDelete: (referencia: string) =>
    prisma.productos.update({
      where: { referencia },
      data: { estado: false, updated_at: new Date() },
    }),
};
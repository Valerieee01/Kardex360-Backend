// src/modules/movimientos/movimientos.service.ts
import { movimientosRepository } from "./inventario.repository";
import { prisma } from "../../db/prisma";

export const movimientosService = {
  create: async (data: Parameters<typeof movimientosRepository.create>[0]) => {
    // Reglas mínimas (ajústalas)
    if (data.tipo === "TRASPASO") {
      if (!data.bodega_origen || !data.bodega_destino) {
        throw new Error("Para TRASPASO debes enviar bodega_origen y bodega_destino.");
      }
      if (data.bodega_origen === data.bodega_destino) {
        throw new Error("bodega_origen y bodega_destino no pueden ser la misma.");
      }
    }
    if (!data.detalle?.length) throw new Error("El movimiento debe tener al menos 1 item.");

    return movimientosRepository.create(data);
  },

  findAll: (filters?: Parameters<typeof movimientosRepository.findAll>[0]) =>
    movimientosRepository.findAll(filters),

  findById: async (codigo: string) => {
    const mov = await movimientosRepository.findById(codigo);
    if (!mov) throw new Error("Movimiento no encontrado");
    return mov;
  },

  update: async (codigo: string, data: Parameters<typeof movimientosRepository.update>[1]) => {
    // Validaciones básicas si cambia a TRASPASO
    if (data.tipo === "TRASPASO") {
      if (!data.bodega_origen || !data.bodega_destino) {
        throw new Error("Para TRASPASO debes enviar bodega_origen y bodega_destino.");
      }
    }
    if (data.detalle && data.detalle.length === 0) {
      throw new Error("Si envías detalle, debe traer al menos 1 item.");
    }
    return movimientosRepository.update(codigo, data);
  },
  
 anular: async (
  codigo_movimiento: string,
  input: { anulado_por: string; motivo?: string }
) => {

  return prisma.$transaction(async (tx) => {

    const mov = await tx.movimientos.findUnique({
      where: { codigo_movimiento },
      include: { movimiento_detalle: true },
    });

    if (!mov) throw new Error("Movimiento no encontrado");
    if (!mov.estado) throw new Error("El movimiento ya está anulado");

    // Aquí va tu lógica de reversión de stock

    return tx.movimientos.update({
      where: { codigo_movimiento },
      data: {
        estado: false,
        anulado_at: new Date(),
        anulado_por: input.anulado_por,
        anulado_motivo: input.motivo ?? null,
      },
    });
  });
},

  delete: (codigo: string) => movimientosRepository.delete(codigo),
};
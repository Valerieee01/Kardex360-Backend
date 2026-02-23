import { bodegasRepository as repo } from "./bodegas.repository";
import { z } from "zod";
import { createBodegaSchema, updateBodegaSchema } from "./bodegas.schema";

type CreateBodegaInput = z.infer<typeof createBodegaSchema>;
type UpdateBodegaInput = z.infer<typeof updateBodegaSchema>;

export const bodegasService = {

  async list() {
    return repo.findAll();
  },

  async getById(codigo_bodega: string) {
    const bodega = await repo.findById(codigo_bodega);

    if (!bodega) {
      throw Object.assign(new Error("Bodega no encontrada"), { httpStatus: 404 });
    }

    return bodega;
  },

  async create(input: CreateBodegaInput) {

    // Verificar si ya existe
    const existe = await repo.findById(input.codigo_bodega);
    if (existe) {
      throw Object.assign(new Error("Ya existe una bodega con ese código"), { httpStatus: 400 });
    }

    return repo.create({
      codigo_bodega: input.codigo_bodega, 
      nombre_bodega: input.nombre_bodega,
      ubicacion: input.ubicacion,
      estado: input.estado ?? true,
    });
  },

  async update(codigo_bodega: string, input: UpdateBodegaInput) {

    const existe = await repo.findById(codigo_bodega);
    if (!existe) {
      throw Object.assign(new Error("Bodega no encontrada"), { httpStatus: 404 });
    }

    return repo.update(codigo_bodega, {
      nombre_bodega: input.nombre_bodega,
      ubicacion: input.ubicacion ?? null,
      estado: input.estado,
    });
  },

  async delete(codigo_bodega: string) {

    const existe = await repo.findById(codigo_bodega);
    if (!existe) {
      throw Object.assign(new Error("Bodega no encontrada"), { httpStatus: 404 });
    }

    // borrado lógico
    return repo.softDelete(codigo_bodega);
  }

};
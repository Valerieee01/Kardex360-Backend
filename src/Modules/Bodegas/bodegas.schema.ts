import { z } from "zod";

export const createBodegaSchema = z.object({
  codigo_bodega: z.string().min(1).max(30),
  nombre_bodega: z.string().min(1).max(120),
  ubicacion: z.string().max(200).optional(),
  estado: z.boolean().optional(),
});

export const updateBodegaSchema = createBodegaSchema
  .omit({ codigo_bodega: true }) 
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, "Debes enviar al menos un campo para actualizar");
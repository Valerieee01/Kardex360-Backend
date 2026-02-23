import { z } from "zod";

export const createProductoSchema = z.object({
  referencia: z.string().min(1).max(60),
  descripcion: z.string().max(300).optional().nullable(),
  imagen_url: z.string().url().optional().nullable(),
  precio_base: z.coerce.number().nonnegative().optional().nullable(),
  estado: z.coerce.boolean().optional(), // default en BD: true
});

export const updateProductoSchema = createProductoSchema
  .omit({ referencia: true })
  .partial();

export type CreateProductoDto = z.infer<typeof createProductoSchema>;
export type UpdateProductoDto = z.infer<typeof updateProductoSchema>;
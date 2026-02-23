import { z } from "zod";

export const createConfiguracionSchema = z.object({
  identificacion: z.string().min(1).max(30),
  nombre_sistema: z.string().min(1).max(120),
  ubicacion: z.string().max(200).optional().nullable(),
});

export const updateConfiguracionSchema = z.object({
  nombre_sistema: z.string().min(1).max(120).optional(),
  ubicacion: z.string().max(200).optional().nullable(),
});
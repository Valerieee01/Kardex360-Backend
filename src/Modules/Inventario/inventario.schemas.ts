import { z } from "zod";

export const TipoMovimientoSchema = z.enum(["ENTRADA", "VENTA", "TRASPASO"]);

export const MovimientoDetalleInputSchema = z.object({
  referencia: z.string().min(1).max(60),
  talla: z.string().min(1).max(20),
  cantidad: z.number().int().positive(),
  valor_unitario: z.number().positive(),
});

// 1) Schema BASE (SIN refinements)
const MovimientoBaseSchema = z.object({
  tipo: TipoMovimientoSchema,
  fecha: z.coerce.date().optional(),
  responsable: z.string().min(1).max(30),
  bodega_origen: z.string().max(30).nullable().optional(),
  bodega_destino: z.string().max(30).nullable().optional(),
  observacion: z.string().nullable().optional(),
  detalle: z.array(MovimientoDetalleInputSchema).min(1),
});

// 2) Refinement como función para reusarlo
const withMovimientoRules = <T extends z.ZodTypeAny>(schema: T) =>
  schema.superRefine((data: any, ctx) => {
    const origen = data.bodega_origen ?? null;
    const destino = data.bodega_destino ?? null;

    if (data.tipo === "ENTRADA") {
      if (!destino) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bodega_destino"],
          message: "ENTRADA requiere bodega_destino.",
        });
      }
      if (origen) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bodega_origen"],
          message: "ENTRADA no debe tener bodega_origen.",
        });
      }
    }

    if (data.tipo === "VENTA") {
      if (!origen) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bodega_origen"],
          message: "VENTA requiere bodega_origen.",
        });
      }
      if (destino) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bodega_destino"],
          message: "VENTA no debe tener bodega_destino.",
        });
      }
    }

    if (data.tipo === "TRASPASO") {
      if (!origen) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bodega_origen"],
          message: "TRASPASO requiere bodega_origen.",
        });
      }
      if (!destino) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bodega_destino"],
          message: "TRASPASO requiere bodega_destino.",
        });
      }
      if (origen && destino && origen === destino) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bodega_destino"],
          message: "TRASPASO requiere bodegas diferentes (origen != destino).",
        });
      }
    }
  });

// 3) Create: extend + rules
export const CreateMovimientoSchema = withMovimientoRules(
  MovimientoBaseSchema.extend({
    codigo_movimiento: z.string().min(1).max(40),
  })
);

// 4) Update: NO usamos omit sobre refinado; omit sobre base, luego rules
export const UpdateMovimientoSchema = withMovimientoRules(
  MovimientoBaseSchema
    .omit({ detalle: true }) // ✅ aquí sí, porque es base (sin refinements)
    .partial()
    .extend({
      detalle: z.array(MovimientoDetalleInputSchema).min(1).optional(),
      // codigo_movimiento no va en update
    })
);

// 5) Anular
export const AnularMovimientoSchema = z.object({
  motivo: z.string().min(1).max(500).optional(),
});
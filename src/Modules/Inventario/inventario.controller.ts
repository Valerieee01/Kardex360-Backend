// src/modules/movimientos/movimientos.controller.ts
import type { Request, Response } from "express";
import { movimientosService } from "./inventario.service";
import { AnularMovimientoSchema } from "./inventario.schemas";

export const movimientosController = {
  create: async (req: Request, res: Response) => {
    try {
      const mov = await movimientosService.create(req.body);
      return res.status(201).json({ success: true, data: mov });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err?.message ?? "Error" });
    }
  },

  findAll: async (req: Request, res: Response) => {
    const { tipo, desde, hasta, responsable, bodega } = req.query;

    const data = await movimientosService.findAll({
      tipo: (tipo as any) || undefined,
      responsable: (responsable as string) || undefined,
      bodega: (bodega as string) || undefined,
      desde: desde ? new Date(String(desde)) : undefined,
      hasta: hasta ? new Date(String(hasta)) : undefined,
    });

    return res.json({ success: true, data });
  },

  findById: async (req: Request, res: Response) => {
    try {
      const mov = await movimientosService.findById(req.params.codigo.toString());
      return res.json({ success: true, data: mov });
    } catch (err: any) {
      return res.status(404).json({ success: false, message: err?.message ?? "No encontrado" });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const mov = await movimientosService.update(req.params.codigo.toString(), req.body);
      return res.json({ success: true, data: mov });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err?.message ?? "Error" });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      await movimientosService.delete(req.params.codigo.toString());
      return res.json({ success: true, message: "Movimiento eliminado" });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err?.message ?? "Error" });
    }
  },

   anular: async (req: Request, res: Response) => {
    console.log("req.user =>", req.user);
  try {
    // 1️⃣ Validar body (solo motivo si lo estás usando así)
    const parsed = AnularMovimientoSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.flatten(),
      });
    }

    // 2️⃣ Sacar usuario del token
    const anulado_por =
      req.user?.id ??
      req.user?.nombre;
console.log(anulado_por)
      
    if (!anulado_por) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    const data = await movimientosService.anular(
      String(req.params.codigo),
      {
        anulado_por,
        motivo: parsed.data.motivo,
      }
    );

    return res.json({
      success: true,
      message: "Movimiento anulado y stock ajustado",
      data,
    });

  } catch (e: any) {
    return res.status(400).json({
      success: false,
      message: e?.message ?? "Error anulando movimiento",
    });
  }
},
};
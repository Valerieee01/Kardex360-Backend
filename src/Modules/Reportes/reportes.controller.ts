import { Request, Response } from "express";
import { ReportesService } from "./reportes.service";
import { tipo_movimiento } from "@prisma/client";

function parseFiltros(q: any) {
  const from = q.from as string | undefined;
  const to = q.to as string | undefined;
  const bodega = (q.bodega as string | undefined) ?? "TODAS";
  const tipo = (q.tipo as string | undefined) ?? "TODOS";

  // Validación sencilla de tipo
  const tipoOk =
    tipo === "TODOS" ||
    tipo === tipo_movimiento.ENTRADA ||
    tipo === tipo_movimiento.VENTA ||
    tipo === tipo_movimiento.TRASPASO;

  if (!tipoOk) {
    const err: any = new Error("TIPO_INVALIDO");
    err.value = tipo;
    throw err;
  }

  return { from, to, bodega, tipo: tipo as any };
}

export class ReportesController {
  constructor(private readonly service: ReportesService) {}

  resumen = async (req: Request, res: Response) => {
    try {
      const filtros = parseFiltros(req.query);
      const data = await this.service.resumenMovimientos(filtros);
      return res.status(200).json({ success: true, data });
    } catch (e: any) {
      if (e.message === "TIPO_INVALIDO") {
        return res.status(400).json({ success: false, message: "tipo inválido", data: { tipo: e.value } });
      }
      return res.status(500).json({ success: false, message: "Error interno" });
    }
  };

  porUsuario = async (req: Request, res: Response) => {
    try {
      const filtros = parseFiltros(req.query);
      const { identificacion } = req.params;
      const limit = req.query.limit ? Number(req.query.limit) : 50;

      const data = await this.service.movimientosPorUsuario(identificacion.toString(), filtros, limit);
      return res.status(200).json({ success: true, data });
    } catch (e: any) {
      if (e.message === "TIPO_INVALIDO") {
        return res.status(400).json({ success: false, message: "tipo inválido", data: { tipo: e.value } });
      }
      return res.status(500).json({ success: false, message: "Error interno" });
    }
  };
}
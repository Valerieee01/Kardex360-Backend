import { Request, Response } from "express";
import { ConfiguracionRepository } from "./configuration.repository";
import { ConfiguracionService } from "./configuration.service";
import { createConfiguracionSchema, updateConfiguracionSchema } from "./Dtos/configuration.schema";

const repo = new ConfiguracionRepository();
const service = new ConfiguracionService(repo);

function statusFromError(e: any) {
  return typeof e?.httpStatus === "number" ? e.httpStatus : 500;
}

export class ConfiguracionController {
  async create(req: Request, res: Response) {
    try {
      const body = createConfiguracionSchema.parse(req.body);
      const created = await service.create(body);
      return res.status(201).json({ success: true, message: "Configuración creada", data: created });
    } catch (e: any) {
      return res.status(statusFromError(e)).json({ success: false, message: e?.message ?? "Error" });
    }
  }

  async findAll(_req: Request, res: Response) {
    try {
      const rows = await service.findAll();
      return res.status(200).json({ success: true, message: "OK", data: rows });
    } catch (e: any) {
      return res.status(statusFromError(e)).json({ success: false, message: e?.message ?? "Error" });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { identificacion } = req.params;
      const row = await service.findById(identificacion.toString());
      if (!row) return res.status(404).json({ success: false, message: "Configuración no encontrada" });
      return res.status(200).json({ success: true, message: "OK", data: row });
    } catch (e: any) {
      return res.status(statusFromError(e)).json({ success: false, message: e?.message ?? "Error" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { identificacion } = req.params;
      const body = updateConfiguracionSchema.parse(req.body);
      const updated = await service.update(identificacion.toString(), body);
      return res.status(200).json({ success: true, message: "Configuración actualizada", data: updated });
    } catch (e: any) {
      return res.status(statusFromError(e)).json({ success: false, message: e?.message ?? "Error" });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { identificacion } = req.params;
      const out = await service.remove(identificacion.toString());
      return res.status(200).json({ success: true, message: "Configuración eliminada", data: out });
    } catch (e: any) {
      return res.status(statusFromError(e)).json({ success: false, message: e?.message ?? "Error" });
    }
  }
}
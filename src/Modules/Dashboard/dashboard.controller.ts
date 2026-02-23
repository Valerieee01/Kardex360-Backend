import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";

export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  resumen = async (_req: Request, res: Response) => {
    try {
      const data = await this.service.getResumen();
      return res.status(200).json({
        success: true,
        message: "Dashboard cargado correctamente",
        data,
      });
    } catch {
      return res.status(500).json({
        success: false,
        message: "Error interno",
      });
    }
  };
}
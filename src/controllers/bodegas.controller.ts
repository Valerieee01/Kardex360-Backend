import { Request, Response, NextFunction } from "express";
import { bodegasService } from "../services/bodegas.service";

export const bodegasController = {
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await bodegasService.list();
      res.json({ ok: true, data });
    } catch (err) {
      next(err);
    }
  },
};

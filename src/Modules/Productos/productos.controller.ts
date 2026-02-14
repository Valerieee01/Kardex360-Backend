import { Request, Response, NextFunction } from "express";
import { productosService } from "./productos.service";

export const productosController = {
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await productosService.list();
      res.json({ ok: true, data });
    } catch (err) {
      next(err);
    }
  },
};

import { Request, Response, NextFunction } from "express";
import { tallasService } from "./tallas.service";

export const tallasController = {

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const search = String(req.query.search ?? "").trim();
      const page = Math.max(1, Number(req.query.page ?? 1));
      const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 10)));

      const data = await tallasService.list(search, page, limit);

      return res.status(200).json({
        success: true,
        message: "Listado de tallas",
        data
      });

    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const talla = req.params.talla;

      const data = await tallasService.getById(talla.toString());

      return res.status(200).json({
        success: true,
        message: "Talla encontrada",
        data
      });

    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { talla } = req.body;

      const data = await tallasService.create(talla);

      return res.status(201).json({
        success: true,
        message: "Talla creada correctamente",
        data
      });

    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const talla = req.params.talla;
      const { talla: newTalla } = req.body;

      const data = await tallasService.update(talla.toString(), newTalla);

      return res.status(200).json({
        success: true,
        message: "Talla actualizada correctamente",
        data
      });

    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const talla = req.params.talla;

      await tallasService.remove(talla.toString());

      return res.status(200).json({
        success: true,
        message: "Talla eliminada correctamente"
      });

    } catch (error) {
      next(error);
    }
  }

};
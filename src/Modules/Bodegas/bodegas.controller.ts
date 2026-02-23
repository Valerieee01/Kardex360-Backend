import { Request, Response } from "express";
import { createBodegaSchema, updateBodegaSchema } from "./bodegas.schema";
import { bodegasService } from "./bodegas.service";

export const bodegasController = {

    async findAll(_req: Request, res: Response) {
    const data = await bodegasService.list();
    return res.json({ success: true, message: "Listado de bodegas", data });
  },

    async findById(req: Request, res: Response) {
    const codigo_bodega = req.params.id;
    const data = await bodegasService.getById(codigo_bodega.toString());
    return res.json({ success: true, message: "Bodega encontrada", data });
  },


  async create(req: Request, res: Response) {
    const input = createBodegaSchema.parse(req.body);
    const data = await bodegasService.create(input);
    return res.status(201).json({ success: true, message: "Bodega creada.", data });
  },

  async update(req: Request, res: Response) {
    const codigo_bodega = req.params.id; // 👈 string
    const input = updateBodegaSchema.parse(req.body);
    const data = await bodegasService.update(codigo_bodega.toString(), input);
    return res.json({ success: true, message: "Bodega actualizada.", data });
  },

  async delete(req: Request, res: Response) {
    const codigo_bodega = req.params.id;
    await bodegasService.delete(codigo_bodega.toString());
    return res.json({ success: true, message: "Bodega eliminada.", data: null });
  },
};
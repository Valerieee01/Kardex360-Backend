import type { Request, Response } from "express";
import { ProductosService } from "./productos.service";
import { createProductoSchema, updateProductoSchema } from "./productos.schema";

const svc = new ProductosService();

export const productosController = {
  crear: async (req: Request, res: Response) => {
    const dto = createProductoSchema.parse(req.body);
    const data = await svc.crear(dto);
    return res.status(201).json({ success: true, message: "Producto creado.", data });
  },

  listar: async (req: Request, res: Response) => {
    const onlyActivos = req.query.onlyActivos === "true";
    const data = await svc.listar({ onlyActivos });
    return res.json({ success: true, message: "OK", data });
  },

  obtener: async (req: Request, res: Response) => {
    const referencia = req.params.referencia;
    const data = await svc.obtener(referencia.toString());
    return res.json({ success: true, message: "OK", data });
  },

  actualizar: async (req: Request, res: Response) => {
    const referencia = req.params.referencia;
    const dto = updateProductoSchema.parse(req.body);
    const data = await svc.actualizar(referencia.toString(), dto);
    return res.json({ success: true, message: "Producto actualizado.", data });
  },

  eliminar: async (req: Request, res: Response) => {
    const referencia = req.params.referencia;
    const data = await svc.eliminar(referencia.toString());
    return res.json({ success: true, message: "Producto inactivado.", data });
  },
};
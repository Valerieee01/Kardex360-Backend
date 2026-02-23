import { Request, Response, NextFunction } from "express";
import { UsuariosService } from "./usuarios.service";
import { UsuariosRepository } from "./usuarios.repository";

const service = new UsuariosService(new UsuariosRepository());

export const usuariosController = {
  
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await service.list(); // ajusta si tu service recibe filtros
      return res.json({ success: true, data });
    } catch (e) {
      next(e);
      console.log(`Error al listar los Uusarios: ${e}`);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    console.log(req.body)
    try {
      const result = await service.create(req.body);
      return res.status(201).json({ success: true, message: "Usuario creado", data: result });
    } catch (e) {
      next(e);
      console.log(`Error al crear el Usuario: ${e}`);

    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const result = await service.update(userId.toString(), req.body);
      return res.json({ success: true, message: "Usuario actualizado", data: result });
    } catch (e) {
      next(e);
      console.log(`Error al Actualizar los Usuarios: ${e}`);

    }
  },
};
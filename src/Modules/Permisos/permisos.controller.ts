// src/modules/roles/role-permissions.controller.ts

import { Request, Response } from "express";
import { RolePermissionsService } from "./permisos.service";

export class RolePermissionsController {
  constructor(private readonly service: RolePermissionsService) {}

  /**
   * Obtener permisos asignados a un rol
   * GET /roles/:codigoRol/permisos
   */
  getByRole = async (req: Request, res: Response) => {
    try {
      const { codigoRol } = req.params;

      const data = await this.service.getPermissionCodesForRole(codigoRol.toString());

      return res.status(200).json({
        success: true,
        message: "Permisos obtenidos correctamente",
        data,
      });

    } catch (error: any) {

      if (error.message === "ROL_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "El rol no existe",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  };

  /**
   * Reemplazar permisos de un rol (SYNC COMPLETO)
   * PUT /roles/:codigoRol/permisos
   */
  replace = async (req: Request, res: Response) => {
    try {
      const { codigoRol } = req.params;
      const { permisos } = req.body as { permisos: string[] };

      if (!Array.isArray(permisos)) {
        return res.status(400).json({
          success: false,
          message: "El campo permisos debe ser un arreglo de strings",
        });
      }

      const result = await this.service.replaceRolePermissions(
        codigoRol.toString(),
        permisos
      );

      return res.status(200).json({
        success: true,
        message: "Permisos actualizados correctamente",
        data: result,
      });

    } catch (error: any) {

      if (error.message === "ROL_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "El rol no existe",
        });
      }

      if (error.message === "PERMISOS_INVALIDOS") {
        return res.status(400).json({
          success: false,
          message: "Algunos permisos no existen en la base de datos",
          data: { invalidos: error.invalidos },
        });
      }

      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  };
}

import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";

const DEFAULT_MESSAGES: Record<string, string> = {
  BAD_REQUEST: "Datos inválidos",
  UNAUTHORIZED: "No autorizado",
  FORBIDDEN: "Acceso denegado",
  NOT_FOUND: "No encontrado",
  INVALID_CREDENTIALS: "Credenciales inválidas",
  USER_DISABLED: "Usuario deshabilitado",
};

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      code: err.code,
      message: err.message || DEFAULT_MESSAGES[err.code] || "Error",
    });
  }

  return res.status(500).json({
    success: false,
    code: "INTERNAL_ERROR",
    message: "Error interno del servidor",
  });

}


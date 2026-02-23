import { Response } from "express";

export function ok(res: Response, message: string, data: any = null) {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
}

export function created(res: Response, message: string, data: any = null) {
  return res.status(201).json({
    success: true,
    message,
    data,
  });
}

export function badRequest(res: Response, message: string) {
  return res.status(400).json({
    success: false,
    message,
  });
}

export function unauthorized(res: Response, message = "No autorizado") {
  return res.status(401).json({
    success: false,
    message,
  });
}

export function forbidden(res: Response, message = "Acceso denegado") {
  return res.status(403).json({
    success: false,
    message,
  });
}

export function notFound(res: Response, message = "No encontrado") {
  return res.status(404).json({
    success: false,
    message,
  });
}

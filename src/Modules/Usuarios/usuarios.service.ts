// usuarios.service.ts
import bcrypt from "bcrypt";
import { AppError } from "../../utils/app-error";
import type { CreateUserInput, UpdateUserInput } from "./DTOs/usuarios.types";
import { UsuariosRepository } from "./usuarios.repository";
import type { RoleCode } from "../../types/auth.types";

export class UsuariosService {
  constructor(private readonly repo: UsuariosRepository) {}

  async list() {
    const rows = await this.repo.findAll();

    // formateo final (opcional pero recomendado)
    return rows.map((u: any) => ({
      identificacion: String(u.identificacion),
      nombre_completo: String(u.nombre_completo),
      estado: Boolean(u.estado),
      roles: (u.usuario_roles ?? [])
        .map((ur: any) => ur.roles?.codigo_rol)
        .filter(Boolean) as RoleCode[],
    }));
  }

  async create(input: CreateUserInput) {
    // 1) no duplicados
    const exists = await this.repo.findByIdentification(input.identificacion);
    if (exists) throw new AppError("USER_ALREADY_EXISTS", 409);

    // 2) hash password
    const password_hash = await bcrypt.hash(input.password, 10);

    // 3) crea user
    const user = await this.repo.createUser({
      identificacion: input.identificacion,
      nombre_completo: input.nombre_completo,
      password_hash,
      estado: input.estado ?? true,
    });

    // 4) roles
    const roles = input.roles ?? [];
    await this.repo.replaceUserRoles(user.identificacion, roles);

    return { id: user.identificacion };
  }

  async update(userId: string, input: UpdateUserInput) {
    const user = await this.repo.findByIdentification(userId);
    if (!user) throw new AppError("USER_NOT_FOUND", 404);

    const data: any = {};

    if (typeof input.nombre_completo === "string") data.nombre_completo = input.nombre_completo;
    if (typeof input.estado === "boolean") data.estado = input.estado;

    if (typeof input.password === "string" && input.password.length > 0) {
      data.password_hash = await bcrypt.hash(input.password, 10);
      // opcional: al cambiar password, revoca token
      data.access_token_hash = null;
      data.access_token_expires_at = null;
      data.token_revoked_at = new Date();
    }

    if (Object.keys(data).length) {
      await this.repo.updateUser(userId, data);
    }

    if (Array.isArray(input.roles)) {
      await this.repo.replaceUserRoles(userId, input.roles);
    }

    return { ok: true };
  }
}
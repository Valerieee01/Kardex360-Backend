import { ConfiguracionRepository } from "./configuration.repository";

export class ConfiguracionService {
  constructor(private readonly repo: ConfiguracionRepository) {}

  async create(data: { identificacion: string; nombre_sistema: string; ubicacion?: string | null }) {
    const exists = await this.repo.findById(data.identificacion);
    if (exists) {
      const err: any = new Error("Ya existe configuración con esa identificación");
      err.httpStatus = 409;
      throw err;
    }
    return this.repo.create(data);
  }

  findAll() {
    return this.repo.findAll();
  }

  async findById(identificacion: string) {
    return this.repo.findById(identificacion);
  }

  async update(
    identificacion: string,
    data: { nombre_sistema?: string; ubicacion?: string | null }
  ) {
    const exists = await this.repo.findById(identificacion);
    if (!exists) {
      const err: any = new Error("Configuración no encontrada");
      err.httpStatus = 404;
      throw err;
    }
    return this.repo.update(identificacion, data);
  }

  async remove(identificacion: string) {
    const exists = await this.repo.findById(identificacion);
    if (!exists) {
      const err: any = new Error("Configuración no encontrada");
      err.httpStatus = 404;
      throw err;
    }
    await this.repo.delete(identificacion);
    return { ok: true };
  }
}
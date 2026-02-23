import { tallasRepository } from "./tallas.repository";

export const tallasService = {

  async list(search: string, page: number, limit: number) {

    const where = search
      ? { talla: { contains: search, mode: "insensitive" as const } }
      : undefined;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      tallasRepository.findAll({ where, skip, take: limit }),
      tallasRepository.count(where),
    ]);

    return {
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  },

  async getById(talla: string) {
    const found = await tallasRepository.findById(talla);
    if (!found) throw httpError(404, "Talla no encontrada");
    return found;
  },

  async create(talla: string) {
    if (!talla) throw httpError(400, "La talla es requerida");

    const exists = await tallasRepository.findById(talla);
    if (exists) throw httpError(409, "La talla ya existe");

    return tallasRepository.create(talla);
  },

  async update(talla: string, newTalla: string) {

    const found = await tallasRepository.findById(talla);
    if (!found) throw httpError(404, "Talla no encontrada");

    if (talla !== newTalla) {
      const exists = await tallasRepository.findById(newTalla);
      if (exists) throw httpError(409, "Ya existe esa talla");
    }

    const stockUsage = await tallasRepository.countStockUsage(talla);
    const movUsage = await tallasRepository.countMovimientoUsage(talla);

    if ((stockUsage + movUsage) > 0 && talla !== newTalla) {
      throw httpError(409, "No se puede modificar una talla en uso");
    }

    return tallasRepository.update(talla, newTalla);
  },

  async remove(talla: string) {

    const found = await tallasRepository.findById(talla);
    if (!found) throw httpError(404, "Talla no encontrada");

    const stockUsage = await tallasRepository.countStockUsage(talla);
    const movUsage = await tallasRepository.countMovimientoUsage(talla);

    if ((stockUsage + movUsage) > 0) {
      throw httpError(409, "No se puede eliminar una talla en uso");
    }

    await tallasRepository.delete(talla);
  },
};

function httpError(status: number, message: string) {
  const err: any = new Error(message);
  err.status = status;
  return err;
}
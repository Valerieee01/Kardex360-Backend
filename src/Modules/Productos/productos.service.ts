import { productosRepository as repo } from "./productos.repository";
import type { CreateProductoDto, UpdateProductoDto } from "./productos.schema";

export class ProductosService {
  async crear(dto: CreateProductoDto) {
    const exists = await repo.findByReferencia(dto.referencia);
    if (exists) {
      const err: any = new Error("Ya existe un producto con esa referencia.");
      err.httpStatus = 400;
      throw err;
    }
    return repo.create(dto);
  }

  async listar(params?: { onlyActivos?: boolean }) {
    return repo.findAll(params);
  }

  async obtener(referencia: string) {
    const prod = await repo.findByReferencia(referencia);
    if (!prod) {
      const err: any = new Error("Producto no encontrado.");
      err.httpStatus = 404;
      throw err;
    }
    return prod;
  }

  async actualizar(referencia: string, dto: UpdateProductoDto) {
    await this.obtener(referencia);
    return repo.update(referencia, dto);
  }

  async eliminar(referencia: string) {
    await this.obtener(referencia);
    return repo.softDelete(referencia);
  }
}
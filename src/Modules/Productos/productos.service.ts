import { productosRepository } from "./productos.repository";

export const productosService = {
  list: () => productosRepository.findAll(),
};

import { bodegaRepository } from "../repositories/bodega.repository";

export const bodegasService = {
  list: () => bodegaRepository.findAll(),
};

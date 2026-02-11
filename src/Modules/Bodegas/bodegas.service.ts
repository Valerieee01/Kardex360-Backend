import { bodegaRepository } from "./bodegas.repository";

export const bodegasService = {
  list: () => bodegaRepository.findAll(),
};

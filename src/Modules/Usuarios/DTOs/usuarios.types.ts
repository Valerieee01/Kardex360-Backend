// usuarios.types.ts
import type {RoleCode} from "../../../auth/auth.types";

export type CreateUserInput = {
  identificacion: string;
  nombre_completo: string;
  password: string;
  estado?: boolean;          // default true
  roles?: RoleCode[];        // default []
};

export type UpdateUserInput = {
  nombre_completo?: string;
  password?: string;         // opcional
  estado?: boolean;
  roles?: RoleCode[];        // si viene, reemplaza
};

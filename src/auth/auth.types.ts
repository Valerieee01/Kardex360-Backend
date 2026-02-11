type RoleCode = "SUPERVISOR" | "ADMIN" | "VENDEDOR";

export type JwtUser = {
  id: string;
  nombre: string;
  roles: RoleCode[];
};

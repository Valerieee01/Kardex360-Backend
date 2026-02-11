export type RoleCode = "SUPERVISOR" | "ADMIN" | "VENDEDOR";

export type JwtPayloadShape = {
  sub: string;         
  nombre: string;
  roles: RoleCode[];
};

export type JwtUser = {
  id: string;
  nombre: string;
  roles: RoleCode[];
};

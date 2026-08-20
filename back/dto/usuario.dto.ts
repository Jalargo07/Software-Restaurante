export function serializeUsuario(usuario: any) {
  const data = usuario.toJSON ? usuario.toJSON() : usuario;
  const { password, ...rest } = data;
  return rest;
}

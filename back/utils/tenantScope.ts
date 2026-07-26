export function scopeTenant(where: any, tenantId?: number, sucursalId?: number): any {
  const result = { ...(where || {}) };
  if (tenantId) result.tenant_id = tenantId;
  if (sucursalId) result.sucursal_id = sucursalId;
  return result;
}

export function withTenant(data: any, tenantId?: number, sucursalId?: number): any {
  const result = { ...data };
  if (tenantId) result.tenant_id = tenantId;
  if (sucursalId) result.sucursal_id = sucursalId;
  return result;
}

export function belongsToTenant(record: any, tenantId: number) {
  if (!record) return false;
  return record.tenant_id === tenantId;
}

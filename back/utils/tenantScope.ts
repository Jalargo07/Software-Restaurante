export function scopeTenant(where: any, tenantId: number) {
  return { ...(where || {}), tenant_id: tenantId };
}

export function withTenant(data: any, tenantId: number) {
  return { ...data, tenant_id: tenantId };
}

export function belongsToTenant(record: any, tenantId: number) {
  if (!record) return false;
  return record.tenant_id === tenantId;
}

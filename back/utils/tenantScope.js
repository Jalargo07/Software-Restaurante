/**
 * Fusiona tenant_id en el objeto where existente (no muta el original)
 * @param {Object|null} where - Objeto where existente o null/undefined
 * @param {number} tenantId - ID del tenant
 * @returns {Object} Objeto where con tenant_id incluido
 */
function scopeTenant(where, tenantId) {
  return { ...(where || {}), tenant_id: tenantId };
}

/**
 * Inyecta tenant_id en los datos de creación (no muta el original)
 * @param {Object} data - Datos de creación
 * @param {number} tenantId - ID del tenant
 * @returns {Object} Datos con tenant_id incluido
 */
function withTenant(data, tenantId) {
  return { ...data, tenant_id: tenantId };
}

/**
 * Valida que un registro pertenece al tenant actual
 * @param {Object} record - Registro de Sequelize
 * @param {number} tenantId - ID del tenant
 * @returns {boolean} true si pertenece al tenant
 */
function belongsToTenant(record, tenantId) {
  if (!record) return false;
  return record.tenant_id === tenantId;
}

module.exports = { scopeTenant, withTenant, belongsToTenant };

const { scopeTenant, withTenant, belongsToTenant } = require('../dist/utils/tenantScope');

describe('Core Tests', () => {
  test('scopeTenant filtra por tenant_id', () => {
    const result = scopeTenant({ activo: true }, 1);
    expect(result).toEqual({ activo: true, tenant_id: 1 });
  });

  test('scopeTenant con sucursalId opcional', () => {
    const result = scopeTenant({}, 1, 5);
    expect(result).toEqual({ tenant_id: 1, sucursal_id: 5 });
  });

  test('scopeTenant sin tenantId no agrega filtro', () => {
    const result = scopeTenant({ activo: true });
    expect(result).toEqual({ activo: true });
  });

  test('withTenant agrega tenant_id y sucursal_id', () => {
    const result = withTenant({ nombre: 'Test' }, 1, 5);
    expect(result).toEqual({ nombre: 'Test', tenant_id: 1, sucursal_id: 5 });
  });

  test('belongsToTenant compara tenant_id', () => {
    const registro = { tenant_id: 1 };
    expect(belongsToTenant(registro, 1)).toBe(true);
    expect(belongsToTenant(registro, 2)).toBe(false);
  });
});

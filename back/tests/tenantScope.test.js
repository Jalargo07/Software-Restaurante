const { scopeTenant, withTenant, belongsToTenant } = require('../utils/tenantScope');

describe('tenantScope', () => {
  describe('scopeTenant', () => {
    test('Fusiona tenant_id con where existente', () => {
      const result = scopeTenant({ nombre: 'test' }, 1);
      expect(result).toEqual({ nombre: 'test', tenant_id: 1 });
    });

    test('Maneja where null → retorna solo tenant_id', () => {
      const result = scopeTenant(null, 1);
      expect(result).toEqual({ tenant_id: 1 });
    });

    test('Maneja where undefined → retorna solo tenant_id', () => {
      const result = scopeTenant(undefined, 2);
      expect(result).toEqual({ tenant_id: 2 });
    });

    test('No muta el objeto original', () => {
      const original = { nombre: 'test' };
      scopeTenant(original, 1);
      expect(original).toEqual({ nombre: 'test' });
    });
  });

  describe('withTenant', () => {
    test('Inyecta tenant_id en datos', () => {
      const result = withTenant({ nombre: 'producto' }, 5);
      expect(result).toEqual({ nombre: 'producto', tenant_id: 5 });
    });

    test('No muta el objeto original', () => {
      const original = { nombre: 'producto' };
      withTenant(original, 5);
      expect(original).toEqual({ nombre: 'producto' });
    });
  });

  describe('belongsToTenant', () => {
    test('Retorna true si record.tenant_id coincide', () => {
      expect(belongsToTenant({ tenant_id: 3 }, 3)).toBe(true);
    });

    test('Retorna false si record.tenant_id no coincide', () => {
      expect(belongsToTenant({ tenant_id: 3 }, 5)).toBe(false);
    });

    test('Retorna false si record es null', () => {
      expect(belongsToTenant(null, 1)).toBe(false);
    });

    test('Retorna false si record es undefined', () => {
      expect(belongsToTenant(undefined, 1)).toBe(false);
    });
  });
});

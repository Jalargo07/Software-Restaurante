const { Tenant, TenantConfig } = require('../models');
const { setup, teardown } = require('./setup');

beforeAll(async () => {
  await setup();
});

afterAll(async () => {
  await teardown();
});

describe('TenantConfig', () => {
  test('Config created with correct defaults', async () => {
    const config = await TenantConfig.findOne({ where: { tenant_id: 1 } });
    expect(config).not.toBeNull();
    expect(config.colorPrimario).toBe('#0d6efd');
    expect(config.colorSecundario).toBe('#6c757d');
    expect(config.colorAcento).toBe('#198754');
    expect(config.fontPrincipal).toBe('Inter');
    expect(config.nombreCompleto).toBe('Restaurante Principal');
    expect(config.logo).toBeNull();
    expect(config.banner).toBeNull();
  });

  test('Relationship 1:1 Tenant -> TenantConfig works', async () => {
    const tenant = await Tenant.findByPk(1, { include: TenantConfig });
    expect(tenant.TenantConfig).toBeDefined();
    expect(tenant.TenantConfig.tenant_id).toBe(1);
    expect(tenant.TenantConfig.colorPrimario).toBe('#0d6efd');

    const config = await TenantConfig.findOne({ where: { tenant_id: 1 }, include: Tenant });
    expect(config.Tenant).toBeDefined();
    expect(config.Tenant.nombre).toBe('Restaurante Principal');
  });

  test('Cannot create two configs for same tenant (unique constraint)', async () => {
    await expect(
      TenantConfig.create({ tenant_id: 1, nombreCompleto: 'Duplicada' })
    ).rejects.toThrow();
  });
});

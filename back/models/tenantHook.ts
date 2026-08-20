import { checkLicense } from '../utils/licenseGuard';

export function agregarTenantScopeHook(sequelize: any) {
  for (const modelName of Object.keys(sequelize.models)) {
    const model = sequelize.models[modelName] as any;

    if (model.rawAttributes && 'tenant_id' in model.rawAttributes) {
      model.addHook('beforeFind', 'tenantScopeHook', (options: any) => {
        if (options.tenantId === undefined) return;

        const licenseOk = checkLicense().ok;
        let tenantIdToUse = options.tenantId;

        if (!licenseOk) {
          tenantIdToUse = -1;
        }

        if (!options.where) {
          options.where = {};
        }

        if (!options.where.tenant_id) {
          options.where.tenant_id = tenantIdToUse;
        }
      });
    }
  }

  console.log('✅ Hook tenantScope автом\u00E1tico aplicado a modelos con tenant_id');
}

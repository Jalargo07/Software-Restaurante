import DeliveryOrder from '../models/DeliveryOrder';
import DeliveryPartner from '../models/DeliveryPartner';

interface NormalizedOrder {
  partnerOrderId: string;
  partnerNombre: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
}

export async function parseRappiWebhook(payload: any): Promise<NormalizedOrder> {
  return {
    partnerOrderId: payload.order_id?.toString() || '',
    partnerNombre: 'rappi',
    customerName: payload.customer?.name || 'Cliente Rappi',
    customerPhone: payload.customer?.phone || '',
    deliveryAddress: payload.delivery?.address?.street || '',
    items: payload.items?.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    })) || [],
    total: parseFloat(payload.total || 0),
    status: mapRappiStatus(payload.status)
  };
}

export async function parseUberEatsWebhook(payload: any): Promise<NormalizedOrder> {
  return {
    partnerOrderId: payload.id?.toString() || '',
    partnerNombre: 'ubereats',
    customerName: payload.customer?.first_name + ' ' + payload.customer?.last_name || 'Cliente Uber',
    customerPhone: payload.customer?.phone || '',
    deliveryAddress: payload.dropoff?.address || '',
    items: payload.cart?.map((item: any) => ({
      name: item.title,
      quantity: item.quantity,
      price: item.price
    })) || [],
    total: parseFloat(payload.payment?.charges?.total?.amount || 0),
    status: mapUberStatus(payload.state)
  };
}

export async function crearDeliveryOrder(
  tenantId: number,
  normalized: NormalizedOrder
): Promise<any> {
  const partner = await DeliveryPartner.findOne({
    where: { nombre: normalized.partnerNombre, tenantId }
  });
  if (!partner) {
    throw new Error(`Partner '${normalized.partnerNombre}' no encontrado para tenant ${tenantId}`);
  }
  return await DeliveryOrder.create({
    tenantId,
    partnerOrderId: normalized.partnerOrderId,
    partnerId: partner.get('id') as number,
    customerName: normalized.customerName,
    customerPhone: normalized.customerPhone,
    deliveryAddress: normalized.deliveryAddress,
    total: normalized.total,
    status: normalized.status,
    rawPayload: normalized as any
  });
}

function mapRappiStatus(status: string): string {
  const map: Record<string, string> = {
    'placed': 'pending',
    'confirmed': 'confirmed',
    'preparing': 'preparing',
    'ready': 'ready',
    'delivered': 'delivered',
    'cancelled': 'cancelled'
  };
  return map[status] || 'pending';
}

function mapUberStatus(status: string): string {
  const map: Record<string, string> = {
    'RECEIVED': 'pending',
    'CONFIRMED': 'confirmed',
    'PREPARING': 'preparing',
    'READY_FOR_PICKUP': 'ready',
    'PICKED_UP': 'delivered',
    'CANCELLED': 'cancelled'
  };
  return map[status] || 'pending';
}

import { Request, Response } from 'express';
import { Transaccion, Tenant } from '../models';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

const PRECIOS: Record<string, number> = {
  basico: 39900,
  pro: 69900,
  enterprise: 179900,
};

async function getAccessToken(): Promise<string> {
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data: any = await res.json();
  return data.access_token;
}

export const crearOrden = async (req: Request, res: Response) => {
  try {
    const { plan } = req.body;
    if (!plan || !PRECIOS[plan]) return res.status(400).json({ error: 'Plan inválido' });

    const accessToken = await getAccessToken();
    const monto = PRECIOS[plan];

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: 'USD', value: (monto / 1000).toFixed(2) },
          description: `Plan ${plan.toUpperCase()} - BiteOps`,
        }],
      }),
    });

    const order: any = await response.json();

    if (order.error) {
      console.error('PayPal error:', order);
      return res.status(400).json({ error: 'Error al crear orden PayPal' });
    }

    const transaccion: any = await Transaccion.create({
      tenant_id: req.tenantId,
      plan,
      monto,
      moneda: 'CLP',
      estado: 'pendiente',
      paypalOrderId: order.id,
      respuestaPaypal: order,
    });

    res.json({ orderId: order.id, transaccionId: transaccion.id });
  } catch (error: any) {
    console.error('Error en crearOrden:', error);
    res.status(500).json({ error: 'Error al crear orden de pago' });
  }
};

export const capturarOrden = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: 'orderId requerido' });

    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const capture: any = await response.json();

    if (capture.error) {
      console.error('PayPal capture error:', capture);
      return res.status(400).json({ error: 'Error al capturar pago' });
    }

    const status = capture.status === 'COMPLETED' ? 'completado' : 'fallido';

    const transaccion: any = await Transaccion.findOne({ where: { paypalOrderId: orderId } });
    if (transaccion) {
      transaccion.estado = status;
      transaccion.paypalCaptureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;
      transaccion.respuestaPaypal = capture;
      await transaccion.save();

      if (status === 'completado') {
        const tenant: any = await Tenant.findByPk(transaccion.tenant_id);
        if (tenant) {
          tenant.plan = transaccion.plan;
          await tenant.save();
        }
      }
    }

    res.json({ status, transaccion });
  } catch (error: any) {
    console.error('Error en capturarOrden:', error);
    res.status(500).json({ error: 'Error al capturar pago' });
  }
};

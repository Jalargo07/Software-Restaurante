import { settings } from '../config/settings';

interface WhatsAppMessage {
  to: string;
  template: string;
  variables: Record<string, string>;
}

export async function enviarMensajeWhatsApp(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { businessPhone: WHATSAPP_BUSINESS_PHONE, accessToken: WHATSAPP_ACCESS_TOKEN, apiVersion: WHATSAPP_API_VERSION } = settings.whatsapp;

  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_BUSINESS_PHONE) {
    return { success: false, error: 'WhatsApp no configurado' };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_BUSINESS_PHONE}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: message.to,
          type: 'template',
          template: {
            name: message.template,
            language: { code: 'es' },
            components: [
              {
                type: 'body',
                parameters: Object.values(message.variables).map(v => ({ type: 'text', text: v }))
              }
            ]
          }
        })
      }
    );

    const result = await response.json();

    if (result.messages && result.messages[0]) {
      return { success: true, messageId: result.messages[0].id };
    }

    return { success: false, error: result.error?.message || 'Error desconocido' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function enviarNotificacionPedidoListo(
  tenantId: number,
  telefonoCliente: string,
  numeroPedido: string
): Promise<{ success: boolean; error?: string }> {
  const result = await enviarMensajeWhatsApp({
    to: telefonoCliente,
    template: 'pedido_listo',
    variables: { numeroPedido }
  });

  const { NotificationLog } = await import('../models');
  await NotificationLog.create({
    tenantId,
    tipo: 'pedido_listo',
    destinatario: telefonoCliente,
    mensaje: `Tu pedido #${numeroPedido} está listo para retirar`,
    status: result.success ? 'sent' : 'failed',
    error: result.error
  });

  return result;
}

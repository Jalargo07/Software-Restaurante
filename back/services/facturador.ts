interface ResultadoTimbre {
  exito: boolean;
  folio?: string;
  timbre?: string;
  fechaTimbre?: Date;
  xml?: string;
  error?: string;
}

interface Facturador {
  timbrar(documento: any, config: any): Promise<ResultadoTimbre>;
  anular(documento: any, config: any): Promise<ResultadoTimbre>;
}

class FacturadorSIIMock implements Facturador {
  async timbrar(documento: any, config: any): Promise<ResultadoTimbre> {
    await new Promise(r => setTimeout(r, 500));
    const folio = `F${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
    const xml = `<?xml version="1.0"?><DTE><Encabezado><IdDoc><Folio>${folio}</Folio></IdDoc><Emisor><RUT>${config.rut || '11111111-1'}</RUT></Emisor><Receptor><RUT>${documento.rutCliente || '66666666-6'}</RUT></Receptor><Totales><MontoNeto>${documento.montoNeto}</MontoNeto><IVA>${documento.iva}</IVA><MontoTotal>${documento.montoTotal}</MontoTotal></Totales></Encabezado></DTE>`;
    return { exito: true, folio, timbre: `TSE-${Date.now()}`, fechaTimbre: new Date(), xml };
  }
  async anular(_documento: any, _config: any): Promise<ResultadoTimbre> {
    await new Promise(r => setTimeout(r, 300));
    return { exito: true };
  }
}

class FacturadorAFIPMock implements Facturador {
  async timbrar(documento: any, config: any): Promise<ResultadoTimbre> {
    await new Promise(r => setTimeout(r, 500));
    const folio = `CAE-${String(Math.floor(Math.random() * 999999999999)).padStart(12, '0')}`;
    const xml = `<?xml version="1.0"?><CAE><Encabezado><Cbte><CbteDesde>1</CbteDesde><CbteHasta>1</CbteHasta></Cbte><CAE>${folio}</CAE><Vencimiento>${new Date(Date.now() + 7776000000).toISOString().split('T')[0]}</Vencimiento></Encabezado></CAE>`;
    return { exito: true, folio, timbre: `AFIP-${Date.now()}`, fechaTimbre: new Date(), xml };
  }
  async anular(_documento: any, _config: any): Promise<ResultadoTimbre> {
    await new Promise(r => setTimeout(r, 300));
    return { exito: true };
  }
}

export function crearFacturador(pais: string): Facturador {
  return pais === 'argentina' ? new FacturadorAFIPMock() : new FacturadorSIIMock();
}

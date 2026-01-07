import crypto from 'crypto';

export class BlockchainHelper {

  static generarHashCertificado({
    folio,
    fecha_expedido,
    fecha_expira,
    nombre,
    app,
    apm
  }) {

    const payload = JSON.stringify({
      folio,
      fecha_expedido,
      fecha_expira,
      nombre,
      app,
      apm
    });

    return crypto
      .createHash('sha256')
      .update(payload)
      .digest('hex');
  }
}

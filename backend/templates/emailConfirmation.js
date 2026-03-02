import { CENTER_INFO } from "../config/center.js";

export function generateConfirmationEmail(data) {
  return `
  <div style="font-family: Arial, sans-serif; padding:20px; background:#f5f5f5;">
    <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:8px;">
      
      <h2 style="color:#111;">Richiesta ricevuta ✅</h2>
      
      <p>Ciao <strong>${data.name}</strong>,</p>
      <p>Abbiamo ricevuto correttamente la tua richiesta.</p>

      <hr/>

      <h3>📋 Riepilogo richiesta</h3>
      <p><strong>Numero pratica:</strong> ${data.ticketId}</p>
      <p><strong>Dispositivo:</strong> ${data.device}</p>
      <p><strong>Problema:</strong> ${data.problem}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Telefono:</strong> ${data.phone}</p>

      <hr/>

      <h3>📍 Dove trovarci</h3>
      <p><strong>${CENTER_INFO.name}</strong></p>
      <p>${CENTER_INFO.address}</p>
      <p>${CENTER_INFO.city}</p>
      <p>📞 ${CENTER_INFO.phone}</p>
      <p>🕒 ${CENTER_INFO.openingHours}</p>
      <p>
        <a href="${CENTER_INFO.mapsLink}" target="_blank">
          Apri su Google Maps
        </a>
      </p>

      <hr/>

      <p style="font-size:12px; color:#777;">
        Ti contatteremo il prima possibile.
      </p>

    </div>
  </div>
  `;
}
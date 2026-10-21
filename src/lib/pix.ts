// Gera o payload PIX (EMV/BR Code) com CRC16 para o QR Code e copia-e-cola.
export const PIX_KEY = "83a831c8-ccb4-442a-b765-73c085388118";
export const MERCHANT_NAME = "TOKYOBS";
export const MERCHANT_CITY = "ITABUNA";
export const PAYMENT_WINDOW_MS = 15 * 60 * 1000;

function emv(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

export function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildPixPayload(amount: number, txid: string): string {
  const merchantAccount = emv("26", emv("00", "br.gov.bcb.pix") + emv("01", PIX_KEY));
  const cleanTxid = (txid.replace(/[^a-zA-Z0-9]/g, "") || "TOKYOBS").slice(0, 25);
  const payload =
    emv("00", "01") +
    merchantAccount +
    emv("52", "0000") +
    emv("53", "986") +
    emv("54", amount.toFixed(2)) +
    emv("58", "BR") +
    emv("59", MERCHANT_NAME) +
    emv("60", MERCHANT_CITY) +
    emv("62", emv("05", cleanTxid)) +
    "6304";
  return payload + crc16(payload);
}

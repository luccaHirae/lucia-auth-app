import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export function generateTwoFactorSecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: `Lucia Auth App (${email})`,
    issuer: 'Lucia Auth App',
  });

  return secret;
}

export function generateTwoFactorToken(secret: string) {
  return speakeasy.totp({
    secret,
    encoding: 'base32',
  });
}

export function verifyTwoFactorToken(token: string, secret: string) {
  return speakeasy.totp.verify({
    token,
    secret,
    encoding: 'base32',
    window: 1, // Allow 1 time step in either direction
  });
}

export async function generateQRCode(secret: speakeasy.GeneratedSecret) {
  const otpauthUrl = secret.otpauth_url!;
  return await QRCode.toDataURL(otpauthUrl);
}

export function generateRecoveryCodes() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(randomString(10));
  }
  return codes;
}

function randomString(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}


import CryptoJS from 'crypto-js';

// 32-byte hex key
const KEY = process.env.NEXT_PUBLIC_AES_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

export const encrypt = (plaintext: string) => {
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(plaintext, CryptoJS.enc.Hex.parse(KEY), { iv });
  return iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
};

export const decrypt = (cipher: string) => {
  const data = CryptoJS.enc.Base64.parse(cipher);
  const iv = CryptoJS.lib.WordArray.create(data.words.slice(0, 4));
  const ct = CryptoJS.lib.WordArray.create(data.words.slice(4));
  const bytes = CryptoJS.AES.decrypt({ ciphertext: ct } as any, CryptoJS.enc.Hex.parse(KEY), { iv });
  return bytes.toString(CryptoJS.enc.Utf8);
};

"use client"; // Asegura que el código solo se ejecuta en el cliente

import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "Edwin"; // Cambio a process.env
const IV_LENGTH = 16; // Longitud del IV en bytes

export const encryptData = (text: string): string => {
  try {
    const key = CryptoJS.PBKDF2(SECRET_KEY, CryptoJS.enc.Utf8.parse("salt"), {
      keySize: 256 / 32, // 256-bit key
      iterations: 1000,
    });

    const iv = CryptoJS.lib.WordArray.random(IV_LENGTH); // Generamos IV aleatorio

    const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Convertimos IV y el texto cifrado a Base64 para facilitar transporte
    const ivBase64 = CryptoJS.enc.Base64.stringify(iv);
    const encryptedBase64 = encrypted.toString();

    return `${ivBase64}:${encryptedBase64}`; // Devolvemos IV y texto cifrado juntos
  } catch (error) {
    console.error("Encryption error:", error);
    return "";
  }
};

export const decryptData = (ciphertext: string): string => {
  try {
    const key = CryptoJS.PBKDF2(SECRET_KEY, CryptoJS.enc.Utf8.parse("salt"), {
      keySize: 256 / 32, // 256-bit key
      iterations: 1000,
    });

    const parts = ciphertext.split(":");

    if (parts.length !== 2) throw new Error("Formato de cifrado incorrecto");

    const iv = CryptoJS.enc.Base64.parse(parts[0]); // Decodificar IV desde Base64
    const encryptedText = parts[1];

    const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const decoded = decrypted.toString(CryptoJS.enc.Utf8);
    if (!decoded) throw new Error("Error en desencriptación");

    return decoded;
  } catch (error) {
    console.error("❌ Error al desencriptar:", error);
    return "";
  }
};

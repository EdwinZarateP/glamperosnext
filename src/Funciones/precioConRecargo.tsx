"use client";

export const precioConRecargo = (precio: number): number => {
  if (precio <= 0) return 0;
  if (precio <= 299999) return precio * 1.2;
  if (precio >= 300000 && precio < 400000) return precio * 1.16;
  if (precio >= 400000 && precio < 500000) return precio * 1.14;
  if (precio >= 500000 && precio < 600000) return precio * 1.13;
  if (precio >= 600000 && precio < 800000) return precio * 1.11;
  if (precio >= 800000 && precio < 2000000) return precio * 1.1;

  return precio;
};

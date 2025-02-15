"use client";

export const precioConRecargo = (precio: number): number => {
  if (precio <= 0) return 0;

  if (precio <= 299999) return precio * 1.15;
  if (precio >= 300000 && precio <= 400000) return precio * 1.12;
  if (precio >= 401000 && precio <= 500000) return precio * 1.11;
  if (precio >= 501000 && precio <= 600000) return precio * 1.1;
  if (precio >= 601000 && precio <= 800000) return precio * 1.09;
  if (precio >= 801000 && precio <= 2000000) return precio * 1.08;

  return precio;
};

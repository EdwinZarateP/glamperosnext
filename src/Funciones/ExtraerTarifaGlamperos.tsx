// Función que calcula el precio con recargo según el precio base
export const ExtraerTarifaGlamperos = (precio: number): number => {
  if (precio <= 0) return 0;
  if (precio < 300000) return 0.16;
  if (precio >= 300000 && precio < 400000) return  0.15;
  if (precio >= 400000 && precio < 500000) return 0.13;
  if (precio >= 500000 && precio < 600000) return 0.12;
  if (precio >= 600000 && precio < 800000) return 0.1;
  if (precio >= 800000 && precio < 2000000) return 0.09;
  
  return precio;
};

// Función que calcula el precio con recargo según el precio base
export const ExtraerTarifaGlamperos = (precio: number): number => {
  if (precio <= 0) return 0;
  if (precio <= 299999) return 0.15;
  if (precio >= 300000 && precio <= 400000) return  0.12;
  if (precio >= 401000 && precio <= 500000) return 0.11;
  if (precio >= 501000 && precio <= 600000) return 0.1;
  if (precio >= 601000 && precio <= 800000) return 0.09;
  if (precio >= 801000 && precio <= 2000000) return 0.08;
  
  return precio;
};

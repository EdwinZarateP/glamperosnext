export interface Glamping {
  id: number;
  nombre: string;
  ubicacion: string;
  precioFinSemana: number;
  precioDiaSemana: number;
  calificacion: number;
  totalResenas: number;
  capacidadMaxima: number;
  petFriendly: boolean;
  desayunoIncluido: boolean;
  imagenes: string[];
  favorito: boolean;
}

export const glampingsDePrueba: Glamping[] = [
  {
    id: 1,
    nombre: 'Domo Cielo Abierto',
    ubicacion: 'Guatapé, Antioquia',
    precioFinSemana: 480000,
    precioDiaSemana: 320000,
    calificacion: 4.9,
    totalResenas: 124,
    capacidadMaxima: 2,
    petFriendly: true,
    desayunoIncluido: true,
    imagenes: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
      'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800&q=80',
      'https://images.unsplash.com/photo-1533619239233-6280475a633a?w=800&q=80',
    ],
    favorito: false,
  },
  {
    id: 2,
    nombre: 'Cabaña del Cocora',
    ubicacion: 'Salento, Quindío',
    precioFinSemana: 560000,
    precioDiaSemana: 390000,
    calificacion: 4.8,
    totalResenas: 89,
    capacidadMaxima: 4,
    petFriendly: false,
    desayunoIncluido: true,
    imagenes: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
      'https://images.unsplash.com/photo-1496080174650-637e3f22fa03?w=800&q=80',
      'https://images.unsplash.com/photo-1641569618527-68e26db76db0?q=80&w=1074',
      'https://plus.unsplash.com/premium_photo-1718204438280-484021f08ca1?q=80&w=1470',
      'https://images.unsplash.com/photo-1516402707257-787c50fc3898?q=80&w=1470',
      'https://images.unsplash.com/photo-1624254495476-db6cc8b77e98?q=80&w=1335',
      'https://images.unsplash.com/photo-1593053272490-e0ed6d6a42c5?q=80&w=1470',
      'https://images.unsplash.com/photo-1643494847699-149c403ac576?q=80&w=1430',
    ],
    favorito: true,
  },
  {
    id: 3,
    nombre: 'Tipi La Sierra',
    ubicacion: 'Villa de Leyva, Boyacá',
    precioFinSemana: 350000,
    precioDiaSemana: 240000,
    calificacion: 4.7,
    totalResenas: 56,
    capacidadMaxima: 2,
    petFriendly: true,
    desayunoIncluido: false,
    imagenes: [
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&q=80',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
    ],
    favorito: false,
  },
  {
    id: 4,
    nombre: 'Nest en la Copa',
    ubicacion: 'Minca, Magdalena',
    precioFinSemana: 650000,
    precioDiaSemana: 480000,
    calificacion: 5.0,
    totalResenas: 38,
    capacidadMaxima: 2,
    petFriendly: false,
    desayunoIncluido: true,
    imagenes: [
      'https://images.unsplash.com/photo-1496080174650-637e3f22fa03?w=800&q=80',
      'https://images.unsplash.com/photo-1533619239233-6280475a633a?w=800&q=80',
      'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800&q=80',
    ],
    favorito: false,
  },
  {
    id: 5,
    nombre: 'Burbuja del Páramo',
    ubicacion: 'Zipaquirá, Cundinamarca',
    precioFinSemana: 520000,
    precioDiaSemana: 360000,
    calificacion: 4.6,
    totalResenas: 72,
    capacidadMaxima: 2,
    petFriendly: false,
    desayunoIncluido: false,
    imagenes: [
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&q=80',
    ],
    favorito: true,
  },
  {
    id: 6,
    nombre: 'Glamping Pacífico',
    ubicacion: 'Nuquí, Chocó',
    precioFinSemana: 780000,
    precioDiaSemana: 580000,
    calificacion: 4.9,
    totalResenas: 41,
    capacidadMaxima: 3,
    petFriendly: true,
    desayunoIncluido: true,
    imagenes: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
      'https://images.unsplash.com/photo-1496080174650-637e3f22fa03?w=800&q=80',
    ],
    favorito: false,
  },
];

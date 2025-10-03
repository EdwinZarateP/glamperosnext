// src/components/filtros.tsx
import {
  MdPool,
  MdOutlineCabin,
} from "react-icons/md";
import { FaCaravan } from "react-icons/fa";
import {
  FaHotTubPerson,
  FaCat,
  FaUmbrellaBeach,
  FaTemperatureArrowUp,
  FaTemperatureArrowDown
} from 'react-icons/fa6';
import {
  GiFishingNet,
  GiCampingTent,
  GiHabitatDome,
  GiHut,
  GiDesert,
  GiHiking,
  GiRiver,
  GiWaterfall,
  GiEagleEmblem,
  GiWoodCabin
} from "react-icons/gi";
import { PiCoffeeBeanFill, PiMountainsBold } from 'react-icons/pi';
import { BsTreeFill } from "react-icons/bs";

export const FILTROS = [
  { value: 'bogota',   label: 'Cerca a Bogotá',     icon: <GiEagleEmblem /> },
  { value: 'medellin', label: 'Cerca a Medellín',   icon: <PiCoffeeBeanFill /> },
  { value: 'cali',     label: 'Cerca a Cali',       icon: <FaCat /> },
  { value: 'domo',     label: 'Domo',               icon: <GiHabitatDome /> },
  { value: 'tipi',     label: 'Tipi',               icon: <GiHut /> },
  { value: 'tiny_house',     label: 'Tiny house',   icon: <FaCaravan /> },  
  { value: 'tienda',   label: 'Tienda',             icon: <GiCampingTent /> },
  { value: 'cabana',   label: 'Cabaña',             icon: <MdOutlineCabin /> },
  { value: 'lumipod',  label: 'Lumipod',            icon: <img src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/lumi.svg" alt="Lumipod" className="TarjetasEcommerce-svg-icon" /> },
  { value: 'loto',     label: 'Loto',               icon: <img src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/loto%20icono.png" alt="Lumipod" className="TarjetasEcommerce-svg-icon" /> },  
  { value: 'chalet',   label: 'Chalet',             icon: <GiWoodCabin /> },
  { value: 'jacuzzi',          label: 'Jacuzzi',    icon: <FaHotTubPerson /> },
  { value: 'piscina',          label: 'Piscina',    icon: <MdPool /> },
  { value: 'malla-catamaran',  label: 'Malla Catamarán', icon: <GiFishingNet /> },
  { value: 'clima-calido',     label: 'Clima Cálido',    icon: <FaTemperatureArrowUp /> },
  { value: 'clima-frio',       label: 'Clima Frío',      icon: <FaTemperatureArrowDown /> },
  { value: 'playa',            label: 'Playa',           icon: <FaUmbrellaBeach /> },
  { value: 'naturaleza',       label: 'Naturaleza',      icon: <BsTreeFill /> },
  { value: 'en-la-montana',    label: 'En la Montaña',   icon: <PiMountainsBold /> },
  { value: 'desierto',         label: 'Desierto',        icon: <GiDesert /> },
  { value: 'caminata',         label: 'Caminata',        icon: <GiHiking /> },
  { value: 'cascada',          label: 'Cascada',         icon: <GiWaterfall /> },
  { value: 'rio',              label: 'Río',             icon: <GiRiver /> },
];

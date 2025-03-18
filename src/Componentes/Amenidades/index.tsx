"use client";

import React from "react";
import { GiTowel, GiWashingMachine, GiFireplace, GiSmokeBomb, GiThermometerHot, GiCoffeeCup, GiFishingNet, GiDesert, GiHiking, GiRiver, GiWaterfall } from "react-icons/gi";
import { IoWifi } from "react-icons/io5";
import { FaWater } from "react-icons/fa";
import { IoIosBonfire, IoIosRestaurant } from "react-icons/io";
import { TbDeviceTv } from "react-icons/tb";
import { FaFan, FaRegSnowflake, FaLaptopHouse, FaShower, FaUmbrellaBeach, FaChess, FaPumpSoap } from "react-icons/fa";
import { FaFireExtinguisher, FaKitMedical, FaKitchenSet, FaHotTubPerson, FaTemperatureArrowUp, FaTemperatureArrowDown} from "react-icons/fa6";
import { MdOutdoorGrill, MdPool, MdOutlineBathtub, MdOutlinePets } from "react-icons/md";
import { BsTreeFill, BsFillProjectorFill } from "react-icons/bs";
import { PiMountainsBold } from "react-icons/pi";
import { AiTwotoneCar } from "react-icons/ai";
import { LuRefrigerator } from "react-icons/lu";

export const opcionesAmenidades = [
  { id: "Wifi", label: "Wifi", icono: <IoWifi /> },
  { id: "Mascotas", label: "Mascotas", icono: <MdOutlinePets /> },
  { id: "Zona de trabajo", label: "Zona de trabajo", icono: <FaLaptopHouse /> },
  { id: "Desayuno", label: "Desayuno", icono: <GiCoffeeCup /> },
  { id: "Jacuzzi", label: "Jacuzzi", icono: <FaHotTubPerson /> },
  { id: "Tina", label: "Tina", icono: <MdOutlineBathtub /> },
  { id: "Piscina", label: "Piscina", icono: <MdPool /> },
  { id: "Maya catamaran", label: "Maya catamaran", icono: <GiFishingNet /> },
  { id: "Parrilla", label: "Parrilla", icono: <MdOutdoorGrill /> },
  { id: "Cocina", label: "Cocina", icono: <FaKitchenSet /> },
  { id: "Zona fogata", label: "Zona fogata", icono: <IoIosBonfire /> },
  { id: "Chimenea", label: "Chimenea", icono: <GiFireplace /> },
  { id: "Servicio restaurante", label: "Servicio restaurante", icono: <IoIosRestaurant /> },
  { id: "Mini bar", label: "Mini bar", icono: <LuRefrigerator /> },
  { id: "Tv", label: "Tv", icono: <TbDeviceTv /> },
  { id: "Proyector", label: "Proyector", icono: <BsFillProjectorFill /> },
  { id: "Toallas", label: "Toallas", icono: <GiTowel /> },  
  { id: "Jabon y shampoo", label: "Jabon y shampoo", icono: <FaPumpSoap /> },  
  { id: "Juegos de mesa", label: "Juegos de mesa", icono: <FaChess /> },  
  { id: "Lavadora", label: "Lavadora", icono: <GiWashingMachine /> },
  { id: "Clima Calido", label: "Clima Calido", icono: <FaTemperatureArrowUp /> },
  { id: "Vista al lago", label: "Vista al lago", icono: <FaWater /> },
  { id: "Ventilador", label: "Ventilador", icono: <FaFan /> },
  { id: "Aire acondicionado", label: "Aire acondicionado", icono: <FaRegSnowflake /> },
  { id: "Clima Frio", label: "Clima Frio", icono: <FaTemperatureArrowDown /> },
  { id: "Calefaccion", label: "Calefaccion", icono: <GiThermometerHot /> },
  { id: "Ducha", label: "Ducha", icono: <FaShower /> },
  { id: "Detector de humo", label: "Detector de humo", icono: <GiSmokeBomb /> },
  { id: "Extintor", label: "Extintor", icono: <FaFireExtinguisher /> },
  { id: "Botiquin", label: "Botiquin", icono: <FaKitMedical /> },
  { id: "Playa", label: "Playa", icono: <FaUmbrellaBeach /> },
  { id: "Naturaleza", label: "Naturaleza", icono: <BsTreeFill /> },
  { id: "Rio", label: "Rio", icono: <GiRiver /> },
  { id: "Cascada", label: "Cascada", icono: <GiWaterfall /> },
  { id: "En la montaña", label: "En la montaña", icono: <PiMountainsBold /> },
  { id: "Desierto", label: "Desierto", icono: <GiDesert /> },
  { id: "Caminata", label: "Caminata", icono: <GiHiking /> },
  { id: "Parqueadero", label: "Parqueadero", icono: <AiTwotoneCar /> },
];

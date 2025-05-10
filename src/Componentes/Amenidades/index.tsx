"use client";
import "./estilos.css";

// import React from "react";
import { GiRockingChair, GiWineBottle, GiTowel, GiWashingMachine, GiFireplace, GiSmokeBomb, GiThermometerHot, GiCoffeeCup, GiFishingNet, GiDesert, GiHiking, GiRiver, GiWaterfall } from "react-icons/gi";
import { IoWifi, IoTelescope, IoFastFoodOutline } from "react-icons/io5";
import { FaWater } from "react-icons/fa";
import { IoIosBonfire, IoIosRestaurant } from "react-icons/io";
import { TbDeviceTv, TbMassage } from "react-icons/tb";
import { FaToilet, FaFan, FaRegSnowflake, FaLaptopHouse, FaShower, FaUmbrellaBeach, FaChess, FaPumpSoap } from "react-icons/fa";
import { FaRadio , FaToiletsPortable, FaFireExtinguisher, FaKitMedical, FaKitchenSet, FaHotTubPerson, FaTemperatureArrowUp, FaTemperatureArrowDown} from "react-icons/fa6";
import { MdDinnerDining, MdOutdoorGrill, MdPool, MdOutlineBathtub, MdOutlinePets } from "react-icons/md";
import { BsTreeFill, BsFillProjectorFill } from "react-icons/bs";
import { PiMountainsBold } from "react-icons/pi";
import { AiTwotoneCar } from "react-icons/ai";
import { LuRefrigerator } from "react-icons/lu";

export const opcionesAmenidades = [
  { id: "wifi", label: "Wifi", icono: <IoWifi /> },
  { id: "parlante", label: "Parlante", icono: <FaRadio /> },
  { id: "mascotas", label: "Mascotas", icono: <MdOutlinePets /> },
  { id: "zona-de-trabajo", label: "Zona de trabajo", icono: <FaLaptopHouse /> },
  { id: "coctel-bienvenida", label: "Coctel bienvenida", icono: <GiWineBottle /> },  
  { id: "jacuzzi", label: "Jacuzzi", icono: <FaHotTubPerson /> },
  { id: "sauna", label: "Sauna", icono: (<img src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/sauna.svg" alt="Sauna" className="Amenidades-svg-icono" />),},
  { id: "tina", label: "Tina", icono: <MdOutlineBathtub /> },
  { id: "piscina", label: "Piscina", icono: <MdPool /> },
  { id: "malla-catamaran", label: "Malla catamaran", icono: <GiFishingNet /> },
  { id: "mesedora", label: "Mesedora", icono: <GiRockingChair /> },
  { id: "mesa-y-sillas", label: "Mesa y sillas", icono: (<img src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/mesaysillas.svg" alt="mesa y sillas" className="Amenidades-svg-icono" />),},
  { id: "zona-hamaca", label: "Zona Hamaca", icono: (<img src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/hamaca.svg" alt="Hamaca" className="Amenidades-svg-icono" />),},
  { id: "zona-masajes", label: "Zona masajes", icono: <TbMassage /> },  
  { id: "parrilla", label: "Parrilla", icono: <MdOutdoorGrill /> },
  { id: "cocina", label: "Cocina", icono: <FaKitchenSet /> },
  { id: "zona-fogata", label: "Zona fogata", icono: <IoIosBonfire /> },
  { id: "chimenea", label: "Chimenea", icono: <GiFireplace /> },
  { id: "servicio-restaurante", label: "Servicio restaurante", icono: <IoIosRestaurant /> },
  { id: "incluye-desayuno", label: "Incluye desayuno", icono: <GiCoffeeCup /> },
  { id: "incluye-almuerzo", label: "Incluye almuerzo", icono: <IoFastFoodOutline /> },
  { id: "incluye-cena", label: "Incluye cena", icono: <MdDinnerDining /> },  
  { id: "servicio-cuatrimoto", label: "Servicio cuatrimoto", icono: (<img src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/cuatrimoto.svg" alt="Cuatrimoto" className="Amenidades-svg-icono" />),},
  { id: "mini-bar", label: "Mini bar", icono: <LuRefrigerator /> },
  { id: "tv", label: "Tv", icono: <TbDeviceTv /> },
  { id: "proyector", label: "Proyector", icono: <BsFillProjectorFill /> },
  { id: "telescopio", label: "Telescopio", icono: <IoTelescope /> },  
  { id: "toallas", label: "Toallas", icono: <GiTowel /> },  
  { id: "jabon", label: "Jabon", icono: <FaPumpSoap /> },  
  { id: "bano-privado", label: "Baño privado", icono: <FaToilet /> },  
  { id: "bano-compartido", label: "Baño compartido", icono: <FaToiletsPortable /> },  
  { id: "juegos-de-mesa", label: "Juegos de mesa", icono: <FaChess /> },  
  { id: "lavadora", label: "Lavadora", icono: <GiWashingMachine /> },
  { id: "clima-calido", label: "Clima Calido", icono: <FaTemperatureArrowUp /> },
  { id: "vista-al-lago", label: "Vista al lago", icono: <FaWater /> },
  { id: "ventilador", label: "Ventilador", icono: <FaFan /> },
  { id: "aire-acondicionado", label: "Aire acondicionado", icono: <FaRegSnowflake /> },
  { id: "clima-frio", label: "Clima Frio", icono: <FaTemperatureArrowDown /> },
  { id: "calefaccion", label: "Calefaccion", icono: <GiThermometerHot /> },
  { id: "ducha", label: "Ducha", icono: <FaShower /> },
  { id: "detector-de-humo", label: "Detector de humo", icono: <GiSmokeBomb /> },
  { id: "extintor", label: "Extintor", icono: <FaFireExtinguisher /> },
  { id: "botiquin", label: "Botiquin", icono: <FaKitMedical /> },
  { id: "playa", label: "Playa", icono: <FaUmbrellaBeach /> },
  { id: "naturaleza", label: "Naturaleza", icono: <BsTreeFill /> },
  { id: "rio", label: "Rio", icono: <GiRiver /> },
  { id: "cascada", label: "Cascada", icono: <GiWaterfall /> },
  { id: "en-la-montana", label: "En la montaña", icono: <PiMountainsBold /> },
  { id: "desierto", label: "Desierto", icono: <GiDesert /> },
  { id: "caminata", label: "Caminata", icono: <GiHiking /> },
  { id: "parqueadero", label: "Parqueadero", icono: <AiTwotoneCar /> },
  
];

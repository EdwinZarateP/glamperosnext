"use client";

import { ContextoApp } from "../../context/AppContext";
import { useState, useContext, useEffect  } from "react";
import Paso1A from "./Paso1A/index";
import Paso1B from "./Paso1B/index";
import Paso1C from "./Paso1C/index";
import Paso1C_2 from "./Paso1C_2/index";
import Paso1D from "./Paso1D/index";
import Paso2A from "./Paso2A/index";
import Paso2B from "./Paso2B/index";
import Paso2C from "./Paso2C/index";
import Paso2D from "./Paso2D/index";
import Paso2E from "./Paso2E/index";
import Paso2F from "./Paso2F/index";
import Paso3A from "./Paso3A/index";
import Paso3B from "./Paso3B/index";
import Paso4A from "./Paso4A/index";
import Swal from "sweetalert2";
import { useRouter } from 'next/navigation';
import "./estilos.css";

const CreacionGlamping: React.FC = () => {
  const [pasoActual, setPasoActual] = useState<number>(0);
  const {latitud, ciudad_departamento, tipoGlamping, amenidadesGlobal,
     imagenesCargadas, nombreGlamping, setNombreGlamping, descripcionGlamping,
      precioEstandar, Cantidad_Huespedes_Adicional} = useContext(ContextoApp)!;
  const router = useRouter();
  const redirigirInicio = () => {
    router.push("/");
    router.refresh();
  };


  useEffect(() => {
    // Establecer el nombre del glamping en vacío al renderizar el componente
    setNombreGlamping("");
  }, [setNombreGlamping]);

  const pasos = [
    // <Paso3B key="Paso3B" />,
    <Paso1A key="Paso1A" />,
    <Paso1B key="Paso1B" />,
    <Paso1C key="Paso1C" />,
    <Paso1C_2 key="Paso1C_2" />,
    <Paso1D key="Paso1D" />,
    <Paso2A key="Paso2A" />,
    <Paso2B key="Paso2B" />,
    <Paso2C key="Paso2C" />,
    <Paso2D key="Paso2D" />,
    <Paso2E key="Paso2E" />,
    <Paso2F key="Paso2F" />,
    <Paso3A key="Paso3A" />,
    <Paso3B key="Paso3B" />,
    <Paso4A key="Paso4A" />,


  ];

  const avanzarPaso = () => {
    // Validar pasoActual === 7 y si no se seleccionaron imágenes
  if (pasoActual === 7) {
    if (!imagenesCargadas || imagenesCargadas.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "¡Todo entra por los ojos! 🫣",
        text: "No puedes avanzar sin seleccionar imágenes.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    if (imagenesCargadas.length < 5) {
      Swal.fire({
        icon: "warning",
        title: "¡Faltan imágenes! 🫣",
        text: "Debes seleccionar al menos 5 imágenes para continuar.",
        confirmButtonText: "Aceptar",
      });
      return;
    }
  }

    // Validación para el paso 1 y verificar si eligio tipo glamping
    if (pasoActual === 1 && !tipoGlamping) {
      Swal.fire({
        icon: "warning",
        title: "Tomala suave 🛖",
        text: "Escoge un tipo de glamping antes de continuar.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    // Validación para el paso 2 y verificar si las coordenadas están vacías
    if (pasoActual === 2 && (!latitud || latitud === 4.123456)) {
      Swal.fire({
        icon: "warning",
        title: "¡No quieres huéspedes perdidos! 😵‍💫",
        text: "Por favor selecciona una ubicación para continuar.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    // Validación para el paso 10 si la descripción está vacía
    if (pasoActual === 3 && (!ciudad_departamento || ciudad_departamento.trim() === "")) {
      Swal.fire({
        icon: "warning",
        title: "Una ayuda extra 🌍",
        text: "Saber el municipio mas cercano ayuda a tus huespedes a llegar mas fácil",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    // Validación para el paso 6 si la descripcion tiene mas de 20 palabras
    if (pasoActual === 6 && amenidadesGlobal.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Todos tenemos detallitos 🎸🎹🎺",
        text: "Dinos al menos una amenidad que dispongas",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    // Validación para el paso 9 y verificar si puso nombre
    if (
      pasoActual === 9 &&
      (!nombreGlamping || nombreGlamping.trim() === "" || !/^[\p{L}0-9 ]+$/u.test(nombreGlamping.trim()))
    ) {
      Swal.fire({
        icon: "warning",
        title: "¿Quién va sin nombre por la vida? 🪪",
        text: "Escribe un nombre válido para tu glamping que contenga solo letras, números y espacios.",
        confirmButtonText: "Aceptar",
      });
      return;
    }


    // Validación para el paso 10 si la descripción está vacía
    if (pasoActual === 10 && (!descripcionGlamping || descripcionGlamping.trim() === "")) {
      Swal.fire({
        icon: "warning",
        title: "Todos tenemos cualidades 😉",
        text: "Escribe una descripción de tu glamping antes de continuar.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    // Validación para el paso 10 si la descripción tiene menos de 50 palabras
    if (pasoActual === 10) {
      const cantidadPalabras = descripcionGlamping.trim().split(' ').filter(palabra => palabra.trim() !== '').length; 
      if (cantidadPalabras < 20) {
        Swal.fire({
          icon: "warning",
          title: "No te quedes corto 😝",
          text: "Escribe una descripción de al menos 20 palabras.",
          confirmButtonText: "Aceptar",
        });
        return;
      }
    }

// Validación para el paso 12 coloco tarifa
if (pasoActual === 12) {
  if (!precioEstandar) {
    Swal.fire({
      icon: "warning",
      title: "¡No te vayas sin colocar un precio! 💵",
      text: "Especifica el valor que quieres cobrar por una noche",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  if (precioEstandar < 60000) {
    Swal.fire({
      icon: "warning",
      title: "¡El precio debe ser al menos 60,000! 💸",
      text: "El precio estándar no puede ser menor a 60,000",
      confirmButtonText: "Aceptar",
    });
    return;
  }
}

    if (pasoActual < pasos.length - 1) {
      setPasoActual(pasoActual + 1); 
      console.log(Cantidad_Huespedes_Adicional)   
    }
  };

  const retrocederPaso = () => {
    if (pasoActual > 0) {
      setPasoActual(pasoActual - 1);
    }
  };

  const progreso = ((pasoActual + 1) / pasos.length) * 100;

  return (
    <div className="creacionGlamping-contenedor">
      <div className="creacionGlamping-paso">{pasos[pasoActual]}</div>
      <img src={"https://storage.googleapis.com/glamperos-imagenes/Imagenes/Logo%20Glamperos.webp"} alt="Glamperos logo" className="creacionGlamping-logo"  onClick={redirigirInicio}/>
      <div className="creacionGlamping-progreso">
        <div className="creacionGlamping-progreso-barra" style={{ width: `${progreso}%` }}></div>
      </div>

      <div className="creacionGlamping-controles">
        <button
          className="creacionGlamping-boton-atras"
          onClick={retrocederPaso}
          disabled={pasoActual === 0}
          style={{ visibility: pasoActual === 0 ? 'hidden' : 'visible' }} // Evita mover la UI
        >
          Atrás
        </button>

        {pasoActual !== 13 && (
          <button
            className="creacionGlamping-boton-siguiente"
            onClick={avanzarPaso}
          >
            Siguiente
          </button>
        )}
      </div>

    </div>
  );
};

export default CreacionGlamping;

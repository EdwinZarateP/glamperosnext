"use client"; // Asegura que el componente solo se renderiza en el cliente

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; 
import { ObtenerGlampingPorId } from "../../Funciones/ObtenerGlamping"; // Uso del alias "@"
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import "./estilos.css";

function FotosCollage() {
  const searchParams = useSearchParams(); // Obtener los parámetros de la URL
  const glampingId = searchParams.get("glampingId") || ""; // Obtener el ID desde query params

  const [imagenes, setImagenes] = useState<string[]>([]);
  const [ciudadDepartamento, setCiudadDepartamento] = useState<string>("");
  const [mostrarModal, setMostrarModal] = useState<boolean>(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<number>(0);
  const [activo, setActivo] = useState<boolean>(false);

  useEffect(() => {
    if (!glampingId) return;

    const consultarGlamping = async () => {
      try {
        const datos = await ObtenerGlampingPorId(glampingId);
        if (datos) {
          setImagenes(datos.imagenes || []);
          const ciudadDepto = datos.ciudad_departamento || "No disponible";
          const textoDespuesDeGuion = ciudadDepto.includes("-")
            ? ciudadDepto.split("-")[1].trim()
            : ciudadDepto;

          setCiudadDepartamento(textoDespuesDeGuion);
        }
      } catch (error) {
        console.error("Error al consultar el glamping:", error);
      }
    };

    consultarGlamping();
  }, [glampingId]);

  const abrirModal = (index: number) => {
    setImagenSeleccionada(index);
    setMostrarModal(true);
    document.body.style.overflow = "hidden"; // Bloquea el scroll
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    document.body.style.overflow = "auto"; // Restablece el scroll
  };

  const cambiarImagen = (direccion: "izquierda" | "derecha") => {
    setImagenSeleccionada((prev) => {
      if (direccion === "izquierda") {
        return Math.max(0, prev - 1);
      }
      return Math.min(imagenes.length - 1, prev + 1);
    });
  };

  const toggleActivo = () => setActivo(!activo); // Alternar el tamaño del botón

  const manejarDeslizamiento = (event: React.TouchEvent) => {
    const touchStart = event.touches[0].clientX;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const touchEnd = moveEvent.touches[0].clientX;
      if (touchStart - touchEnd > 50) {
        cambiarImagen("derecha");
      } else if (touchEnd - touchStart > 50) {
        cambiarImagen("izquierda");
      }
      moveEvent.preventDefault();
      window.removeEventListener("touchmove", handleTouchMove);
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
  };

  return (
    <div className="fotosCollage-contenedor">
      <h1>Una joya del departamento de {ciudadDepartamento} 😍</h1>
      <div className="fotosCollage-grid">
        {imagenes.map((imagen, index) => {
          let itemClass = "fotosCollage-item";
          if (index === 0) { 
            // o cualquier otro índice que quieras destacar 
            itemClass += " fotosCollage-item-span-2";
          }

          return (
            <div key={index} className={itemClass} onClick={() => abrirModal(index)}>
              <img src={imagen} alt={`Imagen ${index + 1}`} className="fotosCollage-imagen" />
            </div>
          );
        })}
      </div>

      {mostrarModal && (
        <div className="modal">
          <div className="modal-contenido" onTouchStart={manejarDeslizamiento}>
            <button className="cerrar" onClick={cerrarModal}>✖</button>

            <button
              className={`navegar izquierda ${imagenSeleccionada === 0 ? "oculta" : ""} ${activo ? "aumentar" : ""}`}
              onClick={() => { cambiarImagen("izquierda"); toggleActivo(); }}
            >
              <MdOutlineKeyboardArrowLeft size={30} />
            </button>
            <img
              src={imagenes[imagenSeleccionada]}
              alt={`Imagen ${imagenSeleccionada + 1}`}
              className="modal-imagen"
            />
            <button
              className={`navegar derecha ${imagenSeleccionada === imagenes.length - 1 ? "oculta" : ""} ${activo ? "aumentar" : ""}`}
              onClick={() => { cambiarImagen("derecha"); toggleActivo(); }}
            >
              <MdOutlineKeyboardArrowRight size={30} />
            </button>
            <div className="contador-imagenes">
              {imagenSeleccionada + 1} / {imagenes.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FotosCollage;

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import "./estilos.css";

const MAX_IMAGENES = 20;

const ModificarFotos: React.FC = () => {
  const searchParams = useSearchParams();
  const glampingId = searchParams.get("glampingId");
  
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [imagenesArchivo, setImagenesArchivo] = useState<File[]>([]);
  const [cargando, setCargando] = useState(false);
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchImagenes = async () => {
      if (!glampingId) {
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'No se encontró el ID del Glamping.',
        });
        return;
      }
      try {
        const response = await fetch(`https://glamperosapi.onrender.com/glampings/${glampingId}`);
        if (!response.ok) throw new Error("Error al obtener las imágenes del glamping");

        const data = await response.json();
        setImagenes(data.imagenes || []);
      } catch (error) {
        Swal.fire("Error", "No se pudieron cargar las imágenes del glamping.", "error");
        console.error(error);
      }
    };

    if (glampingId && glampingId.trim() !== "") {
      fetchImagenes();
    }
  }, [glampingId]);

  // Subir automáticamente cuando se añadan imágenesArchivo
  useEffect(() => {
    if (imagenesArchivo.length > 0) {
      cargarImagenes();
    }
  }, [imagenesArchivo]);

  // --------- REORGANIZAR IMÁGENES ---------
  const reorganizarImagenesEnAPI = async (nuevoOrdenImagenes: string[]) => {
    try {
      if (!glampingId) {
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'No se encontró el ID del Glamping.',
        });
        return;
      }
      const response = await fetch(
        `https://glamperosapi.onrender.com/glampings/${glampingId}/reorganizar_imagenes`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(nuevoOrdenImagenes),
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error de la API:", errorResponse);
        throw new Error(
          errorResponse.detail
            ? JSON.stringify(errorResponse.detail)
            : "Error al reorganizar las imágenes"
        );
      }

      const data = await response.json();
      setImagenes(data.imagenes || []);
    } catch (error: any) {
      Swal.fire("Error", error.message || "Error al reorganizar las imágenes.", "error");
      console.error("Error detallado:", error.message || error);
    }
  };

  const manejarArrastre = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    const targetIndex = parseInt(e.dataTransfer.getData("index"), 10);
    if (isNaN(targetIndex) || targetIndex === index || targetIndex >= imagenes.length) return;

    const nuevoOrden = [...imagenes];
    [nuevoOrden[index], nuevoOrden[targetIndex]] = [
      nuevoOrden[targetIndex],
      nuevoOrden[index],
    ];

    setImagenes(nuevoOrden);
    reorganizarImagenesEnAPI(nuevoOrden);
  };

  // --------- ELIMINAR IMAGEN ---------
  const eliminarImagen = async (imagenUrl: string) => {
    if (!glampingId) {
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'No se encontró el ID del Glamping.',
      });
      return;
    }
    try {
      const response = await fetch(
        `https://glamperosapi.onrender.com/glampings/${glampingId}/imagenes?imagen_url=${encodeURIComponent(
          imagenUrl
        )}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.detail || "Error al eliminar la imagen");
      }

      setImagenes(imagenes.filter((img) => img !== imagenUrl));
    } catch (error: any) {
      Swal.fire("Error", error.message || "No se pudo eliminar la imagen.", "error");
    }
  };

  // --------- ROTAR IMAGEN ---------
  const rotarImagen = async (imagenUrl: string, grados: number) => {
    if (!glampingId) {
      Swal.fire("Error", "No se encontró el ID del Glamping.", "error");
      return;
    }
    try {
      // Llamamos a nuestro endpoint de rotación en el backend
      const response = await fetch(
        `https://glamperosapi.onrender.com/glampings/${glampingId}/rotate_image`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imagenUrl, grados }),
        }
      );
  
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.detail || "Error al rotar la imagen");
      }
  
      // Recibir la nueva URL de la imagen
      const data = await response.json();
      const nuevaUrl = data.nueva_url;
  
      // Reemplazar la imagen antigua por la nueva en el estado
      setImagenes((prevImagenes) =>
        prevImagenes.map((img) => (img === imagenUrl ? nuevaUrl : img))
      );
  
      // window.location.reload();
    } catch (error: any) {
      Swal.fire("Error", error.message || "No se pudo rotar la imagen.", "error");
    }
  };  

  // --------- SUBIR IMÁGENES ---------
  const cargarImagenes = async () => {
    if (!glampingId) {
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'No se encontró el ID del Glamping.',
      });
      return;
    }

    if (imagenesArchivo.length === 0) return;

    if (imagenes.length + imagenesArchivo.length > MAX_IMAGENES) {
      Swal.fire(
        "Error",
        `No puedes añadir más de ${MAX_IMAGENES} imágenes.`,
        "error"
      );
      return;
    }

    const imagenesValidas: File[] = [];
    for (let archivo of imagenesArchivo) {
      if (!archivo.type.startsWith("image/")) {
        Swal.fire("Error", "Solo se permiten imágenes (JPEG, PNG, GIF)", "error");
        continue;
      }

      if (archivo.size > 10 * 1024 * 1024) {
        Swal.fire(
          "Sabemos que eres full HD",
          "Pero algunas imágenes no se subieron porque superan el tamaño máximo de 10MB",
          "info"
        );
        continue;
      }
      imagenesValidas.push(archivo);
    }

    if (imagenesValidas.length === 0) return;

    const formData = new FormData();
    imagenesValidas.forEach((archivo) => formData.append("imagenes", archivo));
    setCargando(true);

    try {
      const response = await fetch(
        `https://glamperosapi.onrender.com/glampings/${glampingId}/imagenes`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.detail || "Error al cargar las imágenes");
      }

      const data = await response.json();
      setImagenes(data.imagenes || []);
      setImagenesArchivo([]);
    } catch (error: any) {
      Swal.fire(
        "Error",
        error.message || "No se pudieron cargar las imágenes.",
        "error"
      );
    } finally {
      setCargando(false);
    }
  };

  // Función para abrir el input file al hacer clic en el botón
  const seleccionarImagenes = () => {
    inputFileRef.current?.click();
  };

  return (
    <div className="ModificarFotos-contenedor">
      {imagenes.length === 0 ? (
        <p>No hay imágenes para mostrar.</p>
      ) : (
        <div className="ModificarFotos-lista">
          {imagenes.map((url, index) => (
            <div
              key={index}
              className="ModificarFotos-item"
              draggable
              onDragStart={(e) => e.dataTransfer.setData("index", index.toString())}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => manejarArrastre(e, index)}
            >
              <div className="ModificarFotos-imagen-contenedor">
                <img
                  src={url}
                  alt={`Imagen ${index}`}
                  className="ModificarFotos-imagen"
                />
                {/* Botón eliminar */}
                <button
                  className="ModificarFotos-boton-eliminar"
                  onClick={() => eliminarImagen(url)}
                  title="Eliminar imagen"
                >
                  🗑️
                </button>
                {/* Botón rotar */}
                <button
                  className="ModificarFotos-boton-rotar"
                  onClick={() => rotarImagen(url, 90)}
                  title="Rotar 90°"
                >
                  🔄
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p>{`Imágenes actuales: ${imagenes.length} / ${MAX_IMAGENES}`}</p>
      <div className="ModificarFotos-agregar">
        <button className="ModificarFotos-boton" onClick={seleccionarImagenes}>
          Seleccionar imágenes
        </button>
        {/* El input file está oculto */}
        <input
          ref={inputFileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => setImagenesArchivo(Array.from(e.target.files || []))}
        />
        {cargando && <p>Estamos cargando tus imágenes...</p>}
      </div>
    </div>
  );
};

export default ModificarFotos;

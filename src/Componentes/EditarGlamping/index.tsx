"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Se agregó useSearchParams
import Cookies from "js-cookie";
import "./estilos.css";

const EditarGlamping = () => {
  const [glampings, setGlampings] = useState<{ id: string; nombreGlamping: string }[]>([]); 
  const [selectedGlamping, setSelectedGlamping] = useState<string>(""); 
  const router = useRouter(); 
  const searchParams = useSearchParams(); // Manejo de query params en Next.js

  // Obtener el propietarioId desde los query params o cookies
  const propietarioId = searchParams.get("propietarioId") || Cookies.get("idUsuario") || ""; 

  useEffect(() => {
    if (!propietarioId) {
      console.error("No se ha encontrado el propietarioId.");
      return;
    }

    // Función para consultar los glampings de la API
    const consultarGlampings = async () => {
      try {
        const response = await fetch(
          `https://glamperosapi.onrender.com/glampings/por_propietario/${propietarioId}`
        );
        const data = await response.json();
        // Extraemos tanto el nombre como el _id
        const glampingsData = data.map((glamping: { _id: string; nombreGlamping: string }) => ({
          id: glamping._id,
          nombreGlamping: glamping.nombreGlamping,
        }));
        setGlampings(glampingsData);
      } catch (error) {
        console.error("Error al consultar glampings:", error);
      }
    };

    consultarGlampings();
  }, [propietarioId]);

  // Función para manejar la selección del glamping y redirigir
  const manejarSeleccion = () => {
    if (selectedGlamping) {
      router.push(`/Modificacion?glampingId=${selectedGlamping}`); // Uso de query params en lugar de ruta dinámica
    }
  };

  return (
    <div className="EditarGlamping">
      <h2 className="EditarGlamping-titulo">Edita la información de tu Glamping</h2>
      <div className="EditarGlamping-lista">
        <label htmlFor="glampingSelect" className="EditarGlamping-label">
          Selecciona un Glamping
        </label>
        <select
          id="glampingSelect"
          className="EditarGlamping-select"
          value={selectedGlamping}
          onChange={(e) => setSelectedGlamping(e.target.value)}
        >
          <option value="">-- Selecciona un glamping --</option>
          {glampings.map((glamping, index) => (
            <option key={index} value={glamping.id}>
              {glamping.nombreGlamping}
            </option>
          ))}
        </select>
      </div>
      <button
        className="EditarGlamping-boton"
        onClick={manejarSeleccion}
        disabled={!selectedGlamping}
      >
        Ir a Modificación
      </button>
    </div>
  );
};

export default EditarGlamping;

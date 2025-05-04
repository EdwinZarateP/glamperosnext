"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";

import "./estilos.css";

const EditarGlamping = () => {
  const [glampings, setGlampings] = useState<{ id: string; nombreGlamping: string }[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Se obtiene el propietarioId desde los query params o Cookies
  const propietarioId = searchParams.get("propietarioId") || Cookies.get("idUsuario") || "";

  useEffect(() => {
    if (!propietarioId) {
      console.error("No se ha encontrado el propietarioId.");
      return;
    }

    // Función para consultar los glampings del propietario
    const consultarGlampings = async () => {
      try {
        const response = await fetch(
          `https://glamperosapi.onrender.com/glampings/por_propietario/${propietarioId}`
        );
        const data = await response.json();
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

  return (
    <div className="EditarGlamping">
      <h2 className="EditarGlamping-titulo">Edita la información de tu Glamping</h2>
      <div className="EditarGlamping-lista">
        {glampings.map((glamping, index) => (
          <div key={index} className="EditarGlamping-item">
            <span className="EditarGlamping-nombre">{glamping.nombreGlamping}</span>
            <button
              className="EditarGlamping-boton"
              onClick={() => router.push(`/Modificacion?glampingId=${glamping.id}`)}
            >
              Información
            </button>
            <button
              className="EditarGlamping-boton"
              onClick={() => router.push(`/calendario?glampingId=${glamping.id}`)}
            >
              Calendario 📅
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditarGlamping;

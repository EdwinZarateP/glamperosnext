"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import "./estilos.css";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

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
         `${API_BASE}/usuarios/${propietarioId}/glampings`
        );
        const data = await response.json();
        const glampingsData = data.map((g: { id: string; nombreGlamping: string }) => ({
          id: g.id,
          nombreGlamping: g.nombreGlamping,
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
            <div className="EditarGlamping-botones">
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditarGlamping;

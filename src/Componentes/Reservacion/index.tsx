"use client";

import { useEffect, useState, useContext } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { decryptData } from "@/Funciones/Encryptacion";
import { ObtenerGlampingPorId } from "@/Funciones/ObtenerGlamping";
import { CrearReserva } from "@/Funciones/CrearReserva";
import { ObtenerUsuarioPorId } from "@/Funciones/ObtenerUsuario";
import { ContextoApp } from "@/context/AppContext";
import Politicas from "@/Componentes/Politica/index";
import Cookies from "js-cookie";
import "./estilos.css";

interface Glamping {
  nombreGlamping: string;
  ciudad_departamento: string;
  imagenes: string[] | string | null;
  propietario_id: string;
  diasCancelacion: number;
}

interface Propietario {
  nombreDueno: string;
  whatsapp: string;
  correoPropietario: string;
}

const Reservacion = () => {
  const contexto = useContext(ContextoApp);
  const searchParams = useSearchParams();
  const router = useRouter();
  const id_Cliente = Cookies.get("idUsuario");

  if (!contexto) {
    throw new Error("ContextoApp no está disponible. Asegúrate de envolver tu aplicación con <ProveedorVariables>");
  }

  // Extraemos los valores de query parameters y los desencriptamos
  const glampingId = searchParams.get("glampingId") ?? "";
  const fechaInicioDesencriptada = searchParams.get("fechaInicio") ? decryptData(decodeURIComponent(searchParams.get("fechaInicio")!)) : "";
  const fechaFinDesencriptada = searchParams.get("fechaFin") ? decryptData(decodeURIComponent(searchParams.get("fechaFin")!)) : "";
  const totalFinalDesencriptado = searchParams.get("totalFinal") ? decryptData(decodeURIComponent(searchParams.get("totalFinal")!)) : "0";
  const tarifaDesencriptada = searchParams.get("tarifa") ? decryptData(decodeURIComponent(searchParams.get("tarifa")!)) : "0";
  const totalDiasDesencriptados = searchParams.get("totalDias") ? decryptData(decodeURIComponent(searchParams.get("totalDias")!)) : "0";
  const adultosDesencriptados = searchParams.get("adultos") ? decryptData(decodeURIComponent(searchParams.get("adultos")!)) : "0";
  const ninosDesencriptados = searchParams.get("ninos") ? decryptData(decodeURIComponent(searchParams.get("ninos")!)) : "0";
  const bebesDesencriptados = searchParams.get("bebes") ? decryptData(decodeURIComponent(searchParams.get("bebes")!)) : "0";
  const mascotasDesencriptadas = searchParams.get("mascotas") ? decryptData(decodeURIComponent(searchParams.get("mascotas")!)) : "0";

  const [glamping, setGlamping] = useState<Glamping | null>(null);
  const [propietario, setPropietario] = useState<Propietario | null>(null);
  const { verPolitica, setVerPolitica } = contexto;

  useEffect(() => {
    const fetchGlamping = async () => {
      if (glampingId) {
        const data: Glamping = await ObtenerGlampingPorId(glampingId);
        setGlamping(data);
      }
    };
    fetchGlamping();
  }, [glampingId]);

  useEffect(() => {
    const fetchPropietario = async () => {
      if (glamping?.propietario_id) {
        const data = await ObtenerUsuarioPorId(glamping.propietario_id);
        setPropietario({
          nombreDueno: data.nombre || "Usuario sin nombre",
          whatsapp: data.telefono || "Usuario sin teléfono",
          correoPropietario: data.email || "Usuario sin correo",
        });
      }
    };
    fetchPropietario();
  }, [glamping]);

  const formatoPesos = (valor: number): string => {
    return `${valor.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    })}`;
  };

  const handleConfirmarReserva = async () => {
    if (!glamping) {
      console.error("No se encontraron datos del glamping.");
      return;
    }

    console.log(propietario?.nombreDueno)
    
    const rutaGracias = await CrearReserva({
      idCliente: id_Cliente?? "sin id", 
      idPropietario: glamping.propietario_id ?? "Propietario no registrado",
      idGlamping: glampingId,
      ciudad_departamento: glamping.ciudad_departamento ?? "No tiene ciudad_departamento",
      fechaInicio: fechaInicioDesencriptada ? new Date(fechaInicioDesencriptada) : new Date(),
      fechaFin: fechaFinDesencriptada ? new Date(fechaFinDesencriptada) : new Date(),
      totalDiasNum: Number(totalDiasDesencriptados),
      precioConTarifaNum: Number(totalFinalDesencriptado),
      TarifaGlamperosNum: Number(tarifaDesencriptada),
      adultosDesencriptados,
      ninosDesencriptados,
      bebesDesencriptados,
      mascotasDesencriptadas,
    });
  
    if (rutaGracias) {
      router.push(`/Gracias?fechaInicio=${fechaInicioDesencriptada}&fechaFin=${fechaFinDesencriptada}`);
    } else {
      console.error("Error al procesar la reserva.");
    }
  };

  return (
    <div className="Reservacion-contenedor">
      {glamping && (
        <div className="Reservacion-card">
          <div className="Reservacion-imagen-container">
            <img
              src={Array.isArray(glamping.imagenes) ? glamping.imagenes[0] ?? undefined : glamping.imagenes ?? undefined}
              alt={glamping.nombreGlamping}
              className="Reservacion-imagen"
            />
            <div className="Reservacion-info-superpuesta">
              <h1>{glamping.nombreGlamping}</h1>
              <p>{glamping.ciudad_departamento}</p>
            </div>
          </div>

          <div className="Reservacion-detalles">
            <div className="Reservacion-factura">
              <h3>Detalles de la Reserva</h3>
              <p><strong>{formatoPesos(Math.round(Number(totalFinalDesencriptado) / Number(totalDiasDesencriptados)))} / noche</strong></p>              
              <p>
                {new Date(`${fechaInicioDesencriptada}T12:00:00`).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })} -{" "}
                {new Date(`${fechaFinDesencriptada}T12:00:00`).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p>
                {adultosDesencriptados} Adultos, {ninosDesencriptados} Niños, {bebesDesencriptados} Bebés, {mascotasDesencriptadas} Mascotas
              </p>
              <p>Tarifa de Glamperos: <strong>{formatoPesos(Math.round(Number(tarifaDesencriptada)))}</strong></p>
              <p className="Reservacion-total">Total: <strong>{formatoPesos(Math.round(Number(totalFinalDesencriptado)))}</strong></p>
            </div>

            <button className="Reservacion-boton" onClick={handleConfirmarReserva}>Confirmar y pagar</button>

            <div className="Reservacion-politicas">
              <span onClick={() => setVerPolitica(true)}>Ver Políticas de Cancelación</span>
            </div>
          </div>
        </div>
      )}
      
      {verPolitica && (
        <Politicas diasCancelacion={glamping?.diasCancelacion ?? 5} fechaInicio={new Date(fechaInicioDesencriptada)} />
      )}
    </div>
  );
};

export default Reservacion;

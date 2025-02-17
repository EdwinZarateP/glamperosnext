"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { decryptData } from "@/Funciones/Encryptacion";
import { ObtenerGlampingPorId } from "@/Funciones/ObtenerGlamping";
import { ObtenerUsuarioPorId } from "@/Funciones/ObtenerUsuario";
import "./estilos.css";

interface Glamping {
  nombreGlamping: string;
  ciudad_departamento: string;
  imagenes: string[] | string | null;
  propietario_id: string;
}

interface Propietario {
  nombreDueno: string;
  whatsapp: string;
  correoPropietario: string;
}

const Reservacion = () => {
  const params = useParams();
  const parametros = Object.values(params);

  const [
    glampingId = "",
    fechaInicioEncriptada = "",
    fechaFinEncriptada = "",
    totalFinalEncriptado = "",
    tarifaEncriptada = "",
    totalDiasEncriptados = "",
    adultosEncriptados = "",
    ninosEncriptados = "",
    bebesEncriptados = "",
    mascotasEncriptadas = "",
  ] = parametros.map(param => (Array.isArray(param) ? param[0] : param) ?? "");

  const fechaInicioDesencriptada = fechaInicioEncriptada ? decryptData(decodeURIComponent(fechaInicioEncriptada)) : "0";
  const fechaFinDesencriptada = fechaFinEncriptada ? decryptData(decodeURIComponent(fechaFinEncriptada)) : "0";
  const totalFinalDesencriptado = totalFinalEncriptado ? decryptData(decodeURIComponent(totalFinalEncriptado)) : "0";
  const tarifaDesencriptada = tarifaEncriptada ? decryptData(decodeURIComponent(tarifaEncriptada)) : "0";
  const adultosDesencriptados = adultosEncriptados ? decryptData(decodeURIComponent(adultosEncriptados)) : "0";
  const ninosDesencriptados = ninosEncriptados ? decryptData(decodeURIComponent(ninosEncriptados)) : "0";
  const bebesDesencriptados = bebesEncriptados ? decryptData(decodeURIComponent(bebesEncriptados)) : "0";
  const mascotasDesencriptadas = mascotasEncriptadas ? decryptData(decodeURIComponent(mascotasEncriptadas)) : "0";

  const [glamping, setGlamping] = useState<Glamping | null>(null);
  const [propietario, setPropietario] = useState<Propietario | null>(null);

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
    console.log(propietario?.correoPropietario)
    return `${valor.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    })}`;
  };

return (
    <div className="Reservacion-contenedor">
      {glamping && (
        <div className="Reservacion-card">
          {/* Contenedor de imagen con nombre del glamping encima */}
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

          {/* Detalles de la reserva */}
          <div className="Reservacion-detalles">
            <div className="Reservacion-factura">
              <h3>Detalles de la Reserva</h3>
              <p><strong>{formatoPesos(Math.round(Number(totalFinalDesencriptado) / Number(totalDiasEncriptados)))} / noche</strong></p>
              <p>{new Date(fechaInicioDesencriptada).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })} - {new Date(fechaFinDesencriptada).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</p>
              <p>

                {adultosDesencriptados && `${Number(adultosDesencriptados)} ${Number(adultosDesencriptados) === 1 ? 'Adulto' : 'Adultos'}`}
                {ninosDesencriptados && Number(ninosDesencriptados) > 0 && `, ${ninosDesencriptados} ${Number(ninosDesencriptados) === 1 ? 'Niño' : 'Niños'}`}
                {bebesDesencriptados && Number(bebesDesencriptados) > 0 && `, ${bebesDesencriptados} ${Number(bebesDesencriptados) === 1 ? 'Bebé' : 'Bebés'}`}                  
                {mascotasDesencriptadas && Number(mascotasDesencriptadas) > 0 && ` y ${mascotasDesencriptadas} Mascota${Number(mascotasDesencriptadas) > 1 ? "s" : ""}`}
              </p>
              <p>Precio por {totalDiasEncriptados} noche(s): <strong>{formatoPesos(Math.round(parseFloat(totalFinalDesencriptado) - parseFloat(tarifaDesencriptada)))}</strong></p>
              <p>Tarifa de Glamperos: <strong>{formatoPesos(Math.round(Number(tarifaDesencriptada)))}</strong></p>
              <p className="Reservacion-total">Total: <strong>{formatoPesos(Math.round(Number(totalFinalDesencriptado)))}</strong></p>
            </div>

            <button className="Reservacion-boton">Confirmar y pagar</button>
            <p className="Reservacion-politicas">Ver Políticas de Cancelación</p>
          </div>
        </div>
      )}



    </div>
  );
};

export default Reservacion;
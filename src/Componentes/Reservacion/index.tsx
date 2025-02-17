"use client";

import { useEffect, useState, useContext} from "react";
import { useParams } from "next/navigation";
import { decryptData } from "@/Funciones/Encryptacion";
import { ObtenerGlampingPorId } from "@/Funciones/ObtenerGlamping";
import { CrearReserva } from "@/Funciones/CrearReserva";
import { ObtenerUsuarioPorId } from "@/Funciones/ObtenerUsuario";
import { ContextoApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import Politicas from "@/Componentes/Politica/index";
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
  
  const router = useRouter();
  const fechaInicioDesencriptada = fechaInicioEncriptada ? decryptData(decodeURIComponent(fechaInicioEncriptada)) : "0";
  const fechaFinDesencriptada = fechaFinEncriptada ? decryptData(decodeURIComponent(fechaFinEncriptada)) : "0";
  const totalFinalDesencriptado = totalFinalEncriptado ? decryptData(decodeURIComponent(totalFinalEncriptado)) : "0";
  const tarifaDesencriptada = tarifaEncriptada ? decryptData(decodeURIComponent(tarifaEncriptada)) : "0";
  const totalDiasDesencriptados = totalDiasEncriptados ? decryptData(decodeURIComponent(totalDiasEncriptados)) : "0";
  const adultosDesencriptados = adultosEncriptados ? decryptData(decodeURIComponent(adultosEncriptados)) : "0";
  const ninosDesencriptados = ninosEncriptados ? decryptData(decodeURIComponent(ninosEncriptados)) : "0";
  const bebesDesencriptados = bebesEncriptados ? decryptData(decodeURIComponent(bebesEncriptados)) : "0";
  const mascotasDesencriptadas = mascotasEncriptadas ? decryptData(decodeURIComponent(mascotasEncriptadas)) : "0";

  const [glamping, setGlamping] = useState<Glamping | null>(null);
  const [propietario, setPropietario] = useState<Propietario | null>(null);
  
  if (!contexto) {
    throw new Error("ContextoApp no está disponible. Asegúrate de envolver tu aplicación con <ProveedorVariables>");
  }

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
    console.log(propietario?.correoPropietario)
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
  
    const rutaGracias = await CrearReserva({
      idCliente: "123456", // Reemplaza con el ID real del cliente
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
      // window.location.href = rutaGracias;
      router.push(`/Gracias/${fechaInicioDesencriptada}/${fechaFinDesencriptada}`);
    } else {
      console.error("Error al procesar la reserva.");
    }
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
                {adultosDesencriptados && `${Number(adultosDesencriptados)} ${Number(adultosDesencriptados) === 1 ? 'Adulto' : 'Adultos'}`}
                {ninosDesencriptados && Number(ninosDesencriptados) > 0 && `, ${ninosDesencriptados} ${Number(ninosDesencriptados) === 1 ? 'Niño' : 'Niños'}`}
                {bebesDesencriptados && Number(bebesDesencriptados) > 0 && `, ${bebesDesencriptados} ${Number(bebesDesencriptados) === 1 ? 'Bebé' : 'Bebés'}`}                  
                {mascotasDesencriptadas && Number(mascotasDesencriptadas) > 0 && ` y ${mascotasDesencriptadas} Mascota${Number(mascotasDesencriptadas) > 1 ? "s" : ""}`}
              </p>
              <p>
                Precio por {totalDiasDesencriptados} {Number(totalDiasDesencriptados) > 1 ? "noches" : "noche"}: 
                <strong> {formatoPesos(Math.round(parseFloat(totalFinalDesencriptado) - parseFloat(tarifaDesencriptada)))}</strong>
              </p>
              <p>Tarifa de Glamperos: <strong>{formatoPesos(Math.round(Number(tarifaDesencriptada)))}</strong></p>
              <p className="Reservacion-total">Total: <strong>{formatoPesos(Math.round(Number(totalFinalDesencriptado)))}</strong></p>
            </div>

            <button className="Reservacion-boton" 
              onClick={handleConfirmarReserva}>Confirmar y pagar
            </button>
            
            <div className="Reservacion-politicas">
            <span  onClick={() => setVerPolitica(true)}>
              Ver Políticas de Cancelación
            </span>
          </div>

          </div>
        </div>
      )}
        
      {/* Modal emergente de Políticas */}
      {verPolitica && (
        <div className="modal-overlay">
          <div className="modal-content">
          <Politicas 
            diasCancelacion={glamping?.diasCancelacion ?? 5} 
            fechaInicio={fechaInicioDesencriptada ? new Date(fechaInicioDesencriptada) : new Date()}
          />  
          </div>
        </div>
      )}

    </div>
  );
};

export default Reservacion;
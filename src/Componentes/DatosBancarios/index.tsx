"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import TraerDatosBancarios, { DatosBancariosProps } from "@/Funciones/TraerDatosBancarios";
import dynamic from "next/dynamic";
import animationData from "@/Componentes/Animaciones/AnimationPuntos.json";
import "./estilos.css";


interface MyLottieProps {
  animationData: unknown;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
}

// Transformamos la importación de `lottie-react` a un componente que acepte MyLottieProps
const Lottie = dynamic<MyLottieProps>(
  () =>
    import("lottie-react").then((mod) => {
      // forzamos el default a un componente tipado
      return mod.default as React.ComponentType<MyLottieProps>;
    }),
  {
    ssr: false,
  }
);

const DatosBancarios = () => {
  const idUsuario = Cookies.get("idUsuario") || ""; // Asegurar que sea string

  const [datos, setDatos] = useState<DatosBancariosProps | null>(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [certificadoBancario, setCertificadoBancario] = useState<File | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!idUsuario) return;
      setCargando(true);
      try {
        const datosBancarios = await TraerDatosBancarios(idUsuario);
        if (datosBancarios) {
          setDatos(datosBancarios);
        }
      } catch (error) {
        setMensaje("Error al obtener los datos bancarios.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [idUsuario]);

  const manejarCambioArchivo = (evento: React.ChangeEvent<HTMLInputElement>) => {
    if (evento.target.files && evento.target.files.length > 0) {
      setCertificadoBancario(evento.target.files[0]);
    }
  };

  const manejarEnvio = async () => {
    if (!idUsuario || !datos) {
      setMensaje("No se encontraron datos para actualizar.");
      return;
    }

    setCargando(true);

    const formData = new FormData();
    formData.append("numeroCuenta", datos.numeroCuenta);
    formData.append("tipoCuenta", datos.tipoCuenta);
    formData.append("banco", datos.banco);
    if (certificadoBancario) {
      formData.append("certificadoBancario", certificadoBancario);
    }

    try {
      const respuesta = await axios.put(
        `https://glamperosapi.onrender.com/usuarios/${idUsuario}/banco`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMensaje(respuesta.data.message);
    } catch (error) {
      setMensaje("Error al actualizar los datos bancarios.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="DatosBancarios-contenedor">
      {cargando ? (
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{ height: 200, width: "100%", margin: "auto" }}
        />
      ) : datos ? (
        <>
          <h2 className="DatosBancarios-titulo">Actualizar Datos Bancarios</h2>

          {/* Mostrar imagen del certificado si existe */}
          {datos.certificadoBancario && (
            <div className="DatosBancarios-certificado">
              <p>Certificado Bancario:</p>
              <img src={datos.certificadoBancario} alt="Certificado Bancario" className="CertificadoBancario-img" />              
            </div>
          )}

          {/* Select para el Banco */}
          <select
            className="DatosBancarios-input"
            value={datos.banco}
            onChange={(e) => setDatos({ ...datos, banco: e.target.value })}
          >
            <option value="Bancolombia">Bancolombia</option>
            <option value="Davivienda">Davivienda</option>
            <option value="Banco de Bogota">Banco de Bogotá</option>
            <option value="Banco de Occidente">Banco de Occidente</option>
            <option value="Nu Bank">Nu Bank</option>
            <option value="BBVA">BBVA</option>
            <option value="Banco Caja Social">Banco Caja Social</option>
            <option value="Citibank">Citibank</option>
          </select>

          {/* Select para el Tipo de Cuenta */}
          <select
            className="DatosBancarios-input"
            value={datos.tipoCuenta}
            onChange={(e) => setDatos({ ...datos, tipoCuenta: e.target.value })}
          >
            <option value="ahorros">Ahorros</option>
            <option value="corriente">Corriente</option>
          </select>

          {/* Input para el Número de Cuenta */}
          <input
            className="DatosBancarios-input"
            type="text"
            placeholder="Número de Cuenta"
            value={datos.numeroCuenta}
            onChange={(e) => setDatos({ ...datos, numeroCuenta: e.target.value.replace(/\D/g, "") })}
          />

          {/* Input para subir un nuevo certificado */}
          <input className="DatosBancarios-input" type="file" accept="image/*" onChange={manejarCambioArchivo} />

          {/* Botón para enviar */}
          <button className="DatosBancarios-boton" onClick={manejarEnvio}>
            Actualizar
          </button>

          {/* Mensaje de confirmación o error */}
          {mensaje && <p className="DatosBancarios-mensaje">{mensaje}</p>}
        </>
      ) : (
        <p>No se encontraron datos bancarios.</p>
      )}
    </div>
  );
};

export default DatosBancarios;

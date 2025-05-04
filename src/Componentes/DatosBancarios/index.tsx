"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

import TraerDatosBancarios, { DatosBancariosProps } from "../../Funciones/TraerDatosBancarios";
import dynamic from "next/dynamic";
import animationData from "../../Componentes/Animaciones/AnimationPuntos.json";
import Swal from "sweetalert2";
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
  const idUsuario = Cookies.get("idUsuario") || "";

  // Estado para los datos del formulario
  const [datos, setDatos] = useState<DatosBancariosProps>({
    banco: "",
    numeroCuenta: "",
    tipoCuenta: "",
    tipoDocumento: "",
    numeroDocumento: "",
    nombreTitular: "",
    
  });

  // Estado para saber si ya hay datos registrados en la BD
  const [yaRegistrado, setYaRegistrado] = useState(false);

  // Estados para manejar carga, guardado y mensajes
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      if (!idUsuario) return;
      setCargando(true);
      try {
        const datosBancarios = await TraerDatosBancarios(idUsuario);
        // Si la API retorna datos y el campo 'banco' no está vacío, el usuario ya tiene datos registrados
        if (datosBancarios && datosBancarios.banco) {
          setDatos({
            banco: datosBancarios.banco,
            numeroCuenta: datosBancarios.numeroCuenta || "",
            tipoCuenta: datosBancarios.tipoCuenta || "",
            tipoDocumento: datosBancarios.tipoDocumento || "",
            numeroDocumento: datosBancarios.numeroDocumento || "",
            nombreTitular: datosBancarios.nombreTitular || "",            
          });
          setYaRegistrado(true);
        } else {
          // No hay datos en la BD, se inicializan vacíos
          setDatos({
            banco: "",
            numeroCuenta: "",
            tipoCuenta: "",
            tipoDocumento: "",
            numeroDocumento: "",
            nombreTitular: "",
          });
          setYaRegistrado(false);
        }
      } catch (error) {
        setMensaje("Error al obtener los datos bancarios.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [idUsuario]);

  const manejarEnvio = async () => {
    // Validar que todos los campos requeridos estén completos
    if (!idUsuario) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontró el usuario.",
      });
      return;
    }

    if (!datos.tipoDocumento || !datos.banco || !datos.tipoCuenta || !datos.numeroCuenta || !datos.numeroDocumento || !datos.nombreTitular ) {
      Swal.fire({
        icon: "error",
        title: "Campos incompletos",
        text: "Por favor, completa todos los campos.",
      });
      return;
    }

    setGuardando(true);
    try {
      const respuesta = await axios.put(
        `https://glamperosapi.onrender.com/usuarios/${idUsuario}/banco`,
        {
          banco: datos.banco,
          numeroCuenta: datos.numeroCuenta,
          tipoCuenta: datos.tipoCuenta,
          tipoDocumento: datos.tipoDocumento,
          numeroDocumento: datos.numeroDocumento,
          nombreTitular: datos.nombreTitular,
        }
      );
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: respuesta.data.message,
      });
      setYaRegistrado(true);
      setMensaje(respuesta.data.message);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al actualizar los datos bancarios.",
      });
      setMensaje("Error al actualizar los datos bancarios.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="DatosBancarios-contenedor">
      {cargando ? (
        <div className="DatosBancarios-loader">
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{ height: 200, width: "100%", margin: "auto" }}
          />
          <p className="DatosBancarios-mensaje">Cargando datos bancarios...</p>
        </div>
      ) : yaRegistrado ? (
        <>
          <h2 className="DatosBancarios-titulo">Datos Bancarios Registrados</h2>
          <p className="DatosBancarios-mensaje">
            Tienes una cuenta bancaria registrada. Si necesitas modificarla, envía un correo a{" "}
            <strong>soporte@glamperos.com</strong> o contáctanos por WhatsApp al{" "}
            <strong>+57 321 8695196</strong>.
          </p>
          <div className="DatosBancarios-resumen">
            <p><strong>Nombre del Titular:</strong> {datos.nombreTitular}</p>
            <p><strong>Tipo de Documento:</strong> {datos.tipoDocumento}</p>
            <p><strong>Numero de Documento:</strong> {datos.numeroDocumento}</p>
            <p><strong>Banco:</strong> {datos.banco}</p>
            <p><strong>Tipo de Cuenta:</strong> {datos.tipoCuenta}</p>
            <p><strong>Número de Cuenta:</strong> {datos.numeroCuenta}</p>            
          </div>
        </>
      ) : (
        <>
          <h2 className="DatosBancarios-titulo">Registrar Datos Bancarios</h2>

          <label className="DatosBancarios-etiqueta">Nombre Titular</label>
          <input
            className="DatosBancarios-input-Cuenta"
            type="text"
            placeholder="Nombre del Titular"
            value={datos.nombreTitular || ""}
            onChange={(e) =>
              setDatos((prev) => ({
                ...prev,
                nombreTitular: e.target.value, // Permite cualquier caracter
              }))
            }            
          />          

          <label className="DatosBancarios-etiqueta">Tipo de Documento</label>
          <select
            className="DatosBancarios-input"
            value={datos.tipoDocumento || ""}
            onChange={(e) =>
              setDatos((prev) => ({ ...prev, tipoDocumento: e.target.value }))
            }
          >
            <option value="">Selecciona un tipo de documento</option>
            <option value="CC">Cédula de Ciudadanía</option>
            <option value="NIT">NIT</option>
            <option value="CE">Cédula de Extranjería</option>
          </select>

          <label className="DatosBancarios-etiqueta">Número de Documento</label>
          <input
            className="DatosBancarios-input-Cuenta"
            type="text"
            placeholder="Número de Documento"
            value={datos.numeroDocumento || ""}
            onChange={(e) =>
              setDatos((prev) => ({
                ...prev,
                numeroDocumento: e.target.value.replace(/\D/g, ""),
              }))
            }
          />

          <label className="DatosBancarios-etiqueta">Banco</label>
          <select
            className="DatosBancarios-input"
            value={datos.banco || ""}
            onChange={(e) =>
              setDatos((prev) => ({ ...prev, banco: e.target.value }))
            }
          >
            <option value="">Selecciona un banco</option>
            <option value="Bancolombia">Bancolombia</option>
            <option value="Davivienda">Davivienda</option>
            <option value="Banco de Bogotá">Banco de Bogotá</option>
            <option value="Banco de Occidente">Banco de Occidente</option>
            <option value="Nu Bank">Nu Bank</option>
            <option value="BBVA">BBVA</option>
            <option value="Banco Caja Social">Banco Caja Social</option>
            <option value="Citibank">Citibank</option>
          </select>

          <label className="DatosBancarios-etiqueta">Tipo de Cuenta</label>
          <select
            className="DatosBancarios-input"
            value={datos.tipoCuenta || ""}
            onChange={(e) =>
              setDatos((prev) => ({ ...prev, tipoCuenta: e.target.value }))
            }
          >
            <option value="">Selecciona un tipo de cuenta</option>
            <option value="ahorros">Ahorros</option>
            <option value="corriente">Corriente</option>
          </select>

          <label className="DatosBancarios-etiqueta">Número de Cuenta</label>
          <input
            className="DatosBancarios-input-Cuenta"
            type="text"
            placeholder="Número de Cuenta"
            value={datos.numeroCuenta || ""}
            onChange={(e) =>
              setDatos((prev) => ({
                ...prev,
                numeroCuenta: e.target.value.replace(/\D/g, ""),
              }))
            }
          />

          

          {guardando ? (
            <div className="DatosBancarios-loader">
              <Lottie
                animationData={animationData}
                loop={true}
                autoplay={true}
                style={{ height: 200, width: "100%", margin: "auto" }}
              />
              <p className="DatosBancarios-mensaje">Guardando datos bancarios...</p>
            </div>
          ) : (
            <button className="DatosBancarios-boton" onClick={manejarEnvio}>
              Guardar Datos Bancarios
            </button>
          )}

          {mensaje && <p className="DatosBancarios-mensaje">{mensaje}</p>}
        </>
      )}
    </div>
  );
};

export default DatosBancarios;

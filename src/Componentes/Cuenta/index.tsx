"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import animationData from "@/Componentes/Animaciones/AnimationPuntos.json";
import { useRouter } from "next/navigation";
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

const Cuenta: React.FC = () => {
  const [usuario, setUsuario] = useState<{
    nombre: string;
    email: string;
    glampings: any[] | undefined;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modoPropietario, setModoPropietario] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const obtenerDatosUsuario = async () => {
      const correoUsuario = Cookies.get("correoUsuario");

      if (correoUsuario) {
        try {
          const response = await fetch(
            `https://glamperosapi.onrender.com/usuarios?email=${correoUsuario}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setUsuario({
              nombre: data.nombre,
              email: data.email,
              glampings: data.glampings || [],
            });

            if (data.glampings && data.glampings.length > 0) {
              setModoPropietario(true);
            }
          } else {
            console.error("Error al obtener los datos del usuario.");
          }
        } catch (error) {
          console.error("Error en la conexión con la API:", error);
        }
      }
      setLoading(false);
    };

    obtenerDatosUsuario();
  }, []);

  const cerrarSesion = () => {
    Cookies.remove("nombreUsuario");
    Cookies.remove("idUsuario");
    Cookies.remove("correoUsuario");
    Cookies.remove("telefonoUsuario");
    router.push("/");
    router.refresh(); // Recargar la página después de cerrar sesión
  };

  const manejarEditarGlamping = () => {
    const propietarioId = Cookies.get("idUsuario");
    if (propietarioId) {
      router.push(`/EdicionGlamping/${propietarioId}`);
    }
  };

  const manejarCentroAyuda = () => {
    router.push("/Ayuda");
  };

  const manejarBancos = () => {
    router.push("/GestionBancos");
  };

  const irReservarCliente = () => {
    router.push("/ReservasClientes");
  };

  const irReservarPropiedades = () => {
    router.push("/ReservasPropiedades");
  };

  const manejarEditarPerfil = () => {
    router.push("/EdicionPerfil");
  };

  if (loading) {
    return (
      <div className="Cuenta-lottie-container">
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{ height: 200, width: "100%", margin: "auto" }}
        />
      </div>
    );
  }

  return (
    <div className="Cuenta-contenedor">
      <h1 className="Cuenta-titulo">Cuenta</h1>
      {usuario ? (
        <p className="Cuenta-informacion">
          {usuario.nombre}, {usuario.email}
        </p>
      ) : (
        <p className="Cuenta-cargando">Cargando datos del usuario...</p>
      )}

      {usuario?.glampings && usuario.glampings.length > 0 && (
        <div className="Cuenta-toggle-container">
          <span className={!modoPropietario ? "Cuenta-activo" : ""}>Modo Usuario</span>
          <label className="Cuenta-switch">
            <input
              type="checkbox"
              checked={modoPropietario}
              onChange={() => setModoPropietario(!modoPropietario)}
            />
            <span className="Cuenta-slider"></span>
          </label>
          <span className={modoPropietario ? "Cuenta-activo" : ""}>Modo Propietario</span>
        </div>
      )}

      {!modoPropietario ? (
        <div className="Cuenta-tarjetas">
          <div className="Cuenta-tarjeta" onClick={manejarEditarPerfil}>
            <h3>👤 Datos personales</h3>
            <p>Proporciona tus datos personales e indícanos cómo podemos ponernos en contacto contigo.</p>
          </div>
          <div className="Cuenta-tarjeta" onClick={irReservarCliente}>
            <h3>🧳 Mis Viajes</h3>
            <p>Mira dónde has reservado.</p>
          </div>        
          <div className="Cuenta-tarjeta Cuenta-CentroAyuda" onClick={manejarCentroAyuda}>
              <h3>🆘 Centro de ayuda</h3>
          </div>
        </div>
      ) : (
        usuario?.glampings && usuario.glampings.length > 0 && (
          <div className="Cuenta-tarjetas">
            <div className="Cuenta-tarjeta" onClick={irReservarPropiedades}>
              📅
              <h3>Estado de tus reservas recibidas</h3>
              <p>Revisa tus reservas vigentes e históricas.</p>
            </div>
            <div className="Cuenta-tarjeta" onClick={manejarEditarGlamping}>
              <h3>⛺ Editar información de tus glamping</h3>
              <p>Cambia información básica y fotos.</p>
            </div>
            <div className="Cuenta-tarjeta" onClick={manejarBancos}>
              <h3>💰 Pagos y datos bancarios</h3>
          </div>
            <div className="Cuenta-tarjeta Cuenta-CentroAyuda" onClick={manejarCentroAyuda}>
              <h3>🆘 Centro de ayuda</h3>
            </div>
          </div>
        )
      )}

      <div className="Cuenta-cerrar-sesion">
        <span onClick={cerrarSesion} className="Cuenta-cerrar-sesion">Cerrar sesión</span>
      </div>
    </div>
  );
};

export default Cuenta;

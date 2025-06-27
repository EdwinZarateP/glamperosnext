"use client";

import { useEffect, useState, useContext } from "react";
import Cookies from "js-cookie";

import { ContextoApp } from "../../context/AppContext";
import dynamic from "next/dynamic";
import animationData from "../../Componentes/Animaciones/AnimationPuntos.json";
import { useRouter } from "next/navigation"; // Se agregó useSearchParams
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
      return mod.default as React.ComponentType<MyLottieProps>;
    }),
  {
    ssr: false,
  }
);

const Cuenta: React.FC = () => {

  const almacenVariables = useContext(ContextoApp);
  if (!almacenVariables) {
    throw new Error("El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto.");
  }
  const {
    setSiono,
    setLatitud,
    setLongitud,
    setCiudad_departamento,
    setTipoGlamping,
    setAmenidadesGlobal,
    setImagenesCargadas,
    setNombreGlamping,
    setDescripcionGlamping,
    setPrecioEstandar,
    setCantidad_Huespedes,
    setCantidad_Huespedes_Adicional,
    setDescuento,
    setAcepta_Mascotas,
    setPrecioEstandarAdicional,
    setDiasCancelacion,
    setCopiasGlamping,
  } = almacenVariables;

  const quitarSetters = () => {
    setSiono(true);
    setLatitud(4.123456);
    setLongitud(-74.123456);
    setCiudad_departamento("");
    setTipoGlamping("");
    setAmenidadesGlobal([]);
    setImagenesCargadas([]);
    setNombreGlamping("");
    setDescripcionGlamping("");
    setPrecioEstandar(0);
    setDiasCancelacion(1);
    setCantidad_Huespedes(1);
    setCantidad_Huespedes_Adicional(0);
    setDescuento(0);
    setPrecioEstandarAdicional(0);
    setAcepta_Mascotas(false);
    setCopiasGlamping(1);
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const API_URL = `${API_BASE}/usuarios`;

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
          const response = await fetch(`${API_URL}?email=${correoUsuario}`,
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
      router.push(`/EdicionGlamping?propietarioId=${propietarioId}`);
    }
  };

  const manejarCentroAyuda = () => {
    router.push("/Ayuda");
  };

  const manejarBlog = () => {
    router.push("/blog");
  };

  const manejarCrear = () => {
    quitarSetters();
    router.push("/CrearGlamping");
  };

  const manejarBancos = () => {
    router.push("/GestionBancos");
  };

  const manejarPagos = () => {
    router.push("/Pagos");
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
            <div className="Cuenta-tarjeta Cuenta-CentroAyuda" onClick={manejarCrear}>
            <h3>Publica tu Glamping 🏕️ </h3>
          </div>
          <div className="Cuenta-tarjeta" onClick={manejarEditarPerfil}>
            <h3>Tu perfil 👤 </h3>          
          </div>
          <div className="Cuenta-tarjeta" onClick={irReservarCliente}>
            <h3>Mis Viajes 🧳 </h3>
            {/* <p>Mira dónde has reservado.</p> */}
          </div>    
    
          <div className="Cuenta-tarjeta Cuenta-CentroAyuda" onClick={manejarCentroAyuda}>
            <h3>Centro de ayuda 🆘 </h3>
          </div>
          <div className="Cuenta-tarjeta Cuenta-Blog" onClick={manejarBlog}>
              <h3>Blog</h3>
          </div>
        </div>
      ) : (
        usuario?.glampings && usuario.glampings.length > 0 && (
          <div className="Cuenta-tarjetas">
            <div className="Cuenta-tarjeta" onClick={irReservarPropiedades}>
              
              <h3>Estado de tus reservas 📅</h3>
              <p>Revisa tus reservas vigentes e históricas.</p>
            </div>
            <div className="Cuenta-tarjeta" onClick={manejarEditarGlamping}>
              <h3>Editar glamping ⛺</h3>
              <p>Bloquea fechas, edita información y fotos</p>
            </div>
            <div className="Cuenta-tarjeta" onClick={manejarBancos}>
              <h3>Datos bancarios 🏦</h3>
            </div>

            <div className="Cuenta-tarjeta" onClick={manejarPagos}>
              <h3>Pagos 💰</h3>
            </div>

            <div className="Cuenta-tarjeta Cuenta-CentroAyuda" onClick={manejarCrear}>
              <h3>Publica tu Glamping 🏕️</h3>
            </div>
            <div className="Cuenta-tarjeta" onClick={manejarEditarPerfil}>
            <h3>Tu perfil 👤 </h3>              
            </div>
            <div className="Cuenta-tarjeta Cuenta-CentroAyuda" onClick={manejarCentroAyuda}>
              <h3>Centro de ayuda 🆘</h3>
            </div>
            <div className="Cuenta-tarjeta Cuenta-Blog" onClick={manejarBlog}>
              <h3>Blog</h3>
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

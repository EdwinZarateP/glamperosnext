"use client";

import { useState, useContext, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import FacebookLogin from "react-facebook-login";
import { jwtDecode } from "jwt-decode";
import { ContextoApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import "./estilos.css";

const RegistroComp: React.FC = () => {
  const contexto = useContext(ContextoApp);
  const router = useRouter();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // ✅ Verifica si está en el cliente

  if (!contexto) {
    throw new Error(
      "ContextoApp no está disponible. Asegúrate de envolver tu aplicación con <ProveedorVariables>"
    );
  }

  const {
    setIdUsuario,
    setLogueado,
    setNombreUsuario,
    setCorreoUsuario,
    siono,
    activarChat,
    setActivarChat,
    idUrlConversacion,
    UrlActual,
    redirigirExplorado,
    setRedirigirExplorado,
  } = contexto;

  const API_URL = "https://glamperosapi.onrender.com/usuarios";

  // ✅ Se ejecuta solo en el cliente para evitar errores de SSR
  useEffect(() => {
    setIsClient(true); // Marca que el componente ya se montó en el cliente

    const id = Cookies.get("idUsuario");
    if (id) {
      setIdUsuario(id);
    }
  }, [setIdUsuario]);

  // ✅ Manejo de errores con tipado correcto
  const manejarError = (error: unknown) => {
    console.error("Error:", error);

    if (error instanceof AxiosError) {
      const errorMensaje =
        error.response?.data?.detail || "Hubo un error inesperado.";
      setMensaje(errorMensaje);
    } else {
      setMensaje("Ocurrió un error desconocido.");
    }
  };

  // ✅ Manejo del login con Google
  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse | undefined
  ) => {
    if (!credentialResponse?.credential) {
      setMensaje("No se recibió el credencial de Google");
      return;
    }

    try {
      const decoded = jwtDecode<{ name: string; email: string }>(
        credentialResponse.credential
      );
      const nombreUsuario = decoded.name;
      const emailUsuario = decoded.email;

      const response = await axios.post(API_URL, {
        nombre: nombreUsuario,
        email: emailUsuario,
        telefono: "",
        clave: "autenticacionGoogle",
      });

      if (response.status === 200 && response.data) {
        const usuario: {
          _id: string;
          nombre: string;
          email: string;
          telefono?: string;
        } = response.data.usuario;
        Cookies.set("idUsuario", usuario._id, { expires: 7 });
        Cookies.set("nombreUsuario", usuario.nombre, { expires: 7 });
        Cookies.set("correoUsuario", usuario.email, { expires: 7 });

        const telefono: string = usuario.telefono?.trim() || "sintelefono";
        Cookies.set("telefonoUsuario", telefono, { expires: 7 });

        setIdUsuario(usuario._id);
        setNombreUsuario(usuario.nombre);
        setCorreoUsuario(usuario.email);
        setLogueado(true);

        router.push(
          !!usuario.telefono ? redireccionSegunEstado() : "/EdicionPerfil"
        );
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setMensaje("El correo ya está registrado. Intentando redirigir...");
        redirigirUsuarioExistente(error.response?.data?.usuario);
      } else {
        manejarError(error);
      }
    }
  };

  // ✅ Manejo del login con Facebook
  const handleFacebookResponse = async (response: any) => {
    if (!response.accessToken) {
      setMensaje("No se recibió el token de Facebook");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/facebook`, {
        accessToken: response.accessToken,
      });

      if (res.status === 200 && res.data) {
        const usuario: {
          _id: string;
          nombre: string;
          email: string;
          telefono?: string;
        } = res.data.usuario;
        Cookies.set("idUsuario", usuario._id, { expires: 7 });
        Cookies.set("nombreUsuario", usuario.nombre, { expires: 7 });
        Cookies.set("correoUsuario", usuario.email, { expires: 7 });

        const telefono: string = usuario.telefono?.trim() || "sintelefono";
        Cookies.set("telefonoUsuario", telefono, { expires: 7 });

        setIdUsuario(usuario._id);
        setNombreUsuario(usuario.nombre);
        setCorreoUsuario(usuario.email);
        setLogueado(true);

        router.push(
          !!usuario.telefono ? redireccionSegunEstado() : "/EdicionPerfil"
        );
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setMensaje("El correo ya está registrado. Intentando redirigir...");
        redirigirUsuarioExistente(error.response?.data?.usuario);
      } else {
        manejarError(error);
      }
    }
  };

  // ✅ Función para redirigir usuarios existentes
  const redirigirUsuarioExistente = async (usuario: {
    _id: string;
    nombre: string;
    email: string;
    telefono?: string;
  }) => {
    if (!usuario) return;

    Cookies.set("idUsuario", usuario._id, { expires: 7 });
    Cookies.set("nombreUsuario", usuario.nombre, { expires: 7 });
    Cookies.set("correoUsuario", usuario.email, { expires: 7 });

    const telefono: string = usuario.telefono?.trim() || "sintelefono";
    Cookies.set("telefonoUsuario", telefono, { expires: 7 });

    setIdUsuario(usuario._id);
    setNombreUsuario(usuario.nombre);
    setCorreoUsuario(usuario.email);
    setLogueado(true);

    router.push(!!usuario.telefono ? redireccionSegunEstado() : "/EdicionPerfil");
  };

  // ✅ Función para determinar la redirección
  const redireccionSegunEstado = () => {
    if (siono) return "/CrearGlamping";
    if (activarChat) {
      setActivarChat(false);
      return `${idUrlConversacion}`;
    }
    if (redirigirExplorado) {
      setRedirigirExplorado(false);
      return UrlActual;
    }
    return "/";
  };

  // ✅ Evita mostrar el componente en el servidor hasta que esté en el cliente
  if (!isClient) {
    return null;
  }

  return (
    <div className="RegistroComp-contenedor">
      <h1 className="RegistroComp-titulo">Ingreso y/o Registro</h1>

      {mensaje && <p className="Mensaje-error">{mensaje}</p>}

      <div className="RegistroComp-google">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() =>
            setMensaje(
              "Hubo un error al iniciar sesión con Google. Intenta nuevamente."
            )
          }
        />
      </div>

      <div className="RegistroComp-facebook">
        <FacebookLogin
          appId="TU_FACEBOOK_APP_ID" /* Reemplaza con tu App ID de Facebook */
          autoLoad={false}
          fields="name,email,picture"
          callback={handleFacebookResponse}
          icon="fa-facebook"
          textButton=" Iniciar sesión con Facebook"
          cssClass="RegistroComp-facebook-boton"
        />
      </div>
    </div>
  );
};

export default RegistroComp;

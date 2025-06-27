"use client";

import { useState, useContext, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";
import { ContextoApp } from "../../context/AppContext";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import "./estilos.css";

interface UsuarioAPI {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
}

const RegistroComp: React.FC = () => {
  const contexto = useContext(ContextoApp)!;
  const router = useRouter();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [aceptaTratamientoDatos, setAceptaTratamientoDatos] = useState(false);

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

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const API_URL = `${API_BASE}/usuarios`;

  useEffect(() => {
    setIsClient(true);
    const idGuardado = Cookies.get("idUsuario");
    if (idGuardado) {
      setIdUsuario(idGuardado);
    }
  }, [setIdUsuario]);

  const manejarError = (error: unknown) => {
    console.error("Error:", error);
    if (error instanceof AxiosError) {
      setMensaje(error.response?.data?.detail || "Hubo un error inesperado.");
    } else {
      setMensaje("Ocurrió un error desconocido.");
    }
  };

  const redireccionSegunEstado = () => {
    if (siono) return "/CrearGlamping";
    if (activarChat) {
      setActivarChat(false);
      return idUrlConversacion;
    }
    if (redirigirExplorado) {
      setRedirigirExplorado(false);
      return UrlActual;
    }
    return "/";
  };

  const guardarYRedirigir = (apiUsuario: UsuarioAPI) => {
    // 1) Validar id
    if (!apiUsuario.id || apiUsuario.id === "undefined") {
      console.error("ID inválido recibido:", apiUsuario);
      setMensaje("Error interno: no se obtuvo el identificador de usuario");
      return;
    }

    // 2) Guardar cookies
    Cookies.set("idUsuario", apiUsuario.id, { expires: 7 });
    Cookies.set("nombreUsuario", apiUsuario.nombre, { expires: 7 });
    Cookies.set("correoUsuario", apiUsuario.email, { expires: 7 });
    const tel = apiUsuario.telefono?.trim() || "";
    Cookies.set("telefonoUsuario", tel || "sintelefono", { expires: 7 });

    console.log("✅ Cookies guardadas:");
    console.log("idUsuario:", Cookies.get("idUsuario"));
    console.log("nombreUsuario:", Cookies.get("nombreUsuario"));
    console.log("correoUsuario:", Cookies.get("correoUsuario"));
    console.log("telefonoUsuario:", Cookies.get("telefonoUsuario"));

    // 3) Actualizar contexto
    setIdUsuario(apiUsuario.id);
    setNombreUsuario(apiUsuario.nombre);
    setCorreoUsuario(apiUsuario.email);
    setLogueado(true);

    // 4) Redirigir según tenga teléfono o no
    const tieneTel = Boolean(apiUsuario.telefono && apiUsuario.telefono.trim());
    router.push(tieneTel ? redireccionSegunEstado() : "/EdicionPerfil");
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse | undefined
  ) => {
    if (!credentialResponse?.credential) {
      setMensaje("No se recibió el credencial de Google");
      return;
    }
    if (!aceptaTratamientoDatos) {
      setMensaje("Debes aceptar el tratamiento de datos personales para continuar.");
      return;
    }

    try {
      const decoded = jwtDecode<{ name: string; email: string }>(
        credentialResponse.credential
      );
      const nombreUsuario = decoded.name;
      const emailUsuario = decoded.email;
      if (!nombreUsuario || !emailUsuario) {
        setMensaje("No se pudo obtener tu nombre o correo desde Google.");
        return;
      }

      const payload = {
        nombre: nombreUsuario,
        email: emailUsuario,
        aceptaTratamientoDatos,
      };

      const response = await axios.post(`${API_URL}/google`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        const { usuario: apiUsuario } = response.data as {
          usuario: UsuarioAPI;
        };
        guardarYRedirigir(apiUsuario);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setMensaje("El correo ya está registrado. Intentando redirigir...");
        const data = err.response!.data as { usuario: UsuarioAPI };
        guardarYRedirigir(data.usuario);
      } else {
        manejarError(err);
      }
    }
  };

  if (!isClient) return null;

  return (
    <div className="RegistroComp-contenedor">
      <h1 className="RegistroComp-titulo">Ingreso y/o Registro</h1>

      <div className="RegistroComp-check">
        <label>
          <input
            type="checkbox"
            checked={aceptaTratamientoDatos}
            onChange={(e) => setAceptaTratamientoDatos(e.target.checked)}
          />{" "}
          Acepto el{" "}
          <a href="/politicas-privacidad" target="_blank" rel="noopener noreferrer">
            tratamiento de datos personales
          </a>
        </label>
      </div>

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
    </div>
  );
};

export default RegistroComp;

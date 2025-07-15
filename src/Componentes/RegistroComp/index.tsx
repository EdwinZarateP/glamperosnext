// src/Componentes/RegistroComp.tsx
"use client";

import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";
import { ContextoApp } from "../../context/AppContext";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import "./estilos.css";

interface UsuarioAPI {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol?: string;
  aceptaTratamientoDatos?: boolean;
}

const RegistroComp: React.FC = () => {
  const contexto = useContext(ContextoApp)!;
  const router = useRouter();
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
    const { id, nombre, email, telefono, rol } = apiUsuario;
    if (!id || id === "undefined") {
      toast.error("Error interno: no se obtuvo el identificador de usuario");
      return;
    }

    Cookies.set("idUsuario", id, { expires: 7 });
    Cookies.set("nombreUsuario", nombre, { expires: 7 });
    Cookies.set("correoUsuario", email, { expires: 7 });
    Cookies.set("telefonoUsuario", telefono?.trim() || "sintelefono", { expires: 7 });
    Cookies.set("rolUsuario", rol || "usuario", { expires: 7 });

    setIdUsuario(id);
    setNombreUsuario(nombre);
    setCorreoUsuario(email);
    setLogueado(true);

    const tieneTel = Boolean(telefono && telefono.trim());
    router.push(tieneTel ? redireccionSegunEstado() : "/EdicionPerfil");
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse | undefined
  ) => {
    if (!credentialResponse?.credential) {
      toast.error("No se recibió el credencial de Google");
      return;
    }

    try {
      const decoded = jwtDecode<{ name: string; email: string }>(
        credentialResponse.credential
      );
      const nombreUsuario = decoded.name;
      const emailUsuario = decoded.email;

      if (!nombreUsuario || !emailUsuario) {
        toast.error("No se pudo obtener tu nombre o correo desde Google.");
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
        const { usuario: apiUsuario } = response.data as { usuario: UsuarioAPI };
        guardarYRedirigir(apiUsuario);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        const data = err.response!.data as { usuario: UsuarioAPI };

        if (data.usuario.aceptaTratamientoDatos) {
          setAceptaTratamientoDatos(true);
          guardarYRedirigir(data.usuario);
          return;
        }

        toast.error(
          "Debes aceptar el tratamiento de datos personales para continuar."
        );
        return;
      }

      toast.error(
        axios.isAxiosError(err)
          ? err.response?.data?.detail || "Hubo un error inesperado."
          : "Ocurrió un error desconocido."
      );
    }
  };

  if (!isClient) return null;

  return (
    <div className="RegistroComp-contenedor">
      <h1 className="RegistroComp-titulo">Ingreso y/o Registro</h1>

      <div className="RegistroComp-google">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() =>
            toast.error(
              "Hubo un error al iniciar sesión con Google. Intenta nuevamente."
            )
          }
        />
      </div>

      <div className="RegistroComp-check">
        <label>
          <input
            type="checkbox"
            checked={aceptaTratamientoDatos}
            onChange={(e) => {
              setAceptaTratamientoDatos(e.target.checked);
            }}
          />{' '}
          Acepto el{' '}
          <a
            href="/politicas-privacidad"
            target="_blank"
            rel="noopener noreferrer"
          >
            tratamiento de datos personales
          </a>
        </label>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover
      />
    </div>
  );
};

export default RegistroComp;

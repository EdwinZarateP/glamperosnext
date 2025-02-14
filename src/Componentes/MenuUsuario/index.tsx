"use client";

import { useContext, useRef, useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ Reemplaza useNavigate
import { ContextoApp } from "@/context/AppContext";
import Cookies from "js-cookie";
import "./estilos.css"; 

const MenuUsuario: React.FC = () => {
  const router = useRouter();
  const idEmisor = Cookies.get("idUsuario");
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    throw new Error(
      "El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto."
    );
  }

  const { mostrarMenuUsuarios, setMostrarMenuUsuarios } = almacenVariables;
  const nombreUsuarioCookie = Cookies.get("nombreUsuario");

  // Referencia al contenedor del menú
  const menuRef = useRef<HTMLDivElement>(null);

  // Función para manejar el cierre de sesión
  const cerrarSesion = () => {
    // Remover las cookies
    Cookies.remove("nombreUsuario");
    Cookies.remove("idUsuario");
    Cookies.remove("correoUsuario");
    Cookies.remove("telefonoUsuario");

    // Actualizar el estado para ocultar el menú
    setMostrarMenuUsuarios(false);

    // Redirigir al inicio y recargar la página
    router.push("/");
    router.refresh(); // ✅ Next.js no usa window.location.reload()
  };

  // Función para detectar clics fuera del menú
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setMostrarMenuUsuarios(false);
    }
  };

  // Agregar el event listener cuando el componente se monte
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Si mostrarMenuUsuarios es falso, no renderizamos nada
  if (!mostrarMenuUsuarios) {
    return null;
  }

  return (
    <div ref={menuRef} className="MenuUsuario-contenedor">
      <ul className="MenuUsuario-lista">
        {nombreUsuarioCookie && (
          <>
            <li
              className="MenuUsuario-opcion"
              onClick={() => {
                setMostrarMenuUsuarios(false);
                router.push(`/Mensajes/${idEmisor}`);
              }}
            >
              Mensajes
            </li>
            <li
              className="MenuUsuario-opcion"
              onClick={() => {
                router.push("/ListaDeseos");
                setMostrarMenuUsuarios(false);
              }}
            >
              Lista de favoritos
            </li>
            <li
              className="MenuUsuario-opcion"
              onClick={() => {
                router.push("/GestionarCuenta");
                setMostrarMenuUsuarios(false);
              }}
            >
              Cuenta
            </li>
          </>
        )}
        <li
          className="MenuUsuario-opcion"
          onClick={() => {
            router.push("/Ayuda");
            setMostrarMenuUsuarios(false);
          }}
        >
          Centro de ayuda
        </li>
        <li
          className="MenuUsuario-opcion"
          onClick={() => {
            if (nombreUsuarioCookie) {
              cerrarSesion();
            } else {
              router.push("/RegistroPag");
              setMostrarMenuUsuarios(false);
            }
          }}
        >
          {nombreUsuarioCookie ? "Cerrar sesión" : "Registro/Iniciar sesión"}
        </li>
      </ul>
    </div>
  );
};

export default MenuUsuario;

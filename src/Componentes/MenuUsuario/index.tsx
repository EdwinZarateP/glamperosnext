"use client";

import { useContext, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ContextoApp } from "@/context/AppContext";
import Cookies from "js-cookie";
import "./estilos.css";

const MenuUsuario: React.FC = () => {
  const router = useRouter();
  const idEmisor = Cookies.get("idUsuario") ?? "";
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    throw new Error("El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto.");
  }

  const { mostrarMenuUsuarios, setMostrarMenuUsuarios } = almacenVariables;
  const nombreUsuarioCookie = Cookies.get("nombreUsuario");

  // ✅ Referencia al contenedor del menú
  const menuRef = useRef<HTMLDivElement>(null);

  // ✅ Cierra el menú si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMostrarMenuUsuarios(false);
      }
    };

    if (mostrarMenuUsuarios) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mostrarMenuUsuarios, setMostrarMenuUsuarios]);

  // ✅ Función para cerrar sesión
  const cerrarSesion = () => {
    Cookies.remove("nombreUsuario");
    Cookies.remove("idUsuario");
    Cookies.remove("correoUsuario");
    Cookies.remove("telefonoUsuario");
    setMostrarMenuUsuarios(false);
    router.push("/");
  };

  // ✅ Si el menú no está visible, no lo renderizamos
  if (!mostrarMenuUsuarios) return null;

  return (
    <div ref={menuRef} className="MenuUsuario-contenedor">
      <ul className="MenuUsuario-lista">
        {nombreUsuarioCookie && (
          <>
            <li
              className="MenuUsuario-opcion"
              onClick={() => {
                setMostrarMenuUsuarios(false);
                if (idEmisor) {
                  router.push(`/Mensajes?idEmisor=${idEmisor}`);
                } 
              }}
            >
              Mensajes
            </li>
            <li
              className="MenuUsuario-opcion"
              onClick={() => {
                setMostrarMenuUsuarios(false);
                router.push("/ListaDeseos");
              }}
            >
              Lista de favoritos
            </li>
            <li
              className="MenuUsuario-opcion"
              onClick={() => {
                setMostrarMenuUsuarios(false);
                router.push("/GestionarCuenta");
              }}
            >
              Cuenta
            </li>
          </>
        )}
        <li
          className="MenuUsuario-opcion"
          onClick={() => {
            setMostrarMenuUsuarios(false);
            router.push("/Ayuda");
          }}
        >
          Centro de ayuda
        </li>
        <li
          className="MenuUsuario-opcion"
          onClick={() => {
            setMostrarMenuUsuarios(false);
            if (nombreUsuarioCookie) {
              cerrarSesion();
            } else {
              router.push("/RegistroPag");
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

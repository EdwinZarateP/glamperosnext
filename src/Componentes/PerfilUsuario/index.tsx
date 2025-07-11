// src/Componentes/PerfilUsuario.tsx
"use client";

import { useEffect, useState, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { ContextoApp } from "../../context/AppContext";
import "./estilos.css";
import { enviarWhatsAppNotificarMensaje } from "../../Funciones/enviarWhatsAppNotificarMensaje";

interface PerfilUsuarioProps {
  propietario_id: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

const PerfilUsuario: React.FC<PerfilUsuarioProps> = ({ propietario_id }) => {
  const [usuario, setUsuario] = useState({
    foto: "",
    nombre: "",
    whatsapp: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [nombreGlamping, setNombreGlamping] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const glampingId = searchParams.get("glampingId");

  const { /* otros valores de contexto */ } = useContext(ContextoApp)!;

  const idEmisor = Cookies.get("idUsuario");
  const nombreEmisor = Cookies.get("nombreUsuario") || "";
  const rolUsuario = Cookies.get("rolUsuario");

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const res = await fetch(`${API_BASE}/usuarios/${propietario_id}`);
        const data = await res.json();
        setUsuario({
          foto: data.foto || "",
          nombre: data.nombre || "Usuario sin nombre",
          whatsapp: data.telefono || "",
        });
      } catch {
        console.error("Error al cargar perfil");
      }
    };
    const fetchGlamping = async () => {
      if (!glampingId) return;
      try {
        const res = await fetch(`${API_BASE}/glampings/${glampingId}`);
        const data = await res.json();
        setNombreGlamping(data.nombreGlamping);
      } catch {
        console.error("Error al cargar glamping");
      }
    };
    fetchUsuario();
    fetchGlamping();
  }, [propietario_id, glampingId]);

  const manejarMensaje = async () => {
    if (!idEmisor) return router.push("/registro");
    if (idEmisor === propietario_id) {
      return Swal.fire({
        icon: "error",
        title: "No puedes enviarte un mensaje a ti mismo",
      });
    }
    if (!mensaje.trim()) return;

    const nuevoMensaje = {
      emisor: idEmisor,
      receptor: propietario_id,
      mensaje: `Me interesa ${nombreGlamping}, ${mensaje}`,
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch(`${API_BASE}/mensajes/enviar_mensaje`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoMensaje),
      });
      router.push(`/Mensajes?idUsuarioReceptor=/${propietario_id}`);
      setMensaje("");
      if (usuario.whatsapp) {
        await enviarWhatsAppNotificarMensaje({
          numero: usuario.whatsapp,
          nombrePropietario: usuario.nombre.split(" ")[0] || "",
          nombreHuesped: nombreEmisor.split(" ")[0] || "",
          mensaje,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const redirigirWhatsAppAnfitrion = () => {
    if (!usuario.whatsapp) {
      return Swal.fire({
        icon: "error",
        title: "Teléfono no disponible",
        text: "Este anfitrión no tiene WhatsApp registrado",
      });
    }
    const numero = usuario.whatsapp.replace(/[^\d]/g, "");
    const texto = encodeURIComponent(
      `Hola, tenemos un cliente averiguando por ${nombreGlamping}.`
    );

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    const url = isMobile
      ? `https://wa.me/${numero}?text=${texto}`
      : `https://web.whatsapp.com/send?phone=${numero}&text=${texto}`;

    window.open(url, "_blank");
  };

  const inicial = usuario.nombre.charAt(0).toUpperCase();

  return (
    <div className="PerfilUsuarioContenedor">
      <div className="PerfilUsuarioFoto">
        {usuario.foto ? (
          <img src={usuario.foto} alt={usuario.nombre} />
        ) : (
          <div className="PerfilUsuarioSinFoto">{inicial}</div>
        )}
      </div>
      <div className="PerfilUsuarioNombre">Escríbele a tu anfitrión</div>
      <textarea
        className="PerfilUsuarioMensajeInput"
        placeholder="Escribe tu mensaje..."
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
      />
      <button className="PerfilUsuarioBoton" onClick={manejarMensaje}>
        Enviar Mensaje
      </button>

      {rolUsuario === "admin" && (
        <button
          className="PerfilUsuarioBotonWhatsApp"
          onClick={redirigirWhatsAppAnfitrion}
        >
          Contactar por WhatsApp
        </button>
      )}
    </div>
  );
};

export default PerfilUsuario;

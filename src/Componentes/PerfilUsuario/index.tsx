"use client"; // Asegura que se ejecute solo en el cliente

import React, { useEffect, useState, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Reemplazo de useNavigate y useParams
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { ContextoApp } from "@/context/AppContext";
import "./estilos.css"; // Importado en _app.tsx

interface PerfilUsuarioProps {
  propietario_id: string;
}

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
  const glampingId = searchParams.get("glampingId"); // Reemplazo de useParams

  const almacenVariables = useContext(ContextoApp);
  if (!almacenVariables) {
    throw new Error("El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto.");
  }

  const idEmisor = Cookies.get("idUsuario");
  const nombreEmisor = Cookies.get("nombreUsuario") || "";
  const mensaje1 = usuario.nombre.split(" ")[0] || "";
  const mensaje2 = nombreEmisor.split(" ")[0] || "";
  const mensaje3 = mensaje;
  const WHATSAPP_API_TOKEN = process.env.NEXT_PUBLIC_WHATSAPP_API_TOKEN; // Reemplazo de import.meta.env

  const enviarMensaje = async (numero: string) => {
    const url = "https://graph.facebook.com/v21.0/531912696676146/messages";
    const body = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: numero,
      type: "template",
      template: {
        name: "notificacionmensaje",
        language: { code: "es_CO" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: mensaje1 },
              { type: "text", text: mensaje2 },
              { type: "text", text: mensaje3 },
            ],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: idEmisor }],
          },
        ],
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      alert("Error al enviar el mensaje");
    }
  };

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await fetch(`https://glamperosapi.onrender.com/usuarios/${propietario_id}`);
        const data = await response.json();
        setUsuario({
          foto: data.foto || "",
          nombre: data.nombre || "Usuario sin nombre",
          whatsapp: data.telefono || "Usuario sin telefono",
        });
      } catch (error) {
        console.error("Error al cargar el perfil del usuario:", error);
      }
    };

    const fetchGlamping = async () => {
      try {
        if (!glampingId) return;
        const response = await fetch(`https://glamperosapi.onrender.com/glampings/${glampingId}`);
        const data = await response.json();
        setNombreGlamping(data.nombreGlamping);
      } catch (error) {
        console.error("Error al obtener el glamping:", error);
      }
    };

    fetchUsuario();
    fetchGlamping();
  }, [propietario_id, glampingId]);

  const manejarMensaje = async () => {
    if (!idEmisor) {
      router.push("/Registrarse");
      return;
    }

    if (idEmisor === propietario_id) {
      Swal.fire({
        icon: "error",
        title: "Mensaje de dueño a dueño",
        text: "No puedes enviarte un mensaje a ti mismo",
      });
      return;
    }

    if (mensaje.trim()) {
      const nuevoMensaje = {
        emisor: idEmisor,
        receptor: propietario_id,
        mensaje: `Me interesa ${nombreGlamping}, ${mensaje}`,
        timestamp: new Date().toISOString(),
      };

      try {
        await fetch("https://glamperosapi.onrender.com/mensajes/enviar_mensaje", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoMensaje),
        });

        router.push(`/Mensajes?idUsuarioReceptor=/${propietario_id}`);

        setMensaje("");

        if (usuario.whatsapp !== "Usuario sin telefono") {
          enviarMensaje(usuario.whatsapp);
        }
      } catch (error) {
        console.error("Error al enviar el mensaje:", error);
      }
    } else {
      console.log("El mensaje o el emisor no están definidos correctamente");
    }
  };

  const inicial = usuario.nombre.charAt(0).toUpperCase();

  return (
    <div className="PerfilUsuarioContenedor">
      <div className="PerfilUsuarioFoto">
        {usuario.foto ? <img src={usuario.foto} alt={usuario.nombre} /> : <div className="PerfilUsuarioSinFoto">{inicial}</div>}
      </div>
      <div className="PerfilUsuarioNombre">{usuario.nombre}</div>
      <textarea className="PerfilUsuarioMensajeInput" placeholder="Escribe tu mensaje..." value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
      <button className="PerfilUsuarioBoton" onClick={manejarMensaje}>
        Enviar Mensaje
      </button>
    </div>
  );
};

export default PerfilUsuario;

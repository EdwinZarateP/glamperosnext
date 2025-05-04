"use client"; // Asegura que se ejecute solo en el cliente

import React, { useEffect, useState, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Reemplazo de useNavigate y useParams
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { ContextoApp } from "../../context/AppContext";
import "./estilos.css"; // Importado en _app.tsx

// IMPORTAMOS LA FUNCIÓN DE WHATSAPP
import { enviarWhatsAppNotificarMensaje } from "../../Funciones/enviarWhatsAppNotificarMensaje";

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
    throw new Error(
      "El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto."
    );
  }

  const idEmisor = Cookies.get("idUsuario");
  const nombreEmisor = Cookies.get("nombreUsuario") || "";

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await fetch(
          `https://glamperosapi.onrender.com/usuarios/${propietario_id}`
        );
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
        const response = await fetch(
          `https://glamperosapi.onrender.com/glampings/${glampingId}`
        );
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
      router.push("/registro");
      return;
    }

    // NOTA: Aquí dejamos tu lógica de "dueño a dueño" TAL CUAL
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

      console.log(usuario.whatsapp);

      try {
        // 1) Guardar en BD
        await fetch("https://glamperosapi.onrender.com/mensajes/enviar_mensaje", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoMensaje),
        });

        // 2) Redirigir a Mensajes
        router.push(`/Mensajes?idUsuarioReceptor=/${propietario_id}`);

        // 3) Resetear mensaje
        setMensaje("");

        // 4) Enviar notificación por WhatsApp usando la función importada
        if (usuario.whatsapp !== "Usuario sin telefono") {
          await enviarWhatsAppNotificarMensaje({
            numero: usuario.whatsapp,
            nombrePropietario: usuario.nombre.split(" ")[0] || "",
            nombreHuesped: nombreEmisor.split(" ")[0] || "",
            mensaje,
          });

          await enviarWhatsAppNotificarMensaje({
            numero: "573125443396",
            nombrePropietario: usuario.nombre.split(" ")[0] || "",
            nombreHuesped: nombreEmisor.split(" ")[0] || "",
            mensaje,
          });
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
    </div>
  );
};

export default PerfilUsuario;

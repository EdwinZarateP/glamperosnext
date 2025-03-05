"use client";

import { useRef, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import axios from "axios";
import { ContextoApp } from "@/context/AppContext"; 
import confetti from 'canvas-confetti'; 
import Cookies from 'js-cookie';
import dynamic from "next/dynamic";
import animationData from "@/Componentes/Animaciones/AnimationPuntos.json";
import "./estilos.css";

interface MyLottieProps {
  animationData: unknown;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
}

// Importación dinámica de lottie-react
const Lottie = dynamic<MyLottieProps>(
  () =>
    import("lottie-react").then((mod) => {
      return mod.default as React.ComponentType<MyLottieProps>;
    }),
  {
    ssr: false,
  }
);

const GuardarGlampingP: React.FC = () => {
  const router = useRouter();
  const nombreUsuarioCookie = Cookies.get('nombreUsuario'); 
  const correoUsuarioCookie = Cookies.get('correoUsuario'); 

  const [formulario, setFormulario] = useState({
    nombreGlamping: "",
    tipoGlamping: "",
    Acepta_Mascotas: false,
    ubicacion: "", 
    direccion: "", 
    precioEstandar: 0,
    diasCancelacion: 1,
    Cantidad_Huespedes: 1,
    descuento: 0,
    descripcionGlamping: "",
    amenidadesGlobal: "",
    ciudad_departamento: "",
    video_youtube: "",
    propietario_id: "",
    nombrePropietario: "",
    precioEstandarAdicional: 0, // Asegúrate de declararlo también aquí si vas a usarlo
    Cantidad_Huespedes_Adicional: 0, 
    minimoNoches: 0, 
  });

  const idPropietario = Cookies.get('idUsuario');
  const { 
    ubicacion,
    ciudad_departamento,
    imagenesCargadas,
    tipoGlamping,
    Cantidad_Huespedes,
    Acepta_Mascotas,
    amenidadesGlobal,
    videoSeleccionado,
    nombreGlamping,
    descripcionGlamping,
    precioEstandar,
    precioEstandarAdicional,
    descuento,
    nombreUsuario,
    Cantidad_Huespedes_Adicional,
    direccion,
    diasCancelacion,
    copiasGlamping,
    minimoNoches
  } = useContext(ContextoApp)!; 

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // Ref al botón "Cerrar" del popup
  const cerrarPopupRef = useRef<HTMLButtonElement | null>(null);

  // Sincroniza la idUsuario
  useEffect(() => {
    if (idPropietario) {
      setFormulario((prev) => ({
        ...prev,
        propietario_id: idPropietario,
      }));
    }
  }, [idPropietario]);

  // Sincroniza nombre propietario
  useEffect(() => {
    if (nombreUsuario) {
      setFormulario((prev) => ({
        ...prev,
        nombrePropietario: nombreUsuario, 
      }));
    }
  }, [nombreUsuario]);  

  // Sincroniza ubicación
  useEffect(() => {
    if (ubicacion) {
      setFormulario((prev) => ({
        ...prev,
        ubicacion,
      }));
    }
  }, [ubicacion]);  

  // Sincroniza dirección
  useEffect(() => {
    if (direccion) {
      setFormulario((prev) => ({
        ...prev,
        direccion, 
      }));
    }
  }, [direccion]);

  // Sincroniza ciudad_departamento
  useEffect(() => {
    if (ciudad_departamento) {
      setFormulario((prev) => ({
        ...prev,
        ciudad_departamento,
      }));
    }
  }, [ciudad_departamento]);

  // Sincroniza tipoGlamping
  useEffect(() => {
    if (tipoGlamping) {
      setFormulario((prev) => ({
        ...prev,
        tipoGlamping,
      }));
    }
  }, [tipoGlamping]);

  // Sincroniza Cantidad_Huespedes
  useEffect(() => {
    if (Cantidad_Huespedes) {
      setFormulario((prev) => ({
        ...prev,
        Cantidad_Huespedes,
      }));
    }
  }, [Cantidad_Huespedes]);

  // Sincroniza Cantidad_Huespedes_Adicional
  useEffect(() => {
    if (typeof Cantidad_Huespedes_Adicional === 'number') {
      setFormulario((prev) => ({
        ...prev,
        Cantidad_Huespedes_Adicional,
      }));
    }
  }, [Cantidad_Huespedes_Adicional]);

  // Sincroniza Acepta_Mascotas
  useEffect(() => {
    if (Acepta_Mascotas) {
      setFormulario((prev) => ({
        ...prev,
        Acepta_Mascotas,
      }));
    }
  }, [Acepta_Mascotas]);

  // Sincroniza nombreGlamping
  useEffect(() => {
    if (nombreGlamping) {
      setFormulario((prev) => ({
        ...prev,
        nombreGlamping,
      }));
    }
  }, [nombreGlamping]);

  // Sincroniza descripcionGlamping
  useEffect(() => {
    if (descripcionGlamping) {
      setFormulario((prev) => ({
        ...prev,
        descripcionGlamping,
      }));
    }
  }, [descripcionGlamping]);

  // Sincroniza precioEstandar
  useEffect(() => {
    if (typeof precioEstandar === 'number') {
      setFormulario((prev) => ({
        ...prev,
        precioEstandar,
      }));
    }
  }, [precioEstandar]);

  // Sincroniza precioEstandarAdicional
  useEffect(() => {
    if (typeof precioEstandarAdicional === 'number') {
      setFormulario((prev) => ({
        ...prev,
        precioEstandarAdicional,
      }));
    }
  }, [precioEstandarAdicional]);

  // Sincroniza minimoNoches
  useEffect(() => {
    if (typeof minimoNoches === 'number') {
      setFormulario((prev) => ({
        ...prev,
        minimoNoches,
      }));
    }
  }, [minimoNoches]);

  // Sincroniza descuento
  useEffect(() => {
    if (typeof descuento === 'number') {
      setFormulario((prev) => ({
        ...prev,
        descuento,
      }));
    }
  }, [descuento]);
  
  // Sincroniza diasCancelacion
  useEffect(() => {
    if (typeof diasCancelacion === 'number') {
      setFormulario((prev) => ({
        ...prev,
        diasCancelacion,
      }));
    }
  }, [diasCancelacion]);
  
  // Sincroniza amenidadesGlobal
  useEffect(() => {
    if (amenidadesGlobal) {
      setFormulario((prev) => ({
        ...prev,
        amenidadesGlobal: amenidadesGlobal.join(", "),
      }));
    }
  }, [amenidadesGlobal]);

  // Sincroniza videoSeleccionado
  useEffect(() => {
    if (videoSeleccionado) {
      setFormulario((prev) => ({
        ...prev,
        video_youtube: videoSeleccionado || "",
      }));
    }
  }, [videoSeleccionado]);

  useEffect(() => {
    if (showPopup && cerrarPopupRef.current) {
      cerrarPopupRef.current.focus();
    }
  }, [showPopup]);

  // Enviar correo
  const enviarCorreo = async (
    correo: string,
    nombre: string,
    fromEmail: string = "registro@glamperos.com"
  ) => {
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1 style="color: #2F6B3E;">😀¡${formulario.nombreGlamping} será parte de Glamperos!</h1>
          <p>
            Hola ${nombre.split(' ')[0]},
          </p>
          <p>
            Nos sentimos muy emocionados de tenerte como parte de nuestra
            Comunidad de emprendedores de experiencias únicas. Gracias por inscribir
            <strong style="color:#2F6B3E;">${formulario.nombreGlamping}</strong> con Glamperos, 
            el lugar donde el glamping cobra vida.
            Una vez verifiquemos si tu glamping cumple con nuestros requisitos, tu glamping quedará activo en la plataforma!
          </p>
          <p>
            Ahora estás listo/a para conectar con cientos de personas que buscan una experiencia única, confortable y memorable en tu espacio.
          </p>
          <p>
            Si necesitas ayuda o tienes preguntas, nuestro equipo estará siempre aquí para ti.
          </p>
          <p>
            ¡Juntos haremos que esta aventura sea inolvidable!
          </p>
          <p style="margin: 20px 0;">
            El equipo de <strong style="color: #2F6B3E;">Glamperos</strong>.
          </p>
          <hr style="border: 1px solid #e0e0e0;">
          <p style="font-size: 1em; color: #777;">
            Si tienes preguntas, no dudes en ponerte en contacto con nosotros a través de nuestro portal.
          </p>
        </div>
      `;
  
      await axios.post("https://glamperosapi.onrender.com/correos/send-email", {
        from_email: fromEmail,
        email: correo,
        name: nombre,
        subject: "¡Bienvenido a la familia Glamperos!",
        html_content: htmlContent,
      });
    } catch (error) {
      console.error("Error al enviar el correo: ", error);
    }
  };

  // AQUÍ es donde repetimos el proceso de guardar en la base de datos según copiasGlamping
  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");

    try {
      for (let i = 1; i <= (copiasGlamping || 1); i++) {
        const formData = new FormData();

        // Copiamos todos los valores del formulario
        Object.entries(formulario).forEach(([key, value]) => {
          formData.append(key, value.toString());
        });

        // Adjuntamos las imágenes
        imagenesCargadas.forEach((imagen) => {
          formData.append("imagenes", imagen);
        });

        // Si es la "copia" 2 o superior, modificamos el nombre (ejemplo: Bosque_2, Bosque_3, ...)
        if (i > 1) {
          const nuevoNombre = `${formulario.nombreGlamping}_${i}`;
          formData.set("nombreGlamping", nuevoNombre);
        }

        // Guardamos en la base de datos
        const respuesta = await axios.post(
          "https://glamperosapi.onrender.com/glampings/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Glamping creado con éxito:", respuesta.data.nombreGlamping);
      }
      
      // Ponemos un mensaje final que indique éxito general
      setMensaje("¡Se crearon tus glampings con éxito!");
      lanzarConfetti();
      setShowPopup(true);
      
      // Enviamos correo una sola vez, no importa cuántos glampings creamos
      enviarCorreo(correoUsuarioCookie || "", nombreUsuarioCookie || "");
    } catch (error) {
      setMensaje("Error al crear el glamping: " + error);
    } finally {
      setCargando(false);
    }
  };

  // Confetti
  const lanzarConfetti = () => {
    confetti.create(undefined, { resize: true, useWorker: true })({
      particleCount: 200,
      spread: 120,
      origin: { x: 0.5, y: 0.5 },
      zIndex: 1001,
    });
  };

  const cerrarPopup = () => {
    setShowPopup(false);
    setTimeout(() => {
      router.push("/");
    }, 50);
  };

  return (
    <div className="guardarGlampingP-contenedor">
      <h1 className="guardarGlampingP-titulo">
        ¡Ya casi eres parte de nuestra familia Glamperos!😊
      </h1>
      <p>Puedes dar pasos atrás y cambiar cualquier cosa antes de dar clic en "Terminar"</p>
      
      <form className="guardarGlampingP-formulario" onSubmit={manejarEnvio}>
        <button type="submit" className="guardarGlampingP-boton">
          {cargando ? (
            <div
              className="lottie-container"
              style={{
                background: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Lottie
                animationData={animationData}
                loop={true}
                autoplay={true}
                style={{ height: 200, width: "100%", margin: "auto" }}
              />
              <p className="cargando-mensaje">Estamos creando tu glamping...</p>
            </div>
          ) : (
            "Terminar"
          )}
        </button>
      </form>
  
      {mensaje && <p className="guardarGlampingP-mensaje">{mensaje}</p>}
  
      {showPopup && (
        <div className="popup-felicitaciones">
          <div className="popup-contenido">
            <h2>¡Felicitaciones! 🎉</h2>
            <p>
              Tu glamping se registró con éxito, revisa tu correo y no olvides 
              <strong> registrar tu WhatsApp </strong> para avisarte cuando tengas reservas
            </p>
            <button
              className="cerrar-popup"
              onClick={() => router.push("/EdicionPerfil")}
            >
              Registra tu WhatsApp
            </button>
            <button className="cerrar-popup" onClick={cerrarPopup} ref={cerrarPopupRef}>
              Ya lo tengo registrado
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuardarGlampingP;

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

// Transformamos la importación de `lottie-react` a un componente que acepte MyLottieProps
const Lottie = dynamic<MyLottieProps>(
  () =>
    import("lottie-react").then((mod) => {
      // forzamos el default a un componente tipado
      return mod.default as React.ComponentType<MyLottieProps>;
    }),
  {
    ssr: false,
  }
);

const GuardarGlampingP: React.FC = () => {
  const router = useRouter(); // Cambio de useNavigate a useRouter
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
  });
  const idPropietario = Cookies.get('idUsuario');
  const { ubicacion, ciudad_departamento, imagenesCargadas, tipoGlamping, Cantidad_Huespedes,
     Acepta_Mascotas, amenidadesGlobal, videoSeleccionado, nombreGlamping, descripcionGlamping,
     precioEstandar, precioEstandarAdicional, descuento, nombreUsuario,
      Cantidad_Huespedes_Adicional, direccion, diasCancelacion,
     } = useContext(ContextoApp)!; 
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const enviarCorreo = async (correo: string, nombre: string, fromEmail: string = "registro@glamperos.com") => {
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1 style="color: #2F6B3E;">😀¡${nombreGlamping} será parte de Glamperos!</h1>
          <p>
            Hola ${nombre.split(' ')[0]},
          </p>
          <p>
            Nos sentimos muy emocionados de tenerte como parte de nuestra
            Comunidad de emprendedores de experiencias únicas. Gracias por inscribir
            <strong style="color:#2F6B3E;">${nombreGlamping}</strong> con Glamperos, 
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
        html_content: htmlContent, // Enviar el contenido del correo
      });
        
    } catch (error) {
      console.error("Error al enviar el correo: ", error);
    }
  };
   
  
  // Sincroniza la idUsuario automáticamente al formulario cuando la variable global cambia
  useEffect(() => {
    if (idPropietario) {
      setFormulario((prev) => ({
        ...prev,
        propietario_id: idPropietario, // Actualizamos la idUsuario directamente
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

  // Sincroniza la ubicación automáticamente al formulario cuando la variable global cambia
  useEffect(() => {
    if (ubicacion) {
      setFormulario((prev) => ({
        ...prev,
        ubicacion, // Actualizamos la ubicación directamente
      }));
    }
  }, [ubicacion]);  

   // Sincroniza la direccion automáticamente al formulario cuando la variable global cambia
   useEffect(() => {
    if (direccion) {
      setFormulario((prev) => ({
        ...prev,
        direccion, 
      }));
    }
  }, [direccion]);


   // Sincroniza la ciudad_departamento automáticamente al formulario cuando la variable global cambia
   useEffect(() => {
    if (ciudad_departamento) {
      setFormulario((prev) => ({
        ...prev,
        ciudad_departamento, // Actualizamos la ciudad_departamento directamente
      }));
    }
  }, [ciudad_departamento]);

    // Sincroniza la tipoGlamping automáticamente al formulario cuando la variable global cambia
    useEffect(() => {
      if (tipoGlamping) {
        setFormulario((prev) => ({
          ...prev,
          tipoGlamping, // Actualizamos la tipoGlamping directamente
        }));
      }
    }, [tipoGlamping]);

    // Sincroniza la Cantidad_Huespedes automáticamente al formulario cuando la variable global cambia
    useEffect(() => {
      if (Cantidad_Huespedes) {
        setFormulario((prev) => ({
          ...prev,
          Cantidad_Huespedes, // Actualizamos la Cantidad_Huespedes directamente
        }));
      }
    }, [Cantidad_Huespedes]);


    // Sincroniza la Cantidad_Huespedes_Adicional automáticamente al formulario cuando la variable global cambia
    useEffect(() => {
      if (typeof Cantidad_Huespedes_Adicional === 'number') {
        setFormulario((prev) => ({
          ...prev,
          Cantidad_Huespedes_Adicional, // Actualizamos la Cantidad_Huespedes_Adicional directamente
        }));
      }
    }, [Cantidad_Huespedes_Adicional]);


    // Sincroniza la Acepta_Mascotas automáticamente al formulario cuando la variable global cambia
    useEffect(() => {
      if (Acepta_Mascotas) {
        setFormulario((prev) => ({
          ...prev,
          Acepta_Mascotas, // Actualizamos la Acepta_Mascotas directamente
        }));
      }
    }, [Acepta_Mascotas]);

    // Sincroniza la nombreGlamping automáticamente al formulario cuando la variable global cambia
    useEffect(() => {
      if (nombreGlamping) {
        setFormulario((prev) => ({
          ...prev,
          nombreGlamping, // Actualizamos la nombreGlamping directamente
        }));
      }
    }, [nombreGlamping]);

    // Sincroniza la descripcionGlamping automáticamente al formulario cuando la variable global cambia
    useEffect(() => {
      if (descripcionGlamping) {
        setFormulario((prev) => ({
          ...prev,
          descripcionGlamping, // Actualizamos la descripcionGlamping directamente
        }));
      }
    }, [descripcionGlamping]);

    // Sincroniza la precioEstandar automáticamente al formulario cuando la variable global cambia
    useEffect(() => {
      if (typeof precioEstandar === 'number') {
        setFormulario((prev) => ({
          ...prev,
          precioEstandar, // Actualizamos la precioEstandar directamente
        }));
      }
    }, [precioEstandar]);

    // Sincroniza la precioEstandarAdicional automáticamente al formulario cuando la variable global cambia
    useEffect(() => {
      if (typeof precioEstandarAdicional === 'number') {
        setFormulario((prev) => ({
          ...prev,
          precioEstandarAdicional, // Actualizamos la precioEstandar directamente
        }));
      }
    }, [precioEstandarAdicional]);

    // Sincroniza la descuento automáticamente al formulario cuando la variable global cambia
    useEffect(() => {
      if (typeof descuento === 'number') {
        setFormulario((prev) => ({
          ...prev,
          descuento, // Actualizamos la descuento directamente
        }));
      }
    }, [descuento]);
    
    // Sincroniza la diasCancelacion automáticamente al formulario cuando la variable global cambia
    useEffect(() => {
      if (typeof diasCancelacion === 'number') {
        setFormulario((prev) => ({
          ...prev,
          diasCancelacion,
        }));
      }
    }, [diasCancelacion]);
    
    // Añadir un nuevo useEffect para sincronizar "amenidadesGlobal" automáticamente al formulario cuando cambia
    useEffect(() => {
      if (amenidadesGlobal) {
        setFormulario((prev) => ({
          ...prev,
          amenidadesGlobal: amenidadesGlobal.join(", "), // Actualizamos "amenidadesGlobal" como un string separado por comas
        }));
      }
    }, [amenidadesGlobal]);

    // Sincroniza la videoSeleccionado automáticamente al formulario cuando la variable global cambia
    useEffect(() => {
      if (videoSeleccionado) {
        setFormulario((prev) => ({
          ...prev,
          video_youtube: videoSeleccionado|| "", // Actualizamos la videoSeleccionado directamente o lo mandamos vacio
        }));
      }
    }, [videoSeleccionado]);

    // Sincroniza la Cantidad_Huespedes automáticamente al formulario cuando la variable global cambia
    useEffect(() => {
      if (Cantidad_Huespedes) {
        setFormulario((prev) => ({
          ...prev,
          Cantidad_Huespedes, // Actualizamos la Cantidad_Huespedes directamente
        }));
      }
    }, [Cantidad_Huespedes]);

    // Referencia al botón "Cerrar"
  const cerrarPopupRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (showPopup && cerrarPopupRef.current) {
      cerrarPopupRef.current.focus(); // Coloca el foco en el botón "Cerrar" cuando se activa el popup
    }
  }, [showPopup]);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");

    const formData = new FormData();
    Object.entries(formulario).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    
    // Adjuntamos las imágenes del contexto en el FormData
    imagenesCargadas.forEach((imagen) => formData.append("imagenes", imagen));

    try {
      const respuesta = await axios.post("https://glamperosapi.onrender.com/glampings/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMensaje("Glamping creado con éxito: " + respuesta.data.nombreGlamping);
      lanzarConfetti();
      setShowPopup(true);
      
      // Llamar a la función para enviar correo
      enviarCorreo(correoUsuarioCookie || "", nombreUsuarioCookie || "");
    } catch (error) {
      setMensaje("Error al crear el glamping: " + error);
    } finally {
      setCargando(false);
    }
  };

  // Función para lanzar confetti (explosión)
  const lanzarConfetti = () => {
    confetti.create(undefined, { resize: true, useWorker: true })({
      particleCount: 200,
      spread: 120,
      origin: { x: 0.5, y: 0.5 },
      zIndex: 1001, // Asegúrate de usar un z-index alto
    });
  };

  const cerrarPopup = () => {
    setShowPopup(false); // Cierra el popup
    setTimeout(() => {
      router.push("/"); // Navega a la nueva página después de un breve retraso
    }, 50); // 50 ms de retraso (puedes ajustar este valor si es necesario)
  };
  

  return (
    <div className="guardarGlampingP-contenedor">
      <h1 className="guardarGlampingP-titulo">¡Ya casi eres parte de nuestra familia Glamperos!😊</h1>
      <p>Puedes dar pasos atrás y cambiar cualquier cosa antes de dar clic en "Terminar"</p>
      
      <form className="guardarGlampingP-formulario" onSubmit={manejarEnvio}>
      <button type="submit" className="guardarGlampingP-boton">
        {cargando ? (
          <div className="lottie-container" style={{ background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>            
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
            <p>Tu glamping se registró con éxito, revisa tu correo y no olvides 
              <strong> registrar tu whatsApp </strong> para avisarte cuando tengas reservas</p>
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
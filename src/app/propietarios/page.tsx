"use client";
import Image from "next/image";
import Link from "next/link";
import { FaMagnifyingGlass, FaCheck } from "react-icons/fa6";
import { GoGraph } from "react-icons/go";
import { CiCalendar } from "react-icons/ci";
import { FaStar, FaWhatsapp } from "react-icons/fa";
import { useRouter } from "next/navigation";
import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior";
import "./estilos.css";


const LandingPropietarios: React.FC = () => {

  const router = useRouter();
  const irAInicio = () => {
    router.push("/");
  };

  const irRegistro = () => {
    router.push("/registro");
  };

  const redirigirWhatsApp = () => {
    const numeroWhatsApp = "+573218695196";
    const mensaje = encodeURIComponent("Hola equipo Glamperos, ¡Soy propietario y quiero mas información!");
    const esPantallaPequena = typeof window !== "undefined" && window.innerWidth < 600;
    const urlWhatsApp = esPantallaPequena
      ? `https://wa.me/${numeroWhatsApp}?text=${mensaje}`
      : `https://web.whatsapp.com/send?phone=${numeroWhatsApp}&text=${mensaje}`;
    window.open(urlWhatsApp, "_blank");
  };


  return (
    <div className="LandingPropietarios-contenedor">
      {/* Encabezado */}
      <header className="LandingPropietarios-header" onClick={irAInicio}>
        {/* Ajusta la ruta si prefieres usar <Image /> de Next con src local */}
        <Image
          src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/Logo%20Glamperos.webp"
          alt="Glamperos"
          width={40}
          height={40}
        />
        <h1>Glamperos</h1>
      </header>

      {/* Sección principal */}
      <section className="LandingPropietarios-principal">
        <h1>¿Quieres aumentar tus reservas y ser más visible?</h1>
        <p>¡Glamperos te conecta con viajeros de toda Colombia!</p>
        <button className="LandingPropietarios-boton" onClick={irRegistro}>¡Registra tu glamping gratis!</button>
      </section>

      {/* Beneficios */}
      <section className="LandingPropietarios-beneficios">
        <div className="LandingPropietarios-beneficio">
          <div className="LandingPropietarios-beneficio-titulo">
            <span className="LandingPropietarios-icono">
              <FaMagnifyingGlass />
            </span>
            <h3>Fácil, rápido y 100% gratis</h3>
          </div>
          <p>
            Registra tu glamping en menos de 5 minutos.
            <strong>
              {" "}
              Sube fotos atractivas, configura tus tarifas y en pocos clics
              estarás listo para recibir reservas
            </strong>
            . Sin costos ocultos, sin complicaciones.
          </p>
        </div>
        <div className="LandingPropietarios-beneficio">
          <div className="LandingPropietarios-beneficio-titulo">
            <span className="LandingPropietarios-icono">
              <GoGraph />
            </span>
            <h3>Más reservas, más ingresos</h3>
          </div>
          <p>
            <strong> Glamperos atrae a viajeros buscando</strong> glampings como
            el tuyo.{" "}
            <strong>
              {" "}
              Publica tu espacio, aumenta tu visibilidad y recibe más huéspedes
              sin gastar en publicidad.
            </strong>{" "}
          </p>
        </div>
        <div className="LandingPropietarios-beneficio">
          <div className="LandingPropietarios-beneficio-titulo">
            <span className="LandingPropietarios-icono">
              <CiCalendar />
            </span>
            <h3>Reservas automáticas y sin estrés</h3>
          </div>
          <p>
            <strong> Cada vez que un viajero reserve,</strong> te notificamos al
            instante{" "}
            <strong>
              {" "}
              por WhatsApp. Tú solo te encargas de ofrecer la mejor experiencia,
              y nosotros gestionamos el pago seguro para que recibas tu dinero
              sin preocupaciones.
            </strong>{" "}
          </p>
        </div>
      </section>

      <button className="LandingPropietarios-beneficio-boton" onClick={irRegistro}>
        ¡Registrar mi glamping ya!
      </button>

      {/* Preguntas frecuentes */}
      <section className="LandingPropietarios-preguntas">
        <h2>Preguntas frecuentes</h2>
        <ul>
          <li>¿Es seguro registrarme en Glamperos?</li>
          <li>¿Cómo harán que reserven mi Glamping?</li>
          <li>¿Tiene algún costo registrarme?</li>
          <li>¿Qué pasa si mi glamping está reservado en otras plataformas?</li>
          <li>¿Cuándo y cómo recibiré el pago de mis reservas?</li>
        </ul>
      </section>

      {/* Seguridad y confianza */}
      <section className="LandingPropietarios-seguridad">
        <div className="LandingPropietarios-seguridad-encabezado">
        <img
          className="LandingPropietarios-seguridad-img"
          src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/Logo%20Glamperos.webp"
          alt="Sloth"
          width="80"
          height="80"
        />
        <h2>Glamperos, la plataforma especializada en glampings que te hace crecer</h2>
        </div>
        <ul>
          <li className="LandingPropietarios-seguridad-lista">
          <span className="LandingPropietarios-seguridad-icono"> <FaCheck /></span>
            Especializados en glampings: Solo alojamientos únicos en la naturaleza.
          </li>
          <li className="LandingPropietarios-seguridad-lista">
          <span className="LandingPropietarios-seguridad-icono"> <FaCheck /></span>
            100% gratis: sin tarifas de registro ni costos ocultos.
          </li>
          <li className="LandingPropietarios-seguridad-lista">
          <span className="LandingPropietarios-seguridad-icono"> <FaCheck /></span>
            Reservas fáciles y seguras: conecta con viajeros sin complicaciones.
          </li>
        </ul>
      </section>

       {/* Contacto */}
       <section className="LandingPropietarios-contacto">
       <div className="LandingPropietarios-contacto-encabezado">
          <h2>¿Quieres saber más sobre nosotros?</h2>
          <span  onClick={redirigirWhatsApp}>
            ¡Hablemos por WhatsApp!{" "}
            <FaWhatsapp style={{ color: "#25D366", fontSize: "24px" }} />
          </span>
        </div>

        <ul>
          <li className="LandingPropietarios-contacto-lista">
          <span className="LandingPropietarios-contacto-icono"> <FaStar /></span>
            Glamperos es una plataforma legalmente registrada y avalada.
          </li>
          <li className="LandingPropietarios-contacto-lista">
          <span className="LandingPropietarios-contacto-icono"> <FaStar /></span>
            Contamos con registro oficial en entidades gubernamentales.
          </li>
          <li className="LandingPropietarios-contacto-lista">
          <span className="LandingPropietarios-contacto-icono"> <FaStar /></span>
          Consulta nuestra regulación con el NIT 901.923.029-2 para mayor tranquilidad.
          </li>
        </ul>
      </section>

      {/* Contacto WhatsApp + registro legal y logos */}
      <section className="LandingPropietarios-patrocinadores">
       
        <div className="LandingPropietarios-logos">
          <img
            src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/sena%20fondo.png"
            alt="Fondo Emprender"
            width="80"
          />
          <img
            src="https://yt3.googleusercontent.com/ytc/AIdro_nthadseI_LKZcU_K1suJzNhy1RwNiyKjqUpuq1Fif0rw8=s900-c-k-c0x00ffffff-no-rj"
            alt="Cámara de Comercio Aburrá Sur"
            width="80"
          />
        </div>
      </section>
      <MenuUsuariosInferior />

      {/* Pie de página */}
      <footer className="LandingPropietarios-footer">
      <h3>Glamperos</h3>
      <p>2025 © Glamperos Todos los derechos reservados.</p>
      <nav>
        <div>
          <Link href="/">Inicio</Link>
          <Link href="/Ayuda">Sobre nosotros</Link>
        </div>
        <div>
          <Link href="/politicas-privacidad">Política de privacidad</Link>
        </div>
      </nav>
    </footer>
    </div>
  );
};

export default LandingPropietarios;

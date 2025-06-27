"use client";
import HeaderIcono from "../../Componentes/HeaderIcono";
import "./estilos.css";

const PoliticasPrivacidad = () => {
  return (
    <div className="contenedor-politicas">
    <HeaderIcono descripcion="Glamperos" />
      <h1>Política de Privacidad y tratamiento de datos</h1>
      <p>Última actualización: 26 de febrero de 2025</p>
      <p>
        Esta Política de Privacidad describe nuestras políticas y procedimientos
        sobre la recopilación, uso y divulgación de su información cuando usa
        nuestro servicio y le informa sobre sus derechos de privacidad y cómo la
        ley lo protege.
      </p>
      <p>
        Usamos sus datos personales para proporcionar y mejorar el servicio. Al
        utilizar el servicio, usted acepta la recopilación y el uso de
        información de acuerdo con esta política de privacidad.
      </p>

      <h2>Interpretación y Definiciones</h2>
      <h3>Interpretación</h3>
      <p>
        Las palabras cuya letra inicial está en mayúscula tienen significados
        definidos en las siguientes condiciones.
      </p>

      <h3>Definiciones</h3>
      <ul>
        <li>
          <strong>Cuenta:</strong> significa una cuenta única creada para que
          acceda a nuestro servicio o partes de él.
        </li>
        <li>
          <strong>Empresa:</strong> Se refiere a Glamperos, Calle 71 # 58 - 102.
        </li>
        <li>
          <strong>Cookies:</strong> son pequeños archivos colocados en su
          dispositivo por un sitio web.
        </li>
        <li>
          <strong>País:</strong> Colombia.
        </li>
        <li>
          <strong>Datos personales:</strong> cualquier información que se relacione
          con una persona identificada o identificable.
        </li>
        <li>
          <strong>Servicio:</strong> se refiere al sitio web.
        </li>
        <li>
          <strong>Sitio web:</strong> se refiere a Glamperos, accesible desde{" "}
          <a
            href="https://glamperos.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            glamperos.com
          </a>
        </li>
        <li>
          <strong>Usted:</strong> significa el individuo que accede o usa el
          servicio.
        </li>
      </ul>

      <h2>Recopilación y Uso de Sus Datos Personales</h2>
      <h3>Tipos de Datos Recopilados</h3>
      <h4>Datos Personales</h4>
      <p>
        Al utilizar nuestro servicio, es posible que le pidamos que nos
        proporcione cierta información de identificación personal, que incluye,
        entre otros:
      </p>
      <ul>
        <li>Dirección de correo electrónico</li>
        <li>Nombre y apellidos</li>
        <li>Número de teléfono</li>
      </ul>

      <h3>Uso de Sus Datos Personales</h3>
      <p>La empresa puede utilizar sus datos personales para los siguientes fines:</p>
      <ul>
        <li>Para proporcionar y mantener nuestro servicio.</li>
        <li>Para gestionar su cuenta.</li>
        <li>Para contactarle con actualizaciones y novedades.</li>
        <li>Para administrar sus solicitudes y consultas.</li>
      </ul>

      <h3>Retención de Sus Datos Personales</h3>
      <p>
        La empresa retendrá sus datos personales solo durante el tiempo necesario
        para los propósitos establecidos en esta Política de Privacidad.
      </p>

      <h3>Seguridad de Sus Datos Personales</h3>
      <p>
        La seguridad de sus datos personales es importante para nosotros, pero
        recuerde que ningún método de transmisión a través de Internet es 100%
        seguro.
      </p>

      <h2>Contacto</h2>
      <p>Si tiene alguna pregunta sobre esta política de privacidad, puede contactarnos:</p>
      <ul>
        <li>Por correo electrónico: soporte@glamperos.com</li>
      </ul>
    </div>
  );
};

export default PoliticasPrivacidad;

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import Swal from "sweetalert2";
import codigosPaises from "../../Componentes/IndicativosPaises/index"; // Uso de alias "@"
import "./estilos.css";

const InputTelefono = () => {
  // Recuperamos el email del usuario desde las cookies
  const emailUsuario = Cookies.get("correoUsuario");

  // Estados para manejar el teléfono y la visibilidad del input
  const [telefono, setTelefono] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [indicativo, setIndicativo] = useState("+57"); // Default indicativo de Colombia

  useEffect(() => {
    // Recuperar la cookie al cargar el componente
    const telefonoUsuarioCookie = Cookies.get("telefonoUsuario");  
    if (telefonoUsuarioCookie === "sintelefono") {
      setIsVisible(true); // Mostrar input si no existe la cookie
    } else {
      setIsVisible(false); // Ocultar input si la cookie existe
    }
  }, []); // Solo ejecuta este efecto al montar el componente

  // Maneja los cambios en el input de teléfono
  const handleTelefonoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valor = event.target.value;
    // Validamos que el input solo permita números y tenga un máximo de 10 caracteres
    if (/^\d*$/.test(valor) && valor.length <= 10) {
      setTelefono(valor);
    }
  };

  // Lógica para actualizar el teléfono del usuario
  const handleActualizarTelefono = async () => {
    // Anteponemos el indicativo seleccionado al número de teléfono
    const telefonoConPrefijo = `${indicativo.replace('+', '')}${telefono}`;
    try {
      // Actualizamos el teléfono del usuario en la API
      await axios.put(
        `https://glamperosapi.onrender.com/usuarios/${emailUsuario}/telefono`,
        { telefono: telefonoConPrefijo }
      );

      // Guardamos el nuevo teléfono en las cookies
      Cookies.set("telefonoUsuario", telefonoConPrefijo, { expires: 7, path: "/" });

      // Recargamos la página para reflejar los cambios
      window.location.reload();
    } catch (error) {
      console.error("Error al actualizar el teléfono:", error);
      Swal.fire({
        title: "Error",
        text: "Hubo un error al actualizar el teléfono. Intenta de nuevo.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };

  // Si el input no debe ser visible, no renderizamos nada
  if (!isVisible) return null;

  // Renderizamos el formulario de teléfono
  return (
    <div className="inputTelefonoContenedor">
      <div className="inputTelefonoPrefijo">
        <select 
          value={indicativo} 
          onChange={(e) => setIndicativo(e.target.value)}
          className="inputTelefonoSelect"
        >
          {codigosPaises.map((pais) => (
            <option key={pais.codigo} value={pais.indicativo}>
              {pais.nombre} ({pais.indicativo})
            </option>
          ))}
        </select>
      </div>
      <input
        type="text"
        className="inputTelefonoCampo"
        placeholder="Ingresa tu número de WhatsApp"
        value={telefono}
        onChange={handleTelefonoChange}
        maxLength={10} // Límite de 10 caracteres
      />
      <button className="inputTelefonoBoton" onClick={handleActualizarTelefono}>
        Actualizar WhatsApp
      </button>
    </div>
  );
};

export default InputTelefono;

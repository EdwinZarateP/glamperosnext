import { useContext } from "react";
import { ContextoApp } from "../../../context/AppContext";
import "./estilos.css"; 

interface PoliticasProps {
  diasCancelacion: number;
  fechaInicio: Date;
}

const Politicas: React.FC<PoliticasProps> = ({ diasCancelacion, fechaInicio }) => {
  const almacenVariables = useContext(ContextoApp);
  
  if (!almacenVariables) {
    throw new Error(
      "El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto."
    );
  }

  const { verPolitica, setVerPolitica } = almacenVariables;

  // Función para cerrar las políticas
  const cerrarPoliticas = () => {
    setVerPolitica(false);
  };

  if (!verPolitica) {
    return null; // No renderiza nada si `verPolitica` es false
  }

  // Calcular la última fecha en la que se puede cancelar con reembolso
  const fechaLimiteCancelacion = new Date(fechaInicio);
  fechaLimiteCancelacion.setDate(fechaInicio.getDate() - diasCancelacion);

  // Obtener la fecha actual
  const fechaActual = new Date();

  // Validar si la cancelación ya no es posible
  const cancelacionNoPermitida = fechaActual >= fechaLimiteCancelacion;

  return (
    <div className="Politicas-contenedor">
      <div className="Politicas-modal">
        <h2 className="Politicas-titulo">Políticas de Cancelación</h2>

        {cancelacionNoPermitida ? (
          <p className="Politicas-advertencia">
            Ten en cuenta que éste Glamping admite cancelaciones mínimo con {diasCancelacion} días de antelación y en éste momento no podrías cancelar tu reserva una vez realizada.             
          </p>
        ) : (
          <>
            <p className="Politicas-descripcion">
              1. <b>Reembolso 95%:</b> si cancelas hasta{" "}
              <b>{diasCancelacion} días antes</b> del check-in, es decir, hasta el{" "}
              <b>{fechaLimiteCancelacion.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}</b>.
            </p>
            <p className="Politicas-descripcion">
              2. <b>Sin reembolso:</b> si no cancelas antes de la fecha prevista por el Glamping no aplicará el rembolso.
            </p>
          </>
        )}

        <button className="Politicas-botonCerrar" onClick={cerrarPoliticas}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default Politicas;

import React from "react";
import NombreGlamping from "../../Componentes/NombreGlamping/index";
import BotonCompartir from "../../Componentes/BotonCompartir/index";
import BotonGuardar from "../../Componentes/BotonGuardar/index";
import "./estilos.css";

interface EncabezadoExploradoProps {
  nombreGlamping: string;
}

const EncabezadoExplorado: React.FC<EncabezadoExploradoProps> = ({
  nombreGlamping,
}) => {
  return (
    <div className="encabezado-explorado">
      <NombreGlamping nombreGlamping={nombreGlamping} />
      <div className="encabezado-explorado-botones">
        <BotonCompartir />
        <BotonGuardar />
      </div>
    </div>
  );
};

export default EncabezadoExplorado;

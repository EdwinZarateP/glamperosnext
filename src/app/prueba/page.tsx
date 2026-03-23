"use client";

import ListadoGlampings from "@/Componentes/ListadoGlampingsPrueba/ListadoGlampings";
import HeaderFinal from "../../Componentes/HeaderModificado";
import "./estilos.css";

function Prueba() {
  return (
    <div className="prueba-contenedor">
      <HeaderFinal />
      <ListadoGlampings />
    </div>
  );
}

export default Prueba;

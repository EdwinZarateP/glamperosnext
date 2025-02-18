"use client";

import ModificarGlamping from "@/Componentes/ModificarGlamping/index";
import ModificarFotos from "@/Componentes/ModificarFotos/index";
import SepararFechas from "@/Componentes/SepararFechas/index";
import HeaderIcono from "@/Componentes/HeaderIcono";
import "./estilos.css";

function Modificacion() {
  return (
    <div className="Modificacion-contenedor">
      <HeaderIcono descripcion="Glamperos" />
      <h1 className="Modificacion-titulo">Modificar datos del glamping</h1>
      <ModificarGlamping />
      <h1 className="Modificacion-titulo">Modifica tus fotos</h1>
      <ModificarFotos />
      <h1 className="Modificacion-titulo">Bloquear fechas</h1>
      <SepararFechas />
    </div>
  );
}

export default Modificacion;

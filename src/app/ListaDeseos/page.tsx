"use client";

import Favoritos from "@/Componentes/Favoritos";
import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior";
import "./estilos.css";

const ListaDeseos: React.FC = () => {
  return (
    <div className="ListaDeseos-contenedor">
      <Favoritos />
      <MenuUsuariosInferior />
    </div>
  );
};

export default ListaDeseos;

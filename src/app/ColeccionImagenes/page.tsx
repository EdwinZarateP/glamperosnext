"use client";

import FotosCollage from '../../Componentes/FotosCollage/index';
import HeaderIcono from '../../Componentes/HeaderIcono'; // Usando alias para la ruta
import './estilos.css'; // Manteniendo la importación de los estilos

function ColeccionImagenes() {
  return (
    <div className="ColeccionImagenes-contenedor">
      <HeaderIcono descripcion="Glamperos" />
      <FotosCollage />
    </div>
  );
}

export default ColeccionImagenes;

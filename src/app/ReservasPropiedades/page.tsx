"use client";
import ReservasPropietario from '../../Componentes/ReservasPropietario'; 
import HeaderIcono from '../../Componentes/HeaderIcono'; 
import MenuUsuariosInferior from '../../Componentes/MenuUsuariosInferior'; 
import './estilos.css';

function ReservasPropiedades() {
  return (
    <div className='ReservasClientes-contenedor'>
        <HeaderIcono descripcion="Glamperos" />
        <ReservasPropietario />
        <MenuUsuariosInferior/>
    </div>
  );
}

export default ReservasPropiedades;

"use client";
import ReservasCliente from '../../Componentes/ReservasCliente'; 
import HeaderIcono from '../../Componentes/HeaderIcono'; 
import MenuUsuariosInferior from '../../Componentes/MenuUsuariosInferior'; 
import './estilos.css';

function ReservasClientes() {
  return (
    <div className='ReservasClientes-contenedor'>
        <HeaderIcono descripcion="Glamperos" />
        <ReservasCliente />
        <MenuUsuariosInferior/>
    </div>
  );
}

export default ReservasClientes;

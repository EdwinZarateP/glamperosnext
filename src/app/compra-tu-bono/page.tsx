"use client";

import HeaderIcono from "../../Componentes/HeaderIcono"; 
import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior";
import CompraTuBono from "@/Componentes/Compra-tu-bono";
import Footer from "@/Componentes/Footer";
import "./estilos.css";

function ventaBonos() {
    return (
      <div className='ventaBonos-contenedor'>
        <HeaderIcono descripcion="Glamperos" />
        <div className='ventaBonos-contenedor'>
          <CompraTuBono/>
          <Footer/>
          <MenuUsuariosInferior/>
        </div>               
      </div>
    );
}

export default ventaBonos;

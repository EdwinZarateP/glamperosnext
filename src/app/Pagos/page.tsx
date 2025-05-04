"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import HeaderIcono from "../../Componentes/HeaderIcono";
import SolicitarPago from "../../Componentes/SolicitarPago/index";
import MenuUsuariosInferior from "../../Componentes/MenuUsuariosInferior";
import "./estilos.css";

function Pagos() {
  const [idPropietario, setIdPropietario] = useState<string | null>(null);

  useEffect(() => {
    const idUsuario = Cookies.get("idUsuario");
    if (idUsuario) {
      setIdPropietario(idUsuario);
    }
  }, []);

  return (
    <div className="Pagos-contenedor">
      <HeaderIcono descripcion="Glamperos" />
      {idPropietario ? <SolicitarPago idPropietario={idPropietario} /> : <p>Cargando...</p>}
      <MenuUsuariosInferior />
    </div>
  );
}

export default Pagos;

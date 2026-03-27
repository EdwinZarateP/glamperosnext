"use client";

import { VersionProvider, useVersion } from "@/context/VersionContext";
import SectionWrapper from "@/Componentes/Versionamiento/SectionWrapper";
import ListadoGlampings from "@/Componentes/ListadoGlampingsPrueba/ListadoGlampings";
import ListadoGlampingsV2 from "@/Componentes/ListadoGlampingsPrueba/ListadoGlampingsV2";
import HeaderFinal from "../../Componentes/HeaderModificado";
import "./estilos.css";

function ListadoSection() {
  const { current } = useVersion("listado", 2);
  const versiones = [<ListadoGlampings key="v1" />, <ListadoGlampingsV2 key="v2" />];
  return versiones[current];
}

function Prueba() {
  return (
    <VersionProvider>
      <div className="prueba-contenedor">
        <HeaderFinal />
        <SectionWrapper sectionId="listado" totalVersions={2} labels={["V1 Original", "V2 Nuevo"]}>
          <ListadoSection />
        </SectionWrapper>
      </div>
    </VersionProvider>
  );
}

export default Prueba;

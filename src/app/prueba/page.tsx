"use client";

import { VersionProvider, useVersion } from "@/context/VersionContext";
import SectionWrapper from "@/Componentes/Versionamiento/SectionWrapper";
import ListadoGlampingsV1 from "@/Componentes/ListadoGlampingsPrueba/V1/ListadoGlampingsV1";
import ListadoGlampingsV2 from "@/Componentes/ListadoGlampingsPrueba/V2/ListadoGlampingsV2";
import ListadoGlampingsV3 from "@/Componentes/ListadoGlampingsPrueba/V3/ListadoGlampingsV3";
import HeaderFinal from "../../Componentes/HeaderModificado";
import "./estilos.css";
import FooterFinal from "@/Componentes/FooterModificado";

function ListadoGlampingsSection() {
  const { current } = useVersion("listado-glamings");
  const versiones = [<ListadoGlampingsV1 key="v1" />, <ListadoGlampingsV2 key="v2" />, <ListadoGlampingsV3 key="v3" />];
  return versiones[current];
}

function Prueba() {
  return (
    <VersionProvider>
      <div className="prueba-contenedor">
        <HeaderFinal />
        <SectionWrapper sectionId="listado-glamings" labels={["Versión 1", "Versión 2", "Versión 3"]}>
          <ListadoGlampingsSection />
        </SectionWrapper>
        <FooterFinal />
      </div>
    </VersionProvider >
  );
}

export default Prueba;

"use client"; 

import React, { useContext, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { GiCampingTent } from "react-icons/gi";
import { ContextoApp } from "@/context/AppContext";
import CalendarioGeneral from "@/Componentes/CalendarioGeneral";
import Visitantes from "../Visitantes";
import viernesysabadosyfestivos from "@/Componentes/BaseFinesSemana/fds.json";
import { calcularTarifaServicio } from "@/Funciones/calcularTarifaServicio";
import { ExtraerTarifaGlamperos } from "@/Funciones/ExtraerTarifaGlamperos";
import { encryptData } from "@/Funciones/Encryptacion";
import "./estilos.css";

interface FormularioFechasProps {
  precioPorNoche: number;
  precioPersonaAdicional: number;
  descuento: number;
  admiteMascotas: boolean;
  Cantidad_Huespedes: number;
  Cantidad_Huespedes_Adicional: number;
}

const FormularioFechas: React.FC<FormularioFechasProps> = ({
  precioPorNoche,
  precioPersonaAdicional,
  descuento,
  admiteMascotas,
  Cantidad_Huespedes,
  Cantidad_Huespedes_Adicional,
}) => {
  // Obtenemos el contexto
  const almacenVariables = useContext(ContextoApp);
  if (!almacenVariables) {
    throw new Error(
      "El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto."
    );
  }

  // Desestructuramos las variables y setters del contexto
  const {
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    totalDias,
    setTotalDias,
    mostrarCalendario,
    setMostrarCalendario,
    mostrarVisitantes,
    setMostrarVisitantes,
    fechaInicioConfirmado,
    setFechaInicioConfirmado,
    fechaFinConfirmado,
    setFechaFinConfirmado,
    Cantidad_Adultos,
    setCantidad_Adultos,
    Cantidad_Ninos,
    setCantidad_Ninos,
    Cantidad_Bebes,
    setCantidad_Bebes,
    Cantidad_Mascotas,
    setCantidad_Mascotas,
    setUrlActual,
    setRedirigirExplorado,
  } = almacenVariables;

  // Router y SearchParams de Next.js
  const searchParams = useSearchParams();
  const router = useRouter();

  // Obtenemos los params de la URL
  const glampingId = searchParams.get("glampingId");
  const fechaInicioUrl = searchParams.get("fechaInicioUrl");
  const fechaFinUrl = searchParams.get("fechaFinUrl");
  const totalDiasUrl = searchParams.get("totalDiasUrl");
  const totalAdultosUrl = searchParams.get("totalAdultosUrl");
  const totalNinosUrl = searchParams.get("totalNinosUrl");
  const totalBebesUrl = searchParams.get("totalBebesUrl");
  const totalMascotasUrl = searchParams.get("totalMascotasUrl");

  // 1️⃣ Asignar valores iniciales desde la URL al contexto cuando se renderiza por primera vez
  useEffect(() => {
    // Si tenemos fechaInicioUrl válida, actualizar fechaInicio en el contexto
    if (fechaInicioUrl) {
      const parsed = new Date(fechaInicioUrl);
      if (!isNaN(parsed.getTime())) {
        setFechaInicio(parsed);
      }
    }

    // Si tenemos fechaFinUrl válida, actualizar fechaFin en el contexto
    if (fechaFinUrl) {
      const parsed = new Date(fechaFinUrl);
      if (!isNaN(parsed.getTime())) {
        setFechaFin(parsed);
      }
    }

    // Asignar variables de huéspedes (con parseo a int)
    const adultos = parseInt(totalAdultosUrl || "1", 10);
    const ninos = parseInt(totalNinosUrl || "0", 10);
    const bebes = parseInt(totalBebesUrl || "0", 10);
    const mascotas = parseInt(totalMascotasUrl || "0", 10);

    setCantidad_Adultos(isNaN(adultos) ? 1 : adultos);
    setCantidad_Ninos(isNaN(ninos) ? 0 : ninos);
    setCantidad_Bebes(isNaN(bebes) ? 0 : bebes);
    setCantidad_Mascotas(isNaN(mascotas) ? 0 : mascotas);
  }, [
    fechaInicioUrl,
    fechaFinUrl,
    totalAdultosUrl,
    totalNinosUrl,
    totalBebesUrl,
    totalMascotasUrl,
    setFechaInicio,
    setFechaFin,
    setCantidad_Adultos,
    setCantidad_Ninos,
    setCantidad_Bebes,
    setCantidad_Mascotas,
  ]);

  
  // 2️⃣ Cada vez que cambien las variables de contexto, actualizar la URL
  useEffect(() => {
    if (!fechaInicio || !fechaFin) return; // No hacemos nada si faltan fechas

    const queryParams = new URLSearchParams({
      glampingId: glampingId || "",
      fechaInicioUrl: fechaInicio.toISOString().split("T")[0],
      fechaFinUrl: fechaFin.toISOString().split("T")[0],
      totalDiasUrl: totalDias.toString(),
      totalAdultosUrl: Cantidad_Adultos.toString(),
      totalNinosUrl: Cantidad_Ninos.toString(),
      totalBebesUrl: Cantidad_Bebes.toString(),
      totalMascotasUrl: Cantidad_Mascotas.toString(),
    });

    router.replace(`/ExplorarGlamping?${queryParams.toString()}`, { scroll: false });
  }, [
    fechaInicio,
    fechaFin,
    totalDias,
    Cantidad_Adultos,
    Cantidad_Ninos,
    Cantidad_Bebes,
    Cantidad_Mascotas,
    glampingId,
    router,
  ]);

  // 3️⃣ Calcular tarifas y renders (manteniendo toda tu lógica)
  // Prioridad: usar fecha del contexto, de lo contrario usar la de la URL.
  const fechaInicioRender = fechaInicio ?? (fechaInicioUrl ? new Date(fechaInicioUrl) : null);
  const fechaFinRender = fechaFin ?? (fechaFinUrl ? new Date(fechaFinUrl) : null);

  // Determinar totalDiasRender
  let totalDiasRender = 1;
  if (fechaInicioRender && fechaFinRender) {
    const diffMs = fechaFinRender.getTime() - fechaInicioRender.getTime();
    totalDiasRender = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  } else if (totalDiasUrl) {
    totalDiasRender = parseInt(totalDiasUrl, 10);
  }

  const adultosRender = Cantidad_Adultos || (totalAdultosUrl ? parseInt(totalAdultosUrl, 10) : 1);
  const ninosRender = Cantidad_Ninos || (totalNinosUrl ? parseInt(totalNinosUrl, 10) : 0);
  const bebesRender = Cantidad_Bebes || (totalBebesUrl ? parseInt(totalBebesUrl, 10) : 0);
  const mascotasRender = Cantidad_Mascotas || (totalMascotasUrl ? parseInt(totalMascotasUrl, 10) : 0);

  const totalHuespedesRender = adultosRender + ninosRender;

  // Fechas por defecto
  const hoy = new Date();
  const fechaInicioPorDefecto = new Date(hoy.getTime() + 24 * 60 * 60 * 1000);
  const fechaFinPorDefecto = new Date(hoy.getTime() + 2 * 24 * 60 * 60 * 1000);

  // Convertir fechas a string
  const fechaInicioReservada = fechaInicio
    ? fechaInicio.toISOString().split("T")[0]
    : fechaInicioUrl
    ? new Date(fechaInicioUrl).toISOString().split("T")[0]
    : fechaInicioPorDefecto.toISOString().split("T")[0];

  let fechaFinReservada = fechaFin
    ? fechaFin.toISOString().split("T")[0]
    : fechaFinUrl
    ? new Date(fechaFinUrl).toISOString().split("T")[0]
    : fechaFinPorDefecto.toISOString().split("T")[0];

  // Validar que fechaFin > fechaInicio
  if (new Date(fechaInicioReservada) > new Date(fechaFinReservada)) {
    const nuevaFechaFin = new Date(fechaInicioReservada);
    nuevaFechaFin.setDate(nuevaFechaFin.getDate() + 1);
    fechaFinReservada = nuevaFechaFin.toISOString().split("T")[0];
  }

  // Calcular tarifas
  const precioConTarifa = calcularTarifaServicio(
    precioPorNoche,
    viernesysabadosyfestivos,
    descuento,
    fechaInicioReservada ?? fechaInicioPorDefecto,
    fechaFinReservada ?? fechaFinPorDefecto
  );

  const precioConTarifaAdicional = calcularTarifaServicio(
    precioPersonaAdicional,
    viernesysabadosyfestivos,
    0,
    fechaInicioReservada ?? fechaInicioPorDefecto,
    fechaFinReservada ?? fechaFinPorDefecto
  );

  const porcentajeGlamperos = ExtraerTarifaGlamperos(precioPorNoche);

  function formatearFecha(fecha: Date | null): string {
    if (!fecha) return "-";
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(fecha);
  }

  const TarifaGlamperos = Math.round(
    precioConTarifa - precioConTarifa * (1 / (1 + porcentajeGlamperos))
  );
  const TarifaGlamperosAdicional = Math.round(
    precioConTarifaAdicional -
      precioConTarifaAdicional * (1 / (1 + porcentajeGlamperos))
  );

  // Tarifa Total
  function calcularTotalFinal(
    totalHuespedes: number,
    Cantidad_Huespedes: number,
    precioConTarifa: number,
    porcentajeGlamperos: number,
    precioPersonaAdicional: number,
    totalDiasRender: number,
    TarifaGlamperos: number,
    TarifaGlamperosAdicional: number
  ): number {
    if (totalHuespedes - Cantidad_Huespedes > 0) {
      return Math.round(
        precioConTarifa * (1 / (1 + porcentajeGlamperos)) +
          precioPersonaAdicional * totalDiasRender * (totalHuespedes - Cantidad_Huespedes) +
          (TarifaGlamperos + TarifaGlamperosAdicional * (totalHuespedes - Cantidad_Huespedes))
      );
    } else {
      return precioConTarifa;
    }
  }

  const TotalFinal = calcularTotalFinal(
    totalHuespedesRender,
    Cantidad_Huespedes,
    precioConTarifa,
    porcentajeGlamperos,
    precioPersonaAdicional,
    totalDiasRender,
    TarifaGlamperos,
    TarifaGlamperosAdicional
  );

  function calcularTarifaGlamperosFn(
    totalHuespedes: number,
    Cantidad_Huespedes: number,
    TarifaGlamperos: number,
    TarifaGlamperosAdicional: number
  ): number {
    if (totalHuespedes - Cantidad_Huespedes > 0) {
      return TarifaGlamperos + TarifaGlamperosAdicional * (totalHuespedes - Cantidad_Huespedes);
    } else {
      return TarifaGlamperos;
    }
  }

  const tarifaFinalGlamperos = calcularTarifaGlamperosFn(
    totalHuespedesRender,
    Cantidad_Huespedes,
    TarifaGlamperos,
    TarifaGlamperosAdicional
  );

  // Efecto para confirmar fechas en el contexto
  useEffect(() => {
    if (!fechaInicioConfirmado && fechaInicioUrl) {
      setFechaInicioConfirmado(new Date(fechaInicioUrl));
    }
    if (!fechaFinConfirmado && fechaFinUrl) {
      setFechaFinConfirmado(new Date(fechaFinUrl));
    }
  }, [
    fechaInicioUrl,
    fechaFinUrl,
    fechaInicioConfirmado,
    fechaFinConfirmado,
    setFechaInicioConfirmado,
    setFechaFinConfirmado,
  ]);

  // Para evitar scroll cuando se abre Visitantes
  useEffect(() => {
    if (mostrarVisitantes) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [mostrarVisitantes]);

  // Validar que las fechas sean correctas
  const validarFechas = (): boolean => {
    if (!fechaInicio || !fechaFin) {
      Swal.fire({
        icon: "warning",
        title: "¡Ups! 🤔",
        text: `La fecha de salida debe ser mayor que la fecha de llegada. Borra fechas e intenta nuevamente.`,
        confirmButtonText: "Aceptar",
      });
      return false;
    }
    return true;
  };

  // Validar sesión antes de reservar
  const ValidarSesion = (email: string) => {
    const fechaInicioEncriptada = encodeURIComponent(encryptData(fechaInicioReservada));
    const fechaFinEncriptada = encodeURIComponent(encryptData(fechaFinReservada));
    const mascotasEncriptadas = encodeURIComponent(encryptData(mascotasRender.toString()));
    const adultosEncriptados = encodeURIComponent(encryptData(adultosRender.toString()));
    const ninosEncriptados = encodeURIComponent(encryptData(ninosRender.toString()));
    const bebesEncriptados = encodeURIComponent(encryptData(bebesRender.toString()));
    const totalFinalEncriptado = encodeURIComponent(encryptData(TotalFinal.toString()));
    const tarifaEncriptada = encodeURIComponent(encryptData(tarifaFinalGlamperos.toString()));

    const nuevaUrl = `/Reservar/${glampingId}/${fechaInicioEncriptada}/${fechaFinEncriptada}/${totalFinalEncriptado}/${tarifaEncriptada}/${totalDiasRender}/${adultosEncriptados}/${ninosEncriptados}/${bebesEncriptados}/${mascotasEncriptadas}`;
    setUrlActual(nuevaUrl);
    setRedirigirExplorado(true);

    if (email === "sesionCerrada") {
      Swal.fire({
        title: "¡Estás muy cerca!",
        text: "Debes iniciar sesión primero para continuar.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      }).then(() => {
        router.push("/RegistroPag");
      });
    }
  };

  // Manejar el click en "Reservar"
  const handleReservarClick = (e: React.MouseEvent) => {
    const emailUsuario = Cookies.get("correoUsuario");

    const fechaInicioEncriptada = encodeURIComponent(encryptData(fechaInicioReservada));
    const fechaFinEncriptada = encodeURIComponent(encryptData(fechaFinReservada));
    const mascotasEncriptadas = encodeURIComponent(encryptData(mascotasRender.toString()));
    const adultosEncriptados = encodeURIComponent(encryptData(adultosRender.toString()));
    const ninosEncriptados = encodeURIComponent(encryptData(ninosRender.toString()));
    const bebesEncriptados = encodeURIComponent(encryptData(bebesRender.toString()));
    const totalFinalEncriptado = encodeURIComponent(encryptData(TotalFinal.toString()));
    const tarifaEncriptada = encodeURIComponent(encryptData(tarifaFinalGlamperos.toString()));

    if (!emailUsuario) {
      ValidarSesion("sesionCerrada");
      e.preventDefault();
      return;
    }

    if (!validarFechas()) return;

    const nuevaUrl = `/Reservar/${glampingId}/${fechaInicioEncriptada}/${fechaFinEncriptada}/${totalFinalEncriptado}/${tarifaEncriptada}/${totalDiasRender}/${adultosEncriptados}/${ninosEncriptados}/${bebesEncriptados}/${mascotasEncriptadas}`;
    router.push(nuevaUrl);
  };

  // Render final
  return (
    <>
      <div className="FormularioFechas-contenedor">
        {/* Sección de precio */}
        <div className="FormularioFechas-precio">
          <span className="FormularioFechas-precioNoche">
            {totalHuespedesRender - Cantidad_Huespedes > 0
              ? `${(
                  Math.round(
                    precioConTarifa * (1 / (1 + porcentajeGlamperos)) +
                      precioPersonaAdicional *
                        totalDiasRender *
                        (totalHuespedesRender - Cantidad_Huespedes) +
                      (TarifaGlamperos +
                        TarifaGlamperosAdicional *
                          (totalHuespedesRender - Cantidad_Huespedes))
                  ) / totalDiasRender
                ).toLocaleString()} COP`
              : `${Math.round(precioConTarifa / totalDiasRender).toLocaleString()} COP `}
          </span>
          <span> / noche</span>
        </div>

        {/* Selección de Fechas */}
        <div
          className="FormularioFechas-fechas"
          onClick={() => {
            setCantidad_Adultos(adultosRender);
            setFechaInicio(fechaInicioRender || null);
            setFechaFin(fechaFinRender || null);
            setTotalDias(totalDiasRender);
            setMostrarCalendario(true);
          }}
        >
          <div className="FormularioFechas-fecha">
            <span className="FormularioFechas-fechaTitulo">LLEGADA</span>
            <span>
              {fechaInicioRender ? formatearFecha(fechaInicioRender) : "-"}
            </span>
          </div>
          <div className="FormularioFechas-fecha">
            <span className="FormularioFechas-fechaTitulo">SALIDA</span>
            <span>{fechaFinRender ? formatearFecha(fechaFinRender) : "-"}</span>
          </div>
        </div>

        {/* Selección de Huéspedes */}
        <div
          className="FormularioFechas-huespedes"
          onClick={() => {
            setCantidad_Adultos(adultosRender);
            setCantidad_Ninos(ninosRender);
            setCantidad_Bebes(bebesRender);
            setCantidad_Mascotas(mascotasRender);
            setMostrarVisitantes(true);
          }}
        >
          <span>Huéspedes</span>
          <span>
            {adultosRender + ninosRender} huésped
            {adultosRender + ninosRender > 1 ? "es" : ""}
          </span>
        </div>

        {/* Botón Reservar */}
        <button className="FormularioFechas-botonReserva" onClick={handleReservarClick}>
          <GiCampingTent className="FormularioFechas-botonReserva-icono" />
          Reservar
        </button>

        <p className="FormularioFechas-info">No se hará ningún cargo por ahora</p>

        {/* Detalle de Costo */}
        <div className="FormularioFechas-detalleCosto">
          <div className="FormularioFechas-item">
            <span>
              {Math.round(
                (precioConTarifa / totalDiasRender) *
                  (1 / (1 + porcentajeGlamperos))
              ).toLocaleString()}{" "}
              x{" "}
              {totalDiasRender === 1
                ? totalDiasRender
                : totalDiasRender}{" "}
              noche{totalDiasRender > 1 ? "s" : ""}
            </span>
            <span>
              {Math.round(
                precioConTarifa * (1 / (1 + porcentajeGlamperos))
              ).toLocaleString()}{" "}
              COP
            </span>
          </div>

          {/* Si hay más huéspedes de los incluidos */}
          {totalHuespedesRender - Cantidad_Huespedes > 0 && (
            <div className="FormularioFechas-item-adicional">
              <span>
                Este glamping solo incluye {Cantidad_Huespedes} huésped
                {Cantidad_Huespedes > 1 ? "es" : ""} en su tarifa; cada persona
                adicional tendrá un costo extra de{" "}
                {precioPersonaAdicional.toLocaleString()} COP por noche
              </span>
            </div>
          )}

          {totalHuespedesRender - Cantidad_Huespedes > 0 && (
            <div className="FormularioFechas-item">
              <span>
                {precioPersonaAdicional.toLocaleString()} x{" "}
                {totalHuespedesRender - Cantidad_Huespedes}{" "}
                {totalHuespedesRender - Cantidad_Huespedes === 1
                  ? "adicional"
                  : "adicionales"}{" "}
                x {totalDiasRender} noche
                {totalDiasRender > 1 ? "s" : ""}
              </span>
              <span>
                {(
                  precioPersonaAdicional *
                  totalDiasRender *
                  (totalHuespedesRender - Cantidad_Huespedes)
                ).toLocaleString()}{" "}
                COP
              </span>
            </div>
          )}

          <div className="FormularioFechas-item">
            <span>Tarifa por servicio Glamperos</span>
            <span>{tarifaFinalGlamperos.toLocaleString()} COP</span>
          </div>
        </div>

        {/* Total */}
        <div className="FormularioFechas-total">
          <span>Total</span>
          <span>{TotalFinal.toLocaleString()} COP</span>
        </div>
      </div>

      {/* Componente CalendarioGeneral */}
      {mostrarCalendario && (
        <CalendarioGeneral cerrarCalendario={() => setMostrarCalendario(false)} />
      )}

      {/* Componente Visitantes */}
      {mostrarVisitantes && (
        <Visitantes
          max_adultos={10}
          max_Ninos={10}
          max_bebes={5}
          max_huespedes={Cantidad_Huespedes + Cantidad_Huespedes_Adicional}
          max_mascotas={admiteMascotas ? 5 : 0}
          onCerrar={() => setMostrarVisitantes(false)}
        />
      )}
    </>
  );
};

export default FormularioFechas;

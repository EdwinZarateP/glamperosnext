'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import { createPortal } from 'react-dom';
import { ContextoApp } from "../../context/AppContext";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { DateRange } from 'react-date-range';
import { es } from 'date-fns/locale';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { calcularTarifaReserva, ResultadoTarifa } from '@/Funciones/calcularTarifaReserva';
import finesSemanaData from '@/Componentes/BaseFinesSemana/fds.json';
import Cookies from "js-cookie";
import { apiReservacion, ReservacionParams } from "@/Funciones/apiReservacion";
import Swal from "sweetalert2";
import './estilos.css';
import ModalTelefono from "@/Componentes/ModalTelefono";
import Script from 'next/script';

/** Formatea 'YYYY-MM-DD' a fecha corta */
const formatearFechaCorta = (fechaStr: string) => {
  const date = parseYMD(fechaStr);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/** Parsea 'YYYY-MM-DD' como Date local */
function parseYMD(fecha: string): Date {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Formatea Date a YYYY-MM-DD sin UTC */
function formatDateLocal(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}


interface Huespedes {
  adultos: number;
  ninos: number;
  bebes: number;
  mascotas: number;
}

interface FormularioReservaMobileProps {
  initialData: any;
  onFechaFinActualizada?: (fechaFin: string) => void;
  onHuespedesActualizados?: (huespedes: Huespedes) => void;
}

const FormularioReservaMobile: React.FC<FormularioReservaMobileProps> = ({
  initialData,
  onFechaFinActualizada = () => {},
  onHuespedesActualizados = () => {},
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Obtenemos el contexto
  const almacenVariables = useContext(ContextoApp);
  if (!almacenVariables) {
    throw new Error(
      "El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto."
    );
  }

  // Datos iniciales
  const fechasReservadas: string[] = initialData.fechasReservadas || [];
  const aceptaMascotas = !!initialData.Acepta_Mascotas;
  const capacidadBase = Number(initialData.Cantidad_Huespedes || 0);
  const capacidadExtra = Number(initialData.Cantidad_Huespedes_Adicional || 0);
  const maxHuespedes = capacidadBase + capacidadExtra;

  const getParam = (key: string, fallback: string) =>
    searchParams.get(key) ?? fallback;

  // Fechas reservadas
  const reservedDates: Date[] = fechasReservadas.map(d => {
    const dt = parseYMD(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
  });

  const isSameDay = (a: Date, b: Date) => a.getTime() === b.getTime();
  const hasInteriorReserved = (start: Date, end: Date) =>
    reservedDates.some(d => d > start && d < end);

  /** Próximo sábado/domingo */
  const getNextWeekend = (from = new Date()): [Date, Date] => {
    const day = from.getDay();
    const diffSat = (6 - day + 7) % 7 || 7;
    const sat = new Date(from);
    sat.setDate(from.getDate() + diffSat);
    const sun = new Date(sat);
    sun.setDate(sat.getDate() + 1);
    return [sat, sun];
  };

  // Estados de fechas
  const [fechaInicio, setFechaInicio] = useState<string>(
    getParam('fechaInicioUrl', '')
  );
  const [fechaFin, setFechaFin] = useState<string>(
    getParam('fechaFinUrl', '')
  );
  const [range, setRange] = useState([
    {
      startDate: fechaInicio ? parseYMD(fechaInicio) : new Date(),
      endDate: fechaFin ? parseYMD(fechaFin) : new Date(),
      key: 'selection',
    },
  ]);

  // Estados de huéspedes
  const [huespedes, setHuespedes] = useState<Huespedes>({
    adultos: Math.max(2, Number(getParam('totalAdultosUrl', '1'))),
    ninos: Number(getParam('totalNinosUrl', '0')),
    bebes: Number(getParam('totalBebesUrl', '0')),
    mascotas: Number(getParam('totalMascotasUrl', '0')),
  });

  // Tarifa calculada
  const [tarifa, setTarifa] = useState<ResultadoTarifa | null>(null);

  // Control de modales
  const [modalFechas, setModalFechas] = useState(false);
  const [modalHuespedes, setModalHuespedes] = useState(false);
  const [mostrarModalTelefono, setMostrarModalTelefono] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // 1) Inicializar fin de semana si no hay params
  useEffect(() => {
    if (!getParam('fechaInicioUrl', '') && !getParam('fechaFinUrl', '')) {
      let [sat, sun] = getNextWeekend();
      let i = 0;
      while (
        (reservedDates.some(d => isSameDay(d, sat)) ||
          reservedDates.some(d => isSameDay(d, sun)) ||
          hasInteriorReserved(sat, sun)) &&
        i < 10
      ) {
        sat.setDate(sat.getDate() + 7);
        sun.setDate(sun.getDate() + 7);
        i++;
      }
      const iStr = formatDateLocal(sat);
      const fStr = formatDateLocal(sun);

      setRange([{ startDate: sat, endDate: sun, key: 'selection' }]);
      setFechaInicio(iStr);
      setFechaFin(fStr);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 2) Sincronizar URL
  useEffect(() => {
    const p = new URLSearchParams();
    if (fechaInicio) p.set('fechaInicioUrl', fechaInicio);
    if (fechaFin) p.set('fechaFinUrl', fechaFin);
    p.set('totalAdultosUrl', String(huespedes.adultos));
    p.set('totalNinosUrl', String(huespedes.ninos));
    p.set('totalBebesUrl', String(huespedes.bebes));
    p.set('totalMascotasUrl', String(huespedes.mascotas));
    window.history.replaceState({}, '', `${pathname}?${p}`);
  }, [fechaInicio, fechaFin, huespedes, pathname]);

  // 3) Cambio de rango
  const onRangeChange = ({ selection }: any) => {
    const s = selection.startDate;
    const e = selection.endDate;
    if (reservedDates.some(d => isSameDay(d, s))) {
      alert('No puedes iniciar en una fecha reservada.');
      return;
    }
    if (hasInteriorReserved(s, e)) {
      alert('El rango incluye fechas reservadas.');
      return;
    }
    const iStr = s.toISOString().slice(0, 10);
    const fStr = e.toISOString().slice(0, 10);
    setRange([{ ...selection }]);
    setFechaInicio(iStr);
    setFechaFin(fStr);
    onFechaFinActualizada(fStr);
  };

  // 4) Ajuste de huéspedes
  const actualizarHuesped = (key: keyof Huespedes, delta: number) => {
    if (key === 'mascotas' && !aceptaMascotas) return;
    setHuespedes(prev => {
      let n = prev[key] + delta;
      n = key === 'adultos' ? Math.max(1, n) : Math.max(0, n);
      if (
        (key === 'adultos' || key === 'ninos') &&
        prev.adultos + prev.ninos + delta > maxHuespedes
      )
        return prev;
      return { ...prev, [key]: n };
    });
    onHuespedesActualizados(huespedes);
  };

  // 5) Recalcular tarifa
  useEffect(() => {
    if (!fechaInicio || !fechaFin) {
      setTarifa(null);
      return;
    }
    let start = parseYMD(fechaInicio);
    let end = parseYMD(fechaFin);
    if (start > end) {
      [start, end] = [end, start];
      const i = start.toISOString().slice(0, 10);
      const f = end.toISOString().slice(0, 10);
      setFechaInicio(i);
      setFechaFin(f);
    }
    const cant = huespedes.adultos + huespedes.ninos;
    const vsf = finesSemanaData.viernesysabadosyfestivos;
    const res = calcularTarifaReserva({
      initialData,
      viernesysabadosyfestivos: vsf,
      fechaInicio: formatDateLocal(start),
      fechaFin: formatDateLocal(end),
      cantidadHuespedes: cant,
    });
    setTarifa(res);
  }, [fechaInicio, fechaFin, huespedes.adultos, huespedes.ninos]); // eslint-disable-line react-hooks/exhaustive-deps

  // 6) Cierre de modales externo
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (overlayRef.current && e.target === overlayRef.current) {
        if (modalFechas && (!fechaFin || fechaFin === fechaInicio)) {
          const [sat, sun] = getNextWeekend(parseYMD(fechaInicio));
          const sstr = formatDateLocal(sat);
          const fstr = formatDateLocal(sun);
          setRange([{ startDate: sat, endDate: sun, key: 'selection' }]);
          setFechaInicio(sstr);
          setFechaFin(fstr);
          onFechaFinActualizada(fstr);
        }
        setModalFechas(false);
        setModalHuespedes(false);
      }
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [modalFechas, fechaInicio, fechaFin, onFechaFinActualizada]);

  // 7) Reservar
  const handleReservarClick = async () => {
    // 1️⃣ Validar fechas seleccionadas
    const start = parseYMD(fechaInicio);
    const end = parseYMD(fechaFin);
    if (reservedDates.some(d => d >= start && d <= end)) {
      Swal.fire({
        icon: "error",
        title: "Fechas no disponibles",
        text: "El rango que elegiste incluye días ya reservados."
      });
      return;
    }

    // 2️⃣ Validar sesión
    const idClienteCookie = Cookies.get("idUsuario") || "";
    if (!idClienteCookie) {
      Swal.fire({
        icon: "warning",
        title: "Debes iniciar sesión",
        text: "Para reservar, primero inicia sesión o regístrate."
      }).then(() => {
        Cookies.set("redirigirExplorado", "true");
        Cookies.set("UrlActual", window.location.href); 
        router.push("/registro");
      });
      return;
    }

    // 3️⃣ Validación teléfono (si quisieras abrir modal aquí)
    const telefonoUsuario = Cookies.get("telefonoUsuario") || "";
    if (!telefonoUsuario || telefonoUsuario === "sintelefono") {
      setMostrarModalTelefono(true);
      return;
    }

    // 4️⃣ Llamada a la API de pagos
    try {
      // —— Aquí está el único cambio: extraer ID con usePathname()
      const segments = pathname.split('/');
      const glampingId = segments[2] ?? '';
      Cookies.set('cookieGlampingId', glampingId, {expires: 7,path: '/' });
      const params: ReservacionParams = {
        idCliente: idClienteCookie,
        idPropietario: initialData.propietario_id,
        idGlamping: glampingId,
        ciudad_departamento: initialData.ciudad_departamento,
        fechaInicio: new Date(`${fechaInicio}T00:00:00`),
        fechaFin: new Date(`${fechaFin}T00:00:00`),
        totalDias: tarifa!.totalDiasFacturados,
        valorTotalCOP: tarifa!.costoTotalConIncremento,
        tarifaServicioCOP: tarifa!.tarifaServicio,
        pagoGlampingCOP: tarifa!.pagoGlamping,
        adultos: huespedes.adultos,
        ninos: huespedes.ninos,
        bebes: huespedes.bebes,
        mascotas: huespedes.mascotas,
      };

      const wompiOverlay = document.querySelector('.wc-overlay-backdrop') 
                      || document.querySelector('.widget__overlay');
      if (wompiOverlay && wompiOverlay.parentNode) {
        wompiOverlay.parentNode.removeChild(wompiOverlay);
      }
      const codigoReserva = await apiReservacion(params);
      // Crear el objeto con los datos de la compra
      const transaccion = {
        event: "purchase",
        ecommerce: {
          transaction_id: codigoReserva, // o un ID único de la reserva
          value: tarifa!.costoTotalConIncremento,
          currency: "COP",
          items: [
            {
              item_id: initialData._id, // ID del glamping
              item_name: initialData.nombreGlamping,
              quantity: 1,
              value: tarifa!.costoTotalConIncremento
            }
          ]
        }
      };

      // Guardar en cookie por 1 día
      Cookies.set("transaccionFinal", JSON.stringify(transaccion), { expires: 1, path: "/" });

      console.log("✅ transaccionFinal guardada:", transaccion);      
      router.push("/gracias");
    } catch (err: any) {
      Swal.fire("Error", err.message || "Algo salió mal", "error");
    }
  };

  // Construye el modal en un portal fuera del stacking context actual
  const modalPortal = (modalFechas || modalHuespedes) &&
    createPortal(
      <div className="formularioReservaMobile-overlay" ref={overlayRef}>
        {modalFechas && (
          <div className="formularioReservaMobile-modal">
            <DateRange
              locale={es}
              ranges={range}
              onChange={onRangeChange}
              moveRangeOnFirstSelection={false}
              disabledDates={reservedDates}
              minDate={new Date()}
              rangeColors={['#2f6b3e']}
              monthDisplayFormat="MMMM yyyy"
            />
            <button
              className="formularioReservaMobile-submit"
              onClick={() => {
                if (!fechaFin || fechaFin === fechaInicio) {
                  const [sat, sun] = getNextWeekend(parseYMD(fechaInicio));
                  const sstr = sat.toISOString().slice(0, 10);
                  const fstr = sun.toISOString().slice(0, 10);
                  setRange([{ startDate: sat, endDate: sun, key: 'selection' }]);
                  setFechaInicio(sstr);
                  setFechaFin(fstr);
                  onFechaFinActualizada(fstr);
                }
                setModalFechas(false);
              }}
            >
              Establecer fechas
            </button>
          </div>
        )}
        {modalHuespedes && (
          <div className="formularioReservaMobile-modal formularioReservaMobile-modal-huespedes">
            <div className="formularioReservaMobile-huespedes-header">
              <img
                src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/pareja.png"
                alt="Pareja"
                className="formularioReservaMobile-pareja-icono"
              />
            </div>
            {(['adultos','ninos','bebes','mascotas'] as (keyof Huespedes)[]).map(k => (
              <div key={k} className="formularioReservaMobile-huesped-row">
                <span className="formularioReservaMobile-huesped-label">
                  {k === 'adultos' && <>Adultos<div className="formularioReservaMobile-huesped-sub">Edad: 13 años o más</div></>}
                  {k === 'ninos'   && <>Niños <div className="formularioReservaMobile-huesped-sub">Edades 2 – 12</div></>}
                  {k === 'bebes'   && <>Bebés <div className="formularioReservaMobile-huesped-sub">Menos de 2 años</div></>}
                  {k === 'mascotas'&& <>Mascotas<div className="formularioReservaMobile-huesped-sub">Tu fiel amigo también lo merece</div></>}
                  {k === 'mascotas' && !aceptaMascotas && <span className="labelNoMascotas">No se aceptan mascotas</span>}
                </span>
                <div className="formularioReservaMobile-huesped-controls">
                  <button onClick={() => actualizarHuesped(k, -1)}
                    disabled={
                      (k === 'adultos' && huespedes.adultos <= 1) ||
                      (k !== 'adultos' && huespedes[k] <= 0) ||
                      (k === 'mascotas' && !aceptaMascotas)
                    }
                  >−</button>
                  <span>{huespedes[k]}</span>
                  <button onClick={() => actualizarHuesped(k, 1)}
                    disabled={
                      ((k === 'adultos' || k === 'ninos') && huespedes.adultos + huespedes.ninos >= maxHuespedes) ||
                      (k === 'bebes' && huespedes.bebes >= 3) ||
                      (k === 'mascotas' && (!aceptaMascotas || huespedes.mascotas >= 3))
                    }
                  >+</button>
                </div>
              </div>
            ))}
            <button className="formularioReservaMobile-elegidos" onClick={() => setModalHuespedes(false)}>
              Ellos son los elegidos
            </button>
            <p className="formularioReservaMobile-citaBiblica">
              <span role="img" aria-label="pareja"></span> Ámense unos a otros con un afecto genuino y deléitense al honrarse mutuamente. Romanos 12:10
            </p>
          </div>
        )}
      </div>,
      document.body
    );

  return (
    <>
      <Script
        src="https://checkout.wompi.co/widget.js"
        strategy="afterInteractive"
        onLoad={() => console.log("✅ Wompi widget cargado")}
      />

      <div className="formularioReservaMobile-container">
        <div className="formularioReservaMobile-summary-container">
          <div className="formularioReservaMobile-price">
            {tarifa && (
              <span className="precio-noche">
                ${tarifa.costoTotalConIncremento.toLocaleString('es-CO')}
              </span>
            )}
          </div>

          <div className="formularioReservaMobile-buttons">
            <button
              className="formularioReservaMobile-date-button"
              onClick={() => setModalFechas(true)}
            >
              <div className="formularioReservaMobile-date-content">
                <div className="labelResumen">FECHAS</div>
                <div>{fechaInicio ? formatearFechaCorta(fechaInicio) : '--'} - {fechaFin ? formatearFechaCorta(fechaFin) : '--'}</div>
              </div>
            </button>

            <button
              className="formularioReservaMobile-guests-button"
              onClick={() => setModalHuespedes(true)}
            >
              <div className="formularioReservaMobile-guests-content">
                <div className="labelResumen">HUÉSPEDES</div>
                <div>
                  {huespedes.adultos + huespedes.ninos} huésped
                  {huespedes.adultos + huespedes.ninos !== 1 ? 'es' : ''}
                </div>
              </div>
            </button>

            <button
              className="formularioReservaMobile-reserve-button"
              onClick={handleReservarClick}
            >
              Reservar
            </button>
          </div>
        </div>
      </div>

      {modalPortal}
      {mostrarModalTelefono && Cookies.get("correoUsuario") && (
        <ModalTelefono
          email={Cookies.get("correoUsuario")!}
          onClose={() => setMostrarModalTelefono(false)}
          onSaved={(nuevoTelefono: string) => {
            Cookies.set("telefonoUsuario", nuevoTelefono);
            setMostrarModalTelefono(false);
            handleReservarClick(); 
          }}
        />
      )}

      <style jsx>{`
        @media (min-width: 900px) {
          .formularioReservaMobile-container {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default FormularioReservaMobile;
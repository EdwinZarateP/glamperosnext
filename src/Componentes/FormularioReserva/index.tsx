import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { DateRange } from 'react-date-range';
import { es } from 'date-fns/locale';
import Cookies from 'js-cookie';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { calcularTarifaReserva, ResultadoTarifa } from '@/Funciones/calcularTarifaReserva';
import finesSemanaData from '@/Componentes/BaseFinesSemana/fds.json';
import './estilos.css';

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

interface Huespedes {
  adultos: number;
  ninos: number;
  bebes: number;
  mascotas: number;
}

interface FormularioReservaProps {
  initialData: any;
  onFechaFinActualizada?: (fechaFin: string) => void;
  onHuespedesActualizados?: (huespedes: Huespedes) => void;
}

const FormularioReserva: React.FC<FormularioReservaProps> = ({
  initialData,
  onFechaFinActualizada = () => {},
  onHuespedesActualizados = () => {},
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
    adultos: Math.max(1, Number(getParam('totalAdultosUrl', '1'))),
    ninos: Number(getParam('totalNinosUrl', '0')),
    bebes: Number(getParam('totalBebesUrl', '0')),
    mascotas: Number(getParam('totalMascotasUrl', '0')),
  });

  // Tarifa calculada
  const [tarifa, setTarifa] = useState<ResultadoTarifa | null>(null);

  // Control de modales
  const [modalFechas, setModalFechas] = useState(false);
  const [modalHuespedes, setModalHuespedes] = useState(false);
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
      const iStr = sat.toISOString().slice(0, 10);
      const fStr = sun.toISOString().slice(0, 10);
      setRange([{ startDate: sat, endDate: sun, key: 'selection' }]);
      setFechaInicio(iStr);
      setFechaFin(fStr);
    }
  }, []);

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

  // 3) Validación
  const validarCampos = () => {
    if (!fechaInicio || !fechaFin) return false;
    if (parseYMD(fechaFin) < parseYMD(fechaInicio)) return false;
    const tot = huespedes.adultos + huespedes.ninos;
    if (tot < 1 || tot > maxHuespedes) return false;
    if (huespedes.bebes > 3) return false;
    if (huespedes.adultos < 1) return false;
    if (!aceptaMascotas && huespedes.mascotas > 0) return false;
    if (huespedes.mascotas > 3) return false;
    return true;
  };

  // 4) Cambio de rango
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

  // 5) Ajuste de huéspedes
  const actualizarHuesped = (key: keyof Huespedes, delta: number) => {
    if (key === 'mascotas' && !aceptaMascotas) return;
    setHuespedes(prev => {
      let n = prev[key] + delta;
      n = key === 'adultos' ? Math.max(1, n) : Math.max(0, n);
      if ((key === 'adultos' || key === 'ninos') &&
          (prev.adultos + prev.ninos + delta > maxHuespedes)) return prev;
      return { ...prev, [key]: n };
    });
    onHuespedesActualizados(huespedes);
  };

  // 6) Recalcular tarifa
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
      fechaInicio: start.toISOString().slice(0, 10),
      fechaFin: end.toISOString().slice(0, 10),
      cantidadHuespedes: cant,
    });
    setTarifa(res);
  }, [fechaInicio, fechaFin, huespedes.adultos, huespedes.ninos]);

  // 7) Cierre de modales externo
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (overlayRef.current && e.target === overlayRef.current) {
        if (modalFechas && (!fechaFin || fechaFin === fechaInicio)) {
          const [sat, sun] = getNextWeekend(parseYMD(fechaInicio));
          const sstr = sat.toISOString().slice(0, 10);
          const fstr = sun.toISOString().slice(0, 10);
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
  }, [modalFechas, fechaInicio, fechaFin]);

  // 8) Reservar
  const reservar = () => {
    Cookies.set('CookiefechaInicial', fechaInicio);
    Cookies.set('CookiefechaFin', fechaFin);
    Cookies.set('CookieAdultos', String(huespedes.adultos));
    Cookies.set('CookieNinos', String(huespedes.ninos));
    Cookies.set('CookieBebes', String(huespedes.bebes));
    Cookies.set('CookieMascotas', String(huespedes.mascotas));
    router.push('/Reservar');
  };

  return (
    <div className="formularioReserva-container">
      {tarifa && (
      <div className="resumen-header">
        <span className="precio-noche">
          ${tarifa.precioPorDia.toLocaleString('es-CO')}
        </span>
        <span>COP / noche</span>
      </div>
      )}
      
      {/* Botones de selección */}
      <button
        className="formularioReserva-summary"
        onClick={() => setModalFechas(true)}
      >
        <div>
          <div className="labelResumen">LLEGADA</div>
          <div>{fechaInicio ? formatearFechaCorta(fechaInicio) : '--'}</div>
        </div>
        <div>
          <div className="labelResumen">SALIDA</div>
          <div>{fechaFin ? formatearFechaCorta(fechaFin) : '--'}</div>
        </div>
      </button>

      <button
        className="formularioReserva-summary"
        onClick={() => setModalHuespedes(true)}
      >
        <span>Huéspedes</span>
        <span>
          {huespedes.adultos + huespedes.ninos} huésped{huespedes.adultos + huespedes.ninos !== 1 ? 'es' : ''}
        </span>
      </button>

      {/* Modales */}
      {(modalFechas || modalHuespedes) && (
        <div className="formularioReserva-overlay" ref={overlayRef}>
          {modalFechas && (
            <div className="formularioReserva-modal">
              <DateRange
                locale={es}
                ranges={range}
                onChange={onRangeChange}
                moveRangeOnFirstSelection={false}
                disabledDates={reservedDates}
                minDate={new Date()}
                rangeColors={[ '#2f6b3e' ]}
                monthDisplayFormat="MMMM yyyy"
              />
              <button
                className="formularioReserva-submit"
                style={{ marginTop: 16, width: '100%' }}
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
            <div className="formularioReserva-modal formularioReserva-modal-huespedes">
              <button
                className="formularioReserva-submit" 
                style={{ alignSelf: 'flex-end', marginBottom: 16 }}
                onClick={() => setModalHuespedes(false)}
              >
                Cerrar
              </button>
              {(['adultos','ninos','bebes','mascotas'] as (keyof Huespedes)[]).map(k => (
                <div key={k} className="formularioReserva-huesped-row">
                  <span className="formularioReserva-huesped-label">
                    {k.charAt(0).toUpperCase() + k.slice(1)}
                    {k === 'mascotas' && !aceptaMascotas && (
                      <span className="labelNoMascotas">No se aceptan mascotas</span>
                    )}
                  </span>
                  <div className="formularioReserva-huesped-controls">
                    <button
                      onClick={() => actualizarHuesped(k, -1)}
                      disabled={
                        (k === 'adultos' && huespedes.adultos <= 1) ||
                        (k !== 'adultos' && huespedes[k] <= 0) ||
                        (k === 'mascotas' && !aceptaMascotas)
                      }
                    >-</button>
                    <span>{huespedes[k]}</span>
                    <button
                      onClick={() => actualizarHuesped(k, 1)}
                      disabled={
                        ((k === 'adultos' || k === 'ninos') &&
                          huespedes.adultos + huespedes.ninos >= maxHuespedes) ||
                        (k === 'bebes' && huespedes.bebes >= 3) ||
                        (k === 'mascotas' && (!aceptaMascotas || huespedes.mascotas >= 3))
                      }
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resumen y detalle */}
      {tarifa && (
        <div className="resumen-general">
          <button
            className="formularioReserva-submit reserva-principal"
            onClick={reservar}
            disabled={!validarCampos()}
          >
            Reservar
          </button>
          <div className="resumen-nota">No se hará ningún cargo por ahora</div>
          <div className="resumen-detalle">
            {/* Base sin incremento */}
            <div className="linea">
              <span>
                ${Math.round(
                  initialData.precioEstandar
                ).toLocaleString('es-CO')} x {tarifa.totalDiasFacturados} noche{tarifa.totalDiasFacturados !== 1 ? 's' : ''}
              </span>
              <span>
                ${tarifa.costoSinIncrementoBase.toLocaleString('es-CO')}
              </span>
            </div>
            {/* Huéspedes adicionales */}
            {tarifa.huespedesAdicionales > 0 && (
              <div className="linea">
                <span>
                  ${tarifa.costoAdicionalesSinIncremento.toLocaleString('es-CO')} x {tarifa.huespedesAdicionales} adicional{tarifa.huespedesAdicionales !== 1 ? 'es' : ''} x {tarifa.totalDiasFacturados} noche{tarifa.totalDiasFacturados !== 1 ? 's' : ''}
                </span>
                <span>
                  ${(
                    tarifa.costoAdicionalesSinIncremento
                  ).toLocaleString('es-CO')}
                </span>
              </div>
            )}
            {/* Tarifa por servicio */}
            <div className="linea">
              <span>Tarifa por servicio</span>
              <span>${tarifa.tarifaServicio.toLocaleString('es-CO')}</span>
            </div>
            {/* Descuento */}
            {tarifa.descuentoAplicado>0 && (
              <div className="linea descuento">
                <span>Descuento</span>
                <span>-${tarifa.descuentoAplicado.toLocaleString('es-CO')}</span>
              </div>
            )}
          </div>
          <hr />
          <div className="resumen-total">
            <strong>Total</strong>
            <span>${tarifa.costoTotalConIncremento.toLocaleString('es-CO')} COP</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default FormularioReserva;

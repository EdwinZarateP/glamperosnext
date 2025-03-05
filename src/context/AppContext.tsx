"use client";

import { createContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

// Define libraries como una constante global
const libraries: Libraries = ["places"];

type Libraries = string[];

interface Filtros {
  precioFilter?: number[];
  tipoFilter?: string;
  cordenadasFilter?: {
    LATITUD: number;
    LONGITUD: number;
  };
}

//-------------------------------------------------------------------------------------
// 1. Define la interfaz para el contexto
//-------------------------------------------------------------------------------------
interface ContextProps {
  
    //usuario logeado
  idUsuario: string | null;
  setIdUsuario: (id: string | null) => void;
  idUsuarioReceptor: string | null;
  setIdUsuarioReceptor: (id: string | null) => void;
  logueado: boolean;
  setLogueado: (estado: boolean) => void;
  nombreUsuario: string;
  setNombreUsuario: Dispatch<SetStateAction<string>>;
  nombreUsuarioChat: string;
  setNombreUsuarioChat: Dispatch<SetStateAction<string>>;
  fotoUsuarioChat: string;
  setFotoUsuarioChat: Dispatch<SetStateAction<string>>;
  correoUsuario: string;
  setCorreoUsuario: Dispatch<SetStateAction<string>>;

  //Variables boolean
  siono: boolean;
  setSiono: Dispatch<SetStateAction<boolean>>;
  verVideo: boolean;
  setVerVideo: Dispatch<SetStateAction<boolean>>;
  activarChat: boolean;
  setActivarChat: Dispatch<SetStateAction<boolean>>;
  activarCalificacion: boolean;
  setActivarCalificacion: Dispatch<SetStateAction<boolean>>;
  verPolitica: boolean;
  setVerPolitica: Dispatch<SetStateAction<boolean>>;
  redirigirExplorado: boolean;
  setRedirigirExplorado: Dispatch<SetStateAction<boolean>>;



  // Variables de tipo string
  nombreGlamping: string;
  setNombreGlamping: Dispatch<SetStateAction<string>>;
  descripcionGlamping: string;
  setDescripcionGlamping: Dispatch<SetStateAction<string>>;
  ciudad_departamento: string;
  setCiudad_departamento: Dispatch<SetStateAction<string>>;
  ciudad_Elegida: string;
  setCiudad_Elegida: Dispatch<SetStateAction<string>>;
  idUrlConversacion: string; 
  setIdUrlConversacion: Dispatch<SetStateAction<string>>; 
  whatsapp: string; 
  setWhatsapp: Dispatch<SetStateAction<string>>; 
  UrlActual: string; 
  setUrlActual: Dispatch<SetStateAction<string>>; 

  // Variables de tipo fecha
  fechaInicio: Date | null;
  setFechaInicio: Dispatch<SetStateAction<Date | null>>;
  fechaFin: Date | null;
  setFechaFin: Dispatch<SetStateAction<Date | null>>;
  fechaInicioConfirmado: Date | null;
  setFechaInicioConfirmado: Dispatch<SetStateAction<Date | null>>;
  fechaFinConfirmado: Date | null;
  setFechaFinConfirmado: Dispatch<SetStateAction<Date | null>>;
  huespedesConfirmado: number;
  setHuespedesConfirmado: Dispatch<SetStateAction<number>>;
  FechasSeparadas: Date[];
  setFechasSeparadas: React.Dispatch<React.SetStateAction<Date[]>>;

  // Variables de tipo número
  totalDias: number;
  setTotalDias: Dispatch<SetStateAction<number>>;
  precioPorNoche?: number;
  setPrecioPorNoche: Dispatch<SetStateAction<number | undefined>>;

  tarifaServicio?: number;
  setTarifaServicio: Dispatch<SetStateAction<number | undefined>>;
  totalSinImpuestos?: number;
  setTotalSinImpuestos: Dispatch<SetStateAction<number | undefined>>;

  // Variables de visitantes
  Cantidad_Adultos: number;
  setCantidad_Adultos: Dispatch<SetStateAction<number>>;
  Cantidad_Ninos: number;
  setCantidad_Ninos: Dispatch<SetStateAction<number>>;
  Cantidad_Bebes: number;
  setCantidad_Bebes: Dispatch<SetStateAction<number>>;
  Cantidad_Mascotas: number;
  setCantidad_Mascotas: Dispatch<SetStateAction<number>>;
  totalHuespedes: number;
  setTotalHuespedes: Dispatch<SetStateAction<number>>;
  
  //Paso 3 
  Cantidad_Huespedes: number;
  setCantidad_Huespedes: Dispatch<SetStateAction<number>>;
  Cantidad_Huespedes_Adicional: number;
  setCantidad_Huespedes_Adicional: Dispatch<SetStateAction<number>>;  
  Acepta_Mascotas: boolean;
  setAcepta_Mascotas: Dispatch<SetStateAction<boolean>>;

  // Estados para modales
  mostrarVisitantes: boolean;
  setMostrarVisitantes: Dispatch<SetStateAction<boolean>>;
  mostrarCalendario: boolean;
  setMostrarCalendario: Dispatch<SetStateAction<boolean>>;
  mostrarMenuUsuarios: boolean;
  setMostrarMenuUsuarios: Dispatch<SetStateAction<boolean>>;

  //Tipo de glamping
  tipoGlamping: string;
  setTipoGlamping: Dispatch<SetStateAction<string>>;

  //latitud y longitud
  latitud: number;
  setLatitud: Dispatch<SetStateAction<number>>;
  longitud: number;
  setLongitud: Dispatch<SetStateAction<number>>;
  ubicacion: string;
  setUbicacion: Dispatch<SetStateAction<string>>;
  direccion: string;
  setDireccion: Dispatch<SetStateAction<string>>;
  

  // Imagenes puntuales del glamping
  imagenesSeleccionadas: string[];
  setImagenesSeleccionadas: Dispatch<SetStateAction<string[]>>;

  imagenesCargadas: File[];
  setImagenesCargadas: Dispatch<SetStateAction<File[]>>;

  // Mapas
  libraries: Libraries;

  //amenidades elegidas por el dueño
  amenidadesGlobal: string[];
  setAmenidadesGlobal: Dispatch<SetStateAction<string[]>>;

  //Carga de fotos y video
  videoSeleccionado: string;
  setVideoSeleccionado: Dispatch<SetStateAction<string>>;
  fotosSeleccionadas: string[]; // Array de URLs o rutas de fotos seleccionadas
  setFotosSeleccionadas: Dispatch<SetStateAction<string[]>>; // Para actualizar las fotos
  
  //Precios
  precioEstandar: number;
  setPrecioEstandar: React.Dispatch<React.SetStateAction<number>>;
  precioEstandarAdicional: number;
  setPrecioEstandarAdicional: React.Dispatch<React.SetStateAction<number>>;
  descuento: number;
  setDescuento: React.Dispatch<React.SetStateAction<number>>;
  diasCancelacion: number;
  setDiasCancelacion: React.Dispatch<React.SetStateAction<number>>;
  copiasGlamping: number;
  setCopiasGlamping: React.Dispatch<React.SetStateAction<number>>;
  minimoNoches: number;
  setMinimoNoches: React.Dispatch<React.SetStateAction<number>>;
  
  // Busqueda del Header
  busqueda: { destino: string, fechas: string };
  setBusqueda: Dispatch<SetStateAction<{ destino: string, fechas: string }>>;

  // Filtros
  activarFiltros: boolean;
  setActivarFiltros: Dispatch<SetStateAction<boolean>>;
  activarFiltrosUbicacion: boolean;
  setActivarFiltrosUbicacion: Dispatch<SetStateAction<boolean>>;
  activarFiltrosFechas: boolean;
  activarFiltrosUbicacionBogota: boolean;
  setActivarFiltrosUbicacionBogota: Dispatch<SetStateAction<boolean>>;
  activarFiltrosUbicacionMedellin: boolean;
  setActivarFiltrosUbicacionMedellin: Dispatch<SetStateAction<boolean>>;
  activarFiltrosUbicacionCali:  boolean;
  setActivarFiltrosUbicacionCali: Dispatch<SetStateAction<boolean>>;
  setActivarFiltrosFechas: Dispatch<SetStateAction<boolean>>;
  activarFiltrosHuespedes: boolean;
  setActivarFiltrosHuespedes: Dispatch<SetStateAction<boolean>>;
  filtros: Filtros;
  setFiltros: Dispatch<SetStateAction<Filtros>>;
  cantiadfiltrosAplicados: number;
  setCantiadfiltrosAplicados: Dispatch<SetStateAction<number>>;
  mostrarFiltros: boolean;
  setMostrarFiltros: Dispatch<SetStateAction<boolean>>;
  precioFiltrado: number[];
  setPrecioFiltrado: Dispatch<SetStateAction<number[]>>;
  tipoGlampingFiltrado: string | undefined;
  setTipoGlampingFiltrado: Dispatch<SetStateAction<string | undefined>>;
  cordenadasElegidas: { LATITUD: number; LONGITUD: number }[];
  setCordenadasElegidas: Dispatch<SetStateAction<{ LATITUD: number; LONGITUD: number }[]>>;

  // Filtros del menuIcons
  iconoSeleccionado: number;
  setIconoSeleccionado: React.Dispatch<React.SetStateAction<number>>;
  activarFiltrosDomo: boolean;
  setActivarFiltrosDomo: Dispatch<SetStateAction<boolean>>;
  activarFiltrosTienda: boolean;
  setActivarFiltrosTienda: Dispatch<SetStateAction<boolean>>;  
  activarFiltrosCabaña: boolean;
  setActivarFiltrosCabaña: Dispatch<SetStateAction<boolean>>;  
  activarFiltrosCasaArbol: boolean;
  setActivarFiltrosCasaArbol: Dispatch<SetStateAction<boolean>>;
  activarFiltrosRemolques: boolean;
  setActivarFiltrosRemolques: Dispatch<SetStateAction<boolean>>;
  activarFiltrosChoza: boolean;
  setActivarFiltrosChoza: Dispatch<SetStateAction<boolean>>;
  activarFiltrosMascotas: boolean;
  setActivarFiltrosMascotas: Dispatch<SetStateAction<boolean>>;
  activarFiltrosClimaCalido: boolean;
  setActivarFiltrosClimaCalido: Dispatch<SetStateAction<boolean>>;
  activarFiltrosClimaFrio: boolean;
  setActivarFiltrosClimaFrio: Dispatch<SetStateAction<boolean>>;
  activarFiltrosPlaya: boolean;
  setActivarFiltrosPlaya: Dispatch<SetStateAction<boolean>>;
  activarFiltrosNaturaleza: boolean;
  setActivarFiltrosNaturaleza: Dispatch<SetStateAction<boolean>>;
  activarFiltrosRio: boolean;
  setActivarFiltrosRio: Dispatch<SetStateAction<boolean>>;
  activarFiltrosCascada: boolean;
  setActivarFiltrosCascada: Dispatch<SetStateAction<boolean>>;
  activarFiltrosMontana: boolean;
  setActivarFiltrosMontana: Dispatch<SetStateAction<boolean>>;
  activarFiltrosDesierto: boolean;
  setActivarFiltrosDesierto: Dispatch<SetStateAction<boolean>>;
  activarFiltrosCaminata: boolean;
  setActivarFiltrosCaminata: Dispatch<SetStateAction<boolean>>;
  activarFiltrosJacuzzi: boolean;
  setActivarFiltrosJacuzzi: Dispatch<SetStateAction<boolean>>;

}

// Crea el contexto
export const ContextoApp = createContext<ContextProps | undefined>(undefined);

//-------------------------------------------------------------------------------------
// 2. Proveedor de variables que utiliza el contexto
//-------------------------------------------------------------------------------------
export const ProveedorVariables = ({ children }: { children: ReactNode }) => {
    const [idUsuario, setIdUsuario] = useState<string | null>(null);
    const [idUsuarioReceptor, setIdUsuarioReceptor] = useState<string | null>(null);
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [nombreUsuarioChat, setNombreUsuarioChat] = useState('');
    const [fotoUsuarioChat, setFotoUsuarioChat] = useState('');  
    const [correoUsuario, setCorreoUsuario] = useState('');
    const [logueado, setLogueado] = useState<boolean>(false);
    const [nombreGlamping, setNombreGlamping] = useState('');
    const [descripcionGlamping, setDescripcionGlamping] = useState('');
    const [ciudad_departamento, setCiudad_departamento] = useState('');
    const [ciudad_Elegida, setCiudad_Elegida] = useState('');
    const [idUrlConversacion, setIdUrlConversacion] = useState<string>(''); 
    const [whatsapp, setWhatsapp] = useState<string>(''); 
    const [UrlActual, setUrlActual] = useState<string>('');   
    const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
    const [fechaFin, setFechaFin] = useState<Date | null>(null);
    const [fechaInicioConfirmado, setFechaInicioConfirmado] = useState<Date | null>(null);
    const [fechaFinConfirmado, setFechaFinConfirmado] = useState<Date | null>(null);
    const [huespedesConfirmado, setHuespedesConfirmado] = useState<number>(1);
    const [FechasSeparadas, setFechasSeparadas] = useState<Date[]>([]); 
    const [totalDias, setTotalDias] = useState<number>(1);
    const [precioPorNoche, setPrecioPorNoche] = useState<number | undefined>(undefined);
    const [tarifaServicio, setTarifaServicio] = useState<number | undefined>(undefined);
    const [totalSinImpuestos, setTotalSinImpuestos] = useState<number | undefined>(undefined);
    const [Cantidad_Adultos, setCantidad_Adultos] = useState<number>(1);
    const [Cantidad_Ninos, setCantidad_Ninos] = useState<number>(0);
    const [Cantidad_Bebes, setCantidad_Bebes] = useState<number>(0);
    const [Cantidad_Mascotas, setCantidad_Mascotas] = useState<number>(0);
    const [totalHuespedes, setTotalHuespedes] = useState<number>(1);
    const [Cantidad_Huespedes, setCantidad_Huespedes] = useState<number>(1);
    const [Cantidad_Huespedes_Adicional, setCantidad_Huespedes_Adicional] = useState<number>(0);  
    const [Acepta_Mascotas, setAcepta_Mascotas] = useState<boolean>(false); 
    const [siono, setSiono] = useState<boolean>(false);   
    const [verVideo, setVerVideo] = useState<boolean>(false); 
    const [activarChat, setActivarChat] = useState<boolean>(false);
    const [activarCalificacion, setActivarCalificacion] = useState<boolean>(false);  
    const [verPolitica, setVerPolitica] = useState<boolean>(false);
    const [redirigirExplorado, setRedirigirExplorado] = useState<boolean>(false);  
    const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState<string[]>([]);
    const [imagenesCargadas, setImagenesCargadas] = useState<File[]>([]);
    const [videoSeleccionado, setVideoSeleccionado] = useState<string>('');
  
    // Estados para modales
    const [mostrarVisitantes, setMostrarVisitantes] = useState<boolean>(false);
    const [mostrarCalendario, setMostrarCalendario] = useState<boolean>(false);
    const [mostrarMenuUsuarios, setMostrarMenuUsuarios] = useState<boolean>(false);
  
  
    //Tipo de glamping
    const [tipoGlamping, setTipoGlamping] = useState<string>('');
  
    //latitud y longitud
    const [latitud, setLatitud] = useState<number>(4.123456); // Estado predeterminado de latitud
    const [longitud, setLongitud] = useState<number>(-74.123456); // Estado predeterminado de longitud
    const [ubicacion, setUbicacion] = useState<string>('');
    const [direccion, setDireccion] = useState<string>('')
  
    //amenidades elegidas por el dueño
    const [amenidadesGlobal, setAmenidadesGlobal] = useState<string[]>([]);
  
    // Estado para el fotos
    const [fotosSeleccionadas, setFotosSeleccionadas] = useState<string[]>([]);
  
    //precios
    const [precioEstandar, setPrecioEstandar] = useState<number>(0);
    const [precioEstandarAdicional, setPrecioEstandarAdicional] = useState<number>(0);
    const [descuento, setDescuento] = useState<number>(0);
  
    //Dias de anticipacion para aceptar reservas
    const [diasCancelacion, setDiasCancelacion] = useState<number>(1);
    const [copiasGlamping,setCopiasGlamping] = useState<number>(1);
    const [minimoNoches,setMinimoNoches] = useState<number>(1);
    
    
    // Estado para filtros
    const [activarFiltros, setActivarFiltros] = useState<boolean>(false);
    const [activarFiltrosUbicacion, setActivarFiltrosUbicacion] = useState<boolean>(true);
    const [activarFiltrosUbicacionBogota, setActivarFiltrosUbicacionBogota] = useState<boolean>(false);
    const [activarFiltrosUbicacionMedellin,setActivarFiltrosUbicacionMedellin] = useState<boolean>(false);
    const [activarFiltrosUbicacionCali,setActivarFiltrosUbicacionCali] = useState<boolean>(false);
  
    const [activarFiltrosFechas, setActivarFiltrosFechas] = useState<boolean>(false);
    const [activarFiltrosHuespedes, setActivarFiltrosHuespedes] = useState<boolean>(false);
    
    // Estado para filtros con valores por defecto
    const [filtros, setFiltros] = useState<Filtros>({
      precioFilter: [50000, 2200000], // Rango de precios por defecto
      tipoFilter: '',
      cordenadasFilter: { LATITUD: 4.123456, LONGITUD: -74.123456 }, // Aquí como un objeto, no un array
    });  
    
    // Busqueda del Header
    const [busqueda, setBusqueda] = useState({ destino: "", fechas: "" });
  
    //filtros
    const [mostrarFiltros, setMostrarFiltros] = useState<boolean>(false);
    const [cantiadfiltrosAplicados, setCantiadfiltrosAplicados] = useState<number>(0);
    const [precioFiltrado, setPrecioFiltrado] = useState<number[]>([60000,2200000]);
    const [tipoGlampingFiltrado, setTipoGlampingFiltrado] = useState<string | undefined>(undefined);
    const [cordenadasElegidas, setCordenadasElegidas] = useState<{ LATITUD: number; LONGITUD: number }[]>([]);
  
    // Estado para filtros MenuIcons
    const [iconoSeleccionado, setIconoSeleccionado] = useState<number>(100);
    const [activarFiltrosDomo, setActivarFiltrosDomo] = useState<boolean>(false);
    const [activarFiltrosTienda, setActivarFiltrosTienda] = useState<boolean>(false);
    const [activarFiltrosCabaña, setActivarFiltrosCabaña] = useState<boolean>(false);
    const [activarFiltrosCasaArbol, setActivarFiltrosCasaArbol] = useState<boolean>(false);
    const [activarFiltrosRemolques, setActivarFiltrosRemolques] = useState<boolean>(false);
    const [activarFiltrosChoza, setActivarFiltrosChoza] = useState<boolean>(false);
    const [activarFiltrosMascotas, setActivarFiltrosMascotas] = useState<boolean>(false);
    const [activarFiltrosClimaCalido, setActivarFiltrosClimaCalido] = useState<boolean>(false);  
    const [activarFiltrosClimaFrio, setActivarFiltrosClimaFrio] = useState<boolean>(false);  
    const [activarFiltrosPlaya, setActivarFiltrosPlaya] = useState<boolean>(false);  
    const [activarFiltrosNaturaleza, setActivarFiltrosNaturaleza] = useState<boolean>(false);  
    const [activarFiltrosRio, setActivarFiltrosRio] = useState<boolean>(false);  
    const [activarFiltrosCascada, setActivarFiltrosCascada] = useState<boolean>(false);  
    const [activarFiltrosMontana, setActivarFiltrosMontana] = useState<boolean>(false);  
    const [activarFiltrosCaminata, setActivarFiltrosCaminata] = useState<boolean>(false);  
    const [activarFiltrosDesierto, setActivarFiltrosDesierto] = useState<boolean>(false);
    const [activarFiltrosJacuzzi, setActivarFiltrosJacuzzi] = useState<boolean>(false);  
  

 
  return (
    <ContextoApp.Provider
      value={{
        idUsuario, setIdUsuario,
        idUsuarioReceptor, setIdUsuarioReceptor,
        logueado, setLogueado,
        nombreUsuario, setNombreUsuario,
        nombreUsuarioChat, setNombreUsuarioChat,
        fotoUsuarioChat, setFotoUsuarioChat,
        correoUsuario, setCorreoUsuario,
        siono, setSiono, 
        verVideo, setVerVideo,
        activarChat, setActivarChat, 
        activarCalificacion, setActivarCalificacion,  
        verPolitica, setVerPolitica,
        redirigirExplorado, setRedirigirExplorado,
        nombreGlamping, setNombreGlamping,
        descripcionGlamping, setDescripcionGlamping,
        ciudad_departamento, setCiudad_departamento,
        ciudad_Elegida, setCiudad_Elegida,
        idUrlConversacion, setIdUrlConversacion,
        whatsapp, setWhatsapp, 
        UrlActual, setUrlActual,
        fechaInicio,setFechaInicio,
        fechaFin, setFechaFin,
        fechaInicioConfirmado, setFechaInicioConfirmado,
        fechaFinConfirmado, setFechaFinConfirmado,
        huespedesConfirmado, setHuespedesConfirmado,
        FechasSeparadas, setFechasSeparadas,
        totalDias,setTotalDias,
        precioPorNoche, setPrecioPorNoche,
        tarifaServicio,setTarifaServicio,
        totalSinImpuestos,setTotalSinImpuestos,
        Cantidad_Adultos,setCantidad_Adultos,
        Cantidad_Ninos,setCantidad_Ninos,
        Cantidad_Bebes,setCantidad_Bebes,
        Cantidad_Mascotas,setCantidad_Mascotas,
        totalHuespedes, setTotalHuespedes,
        Cantidad_Huespedes,setCantidad_Huespedes,
        Cantidad_Huespedes_Adicional,setCantidad_Huespedes_Adicional,
        Acepta_Mascotas, setAcepta_Mascotas,
        mostrarVisitantes, setMostrarVisitantes,
        mostrarCalendario,setMostrarCalendario,
        mostrarMenuUsuarios, setMostrarMenuUsuarios,
        tipoGlamping,setTipoGlamping,
        latitud,setLatitud,
        longitud, setLongitud,
        ubicacion, setUbicacion,
        direccion, setDireccion,
        imagenesSeleccionadas, setImagenesSeleccionadas,
        imagenesCargadas, setImagenesCargadas,
        libraries,
        amenidadesGlobal, setAmenidadesGlobal,
        videoSeleccionado, setVideoSeleccionado,
        fotosSeleccionadas, setFotosSeleccionadas,
        precioEstandar, setPrecioEstandar,
        precioEstandarAdicional, setPrecioEstandarAdicional,
        descuento, setDescuento,
        diasCancelacion, setDiasCancelacion,
        copiasGlamping,setCopiasGlamping,
        minimoNoches,setMinimoNoches,
        activarFiltros, setActivarFiltros,
        activarFiltrosUbicacion, setActivarFiltrosUbicacion,
        activarFiltrosUbicacionBogota, setActivarFiltrosUbicacionBogota,
        activarFiltrosUbicacionMedellin, setActivarFiltrosUbicacionMedellin,
        activarFiltrosUbicacionCali, setActivarFiltrosUbicacionCali,
        activarFiltrosFechas, setActivarFiltrosFechas,
        activarFiltrosHuespedes, setActivarFiltrosHuespedes,
        busqueda, setBusqueda,
        filtros, setFiltros,
        mostrarFiltros, setMostrarFiltros,
        cantiadfiltrosAplicados, setCantiadfiltrosAplicados,
        precioFiltrado, setPrecioFiltrado,
        tipoGlampingFiltrado,setTipoGlampingFiltrado,
        cordenadasElegidas, setCordenadasElegidas,
        // filtros menuIcons
        activarFiltrosDomo, setActivarFiltrosDomo,
        iconoSeleccionado, setIconoSeleccionado,
        activarFiltrosTienda, setActivarFiltrosTienda,
        activarFiltrosCabaña, setActivarFiltrosCabaña,
        activarFiltrosCasaArbol, setActivarFiltrosCasaArbol,
        activarFiltrosRemolques, setActivarFiltrosRemolques,
        activarFiltrosChoza, setActivarFiltrosChoza,
        activarFiltrosMascotas, setActivarFiltrosMascotas,
        activarFiltrosClimaCalido, setActivarFiltrosClimaCalido,
        activarFiltrosClimaFrio, setActivarFiltrosClimaFrio,
        activarFiltrosPlaya, setActivarFiltrosPlaya,
        activarFiltrosNaturaleza, setActivarFiltrosNaturaleza,
        activarFiltrosRio, setActivarFiltrosRio,
        activarFiltrosCascada, setActivarFiltrosCascada,
        activarFiltrosMontana, setActivarFiltrosMontana,
        activarFiltrosCaminata, setActivarFiltrosDesierto,
        activarFiltrosDesierto, setActivarFiltrosCaminata,
        activarFiltrosJacuzzi, setActivarFiltrosJacuzzi
      }}
    >
      {children}
    </ContextoApp.Provider>
  );
};

"use client";

import  { useState, useEffect, useCallback} from 'react';
import './estilos.css';
import axios from 'axios';
import { useSearchParams} from "next/navigation";
import { opcionesAmenidades } from "../../Componentes/Amenidades/index"; 
import Swal from 'sweetalert2';

const ModificarGlamping: React.FC = () => {
  const searchParams = useSearchParams();
  const glampingId = searchParams.get("glampingId");
  const [nombreGlamping, setNombreGlamping] = useState('');
  const [tipoGlamping, setTipoGlamping] = useState('');
  const [Cantidad_Huespedes, setCantidad_Huespedes] = useState<number>(0);
  const [Cantidad_Huespedes_Adicional, setCantidad_Huespedes_Adicional] = useState<number>(0);
  const [Acepta_Mascotas, setAcepta_Mascotas] = useState<boolean>(false);
  const [precioEstandar, setPrecioEstandar] = useState<number>(0);
  const [precioEstandarAdicional, setPrecioEstandarAdicional] = useState<number>(0);
  const [minimoNoches, setMinimoNoches] = useState<number>(1);  
  const [diasCancelacion, setDiasCancelacion] = useState<number>(1);    
  const [descuento, setDescuento] = useState<number>(0);
  const [descripcionGlamping, setDescripcionGlamping] = useState('');
  const [video_youtube, setVideo_youtube] = useState('');
  const [urlIcal, setUrlIcal] = useState('');
  const [urlIcalBooking, setUrlIcalBooking] = useState('');
  const [amenidadesGlobal, setAmenidadesGlobal] = useState<string[]>([]);

  useEffect(() => {
    if (glampingId && glampingId.trim() !== "") {
      axios
      .get(`https://glamperosapi.onrender.com/glampings/${glampingId}`)
      .then((response) => {
        const data = response.data || {};
        setNombreGlamping(data.nombreGlamping || '');
        setTipoGlamping(data.tipoGlamping || '');
        setCantidad_Huespedes(data.Cantidad_Huespedes ?? 0);
        setCantidad_Huespedes_Adicional(data.Cantidad_Huespedes_Adicional ?? 0);
        setAcepta_Mascotas(data.Acepta_Mascotas || false);
        setPrecioEstandar(data.precioEstandar ?? 0);
        setPrecioEstandarAdicional(data.precioEstandarAdicional ?? 0);
        setMinimoNoches(data.minimoNoches ?? 1);
        setDiasCancelacion(data.diasCancelacion ?? 0);
        setDescuento(data.descuento ?? 0);
        setDescripcionGlamping(data.descripcionGlamping || '');
        setVideo_youtube(data.video_youtube || '');
        setUrlIcal(data.urlIcal || '');
        setUrlIcalBooking(data.urlIcalBooking || '');        
        setAmenidadesGlobal(data.amenidadesGlobal || []);
      })
    .catch((error) => {
    console.error('Error al obtener los datos del glamping:', error);
  });
    }
  }, [glampingId]);

  // Resetear precio adicional cuando no hay huéspedes adicionales
  useEffect(() => {
    if (Cantidad_Huespedes_Adicional <= 0) {
      setPrecioEstandarAdicional(0);
    }
  }, [Cantidad_Huespedes_Adicional]);

const toggleAmenidad = useCallback((amenidad: string) => {
  setAmenidadesGlobal((prevState) => {
    const yaExiste = prevState.includes(amenidad);
    const nuevoEstado = yaExiste
      ? prevState.filter((item) => item !== amenidad)
      : [...prevState, amenidad];

    // console.log("🟡 Amenidad clickeada:", amenidad);
    // console.log("🔹 Antes del clic:", prevState);
    // console.log("🔸 Después del clic:", nuevoEstado);

    return nuevoEstado;
  });
}, []);


  const actualizarGlamping = async () => {
    // Validaciones
    if (nombreGlamping.length > 40) {
      alert('El nombre del Glamping no puede exceder los 40 caracteres');
      return;
    }

    if (Cantidad_Huespedes < 1) {
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'En Cantidad Huespedes estandar por noche mínimo debe ser 1',
      });
      return;
    }

    if (Cantidad_Huespedes_Adicional > 0 && precioEstandarAdicional < 40000) {
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'El Precio por noche huésped adicional no debe ser menor a $40.000',
      });
      return;
    }

    if (precioEstandar > 2000000) {
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'El precio estándar no puede ser superior a 2,000,000',
      });
      return;
    }

    if (precioEstandar < 60000) {
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'El precio estándar no puede ser menor a $60.000',
      });
      return;
    }

    if (precioEstandar < precioEstandarAdicional) {
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'El precio estándar por noche no puede ser menor al precio de un huesped adicional',
      });
      return;
    }

    if (diasCancelacion < 0) {
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'No puedes colocar valores negativos en Días para admitir cancelaciones',
      });
      return;
    }

    if (diasCancelacion > 30) {
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'No puedes colocar valores superiores a 30 en Días para admitir cancelaciones',
      });
      return;
    }

    if (descuento > 70) {
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'El descuento no puede ser superior a 70%',
      });
      return;
    }

    const formData = new FormData();
    formData.append("nombreGlamping", nombreGlamping);
    formData.append("tipoGlamping", tipoGlamping);
    formData.append("Cantidad_Huespedes", Cantidad_Huespedes.toString());
    formData.append("Cantidad_Huespedes_Adicional", Cantidad_Huespedes_Adicional.toString());
    formData.append("Acepta_Mascotas", Acepta_Mascotas ? "true" : "false");    
    formData.append("precioEstandar", precioEstandar.toString());
    formData.append("precioEstandarAdicional", precioEstandarAdicional.toString());
    formData.append("minimoNoches", minimoNoches.toString());    
    formData.append("diasCancelacion", diasCancelacion.toString());    
    formData.append("descuento", descuento.toString());
    formData.append("descripcionGlamping", descripcionGlamping);
    formData.append("urlIcal", urlIcal|| 'Sin url');
    formData.append("urlIcalBooking", urlIcalBooking|| 'Sin url');
    formData.append("video_youtube", video_youtube || 'sin video');
    formData.append("amenidadesGlobal", amenidadesGlobal.join(","));

    try {
      if (!glampingId) {
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'No se encontró el ID del Glamping.',
        });
        return;
      }      
      const response = await fetch(`https://glamperosapi.onrender.com/glampings/Datos/${glampingId}`, {
      
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el glamping');
      }

    Swal.fire({
          title: "Información actualizada",
          text: "Información actualizada con los datos suministrados.",
          icon: "success",
          confirmButtonText: "Aceptar",
        }).then(() => {
          window.scrollTo({ top: 0, behavior: "auto" });
          window.location.reload();
    }); 

    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="ModificarGlamping-contenedor">
      <div className="ModificarGlamping-formulario">
        <div className="ModificarGlamping-formulario-contenedor1">
          <label className="ModificarGlamping-label" htmlFor="nombreGlamping">
            Nombre del Glamping:
          </label>
          <input
            id="nombreGlamping"
            className="ModificarGlamping-input"
            type="text"
            value={nombreGlamping}
            onChange={(e) => setNombreGlamping(e.target.value.slice(0, 40))}
          />
          
          <label className="ModificarGlamping-label" htmlFor="precioEstandar">
            Precio noche estandar:
          </label>
          <input
            id="precioEstandar"
            className="ModificarGlamping-input"
            type="number"
            value={precioEstandar}
            onChange={(e) => setPrecioEstandar(Number(e.target.value))}
          />
      
          <label className="ModificarGlamping-label" htmlFor="descuento">
            Descuento entre semana:
          </label>
          <input
            id="descuento"
            className="ModificarGlamping-input"
            type="number"
            value={descuento}
            min="0"
            max="100"
            onChange={(e) => {
              let valor = Number(e.target.value);              
              if (valor < 0) valor = 0; 
              if (valor > 100) valor = 100; 
              setDescuento(valor);
            }}
          />   
         
          <label className="ModificarGlamping-label" htmlFor="Cantidad_Huespedes">
            Cantidad Huespedes estandar por noche:
          </label>
          <input
            id="Cantidad_Huespedes" className="ModificarGlamping-input"
            type="number" value={Cantidad_Huespedes} min="1" max="15"
            onChange={(e) => {
              let valor = Number(e.target.value);              
              if (valor < 1) valor = 1;
              if (valor > 15) valor = 15;
              setCantidad_Huespedes(valor);
            }}
          />    

          <label className="ModificarGlamping-label" htmlFor="Cantidad_Huespedes_Adicional">
            Huespedes adicionales por noche:
          </label>
          <input
            id="Cantidad_Huespedes_Adicional"
            className="ModificarGlamping-input"
            type="number"
            value={Cantidad_Huespedes_Adicional}
            min="0"
            max="15"
            onChange={(e) => {
              let valor = Number(e.target.value);
              if (valor < 0) valor = 0;
              if (valor > 15) valor = 15;
              setCantidad_Huespedes_Adicional(valor);
            }}
          />   

          <label className="ModificarGlamping-label" htmlFor="precioEstandarAdicional">
            Precio por noche huésped adicional:
          </label>
          <input
            id="precioEstandarAdicional"
            className={`ModificarGlamping-input ${Cantidad_Huespedes_Adicional <= 0 ? 'disabled-input' : ''}`}
            type="number"
            value={precioEstandarAdicional}
            onChange={(e) => setPrecioEstandarAdicional(Number(e.target.value))}
            disabled={Cantidad_Huespedes_Adicional <= 0}
          />

          <label className="ModificarGlamping-label" htmlFor="minimoNoches">
            Minimo de noches que permites reservar:
          </label>
          <input
            id="minimoNoches" className="ModificarGlamping-input"
            type="number" value={minimoNoches} min="1" max="3"
            onChange={(e) => {
              let valor = Number(e.target.value);              
              if (valor < 1) valor = 1;
              if (valor > 3) valor = 3;
              setMinimoNoches(valor);
            }}
          />              

          <label className="ModificarGlamping-label" htmlFor="diasCancelacion">
            Días para admitir cancelaciones:
          </label>
          <input
            id="diasCancelacion"
            className="ModificarGlamping-input"
            type="number"
            value={diasCancelacion}
            min="0"
            max="30"
            onChange={(e) => {
              let valor = Number(e.target.value);
              if (valor < 0) valor = 0;
              if (valor > 30) valor = 30;
              setDiasCancelacion(valor);
            }}
          />

          <label className="ModificarGlamping-label" htmlFor="tipoGlamping">
            Tipo de Glamping:
          </label>
          <select
            id="tipoGlamping"
            className="ModificarGlamping-input"
            value={tipoGlamping}
            onChange={(e) => setTipoGlamping(e.target.value)}
          >
            <option value="tienda">tienda</option>
            <option value="cabana">cabana</option>
            <option value="domo">domo</option>
            <option value="casa del arbol">Casa del árbol</option>
            <option value="remolque">remolque</option>
            <option value="tipi">tipi</option>
            <option value="Lumipod">Lumipod</option>

          </select>

          <label className="ModificarGlamping-label" htmlFor="Acepta_Mascotas">
            ¿Acepta Mascotas?:
          </label>
          <select
            id="Acepta_Mascotas"
            className="ModificarGlamping-input"
            value={Acepta_Mascotas ? 'true' : 'false'}
            onChange={(e) => setAcepta_Mascotas(e.target.value === 'true')}
          >
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>

          <label className="ModificarGlamping-label" htmlFor="video_youtube">
            Video de Youtube:
          </label>
          <input
            id="video_youtube"
            className="ModificarGlamping-input"
            type="text"
            value={video_youtube}
            onChange={(e) => setVideo_youtube(e.target.value)}
          />

          </div>
          
          <label className="ModificarGlamping-label" htmlFor="descripcionGlamping">
            Descripción del Glamping:
          </label>
          <textarea
            id="descripcionGlamping"
            className="ModificarGlamping-input-desc"
            value={descripcionGlamping}
            onChange={(e) => setDescripcionGlamping(e.target.value)}
          />  

          <label className="ModificarGlamping-label" htmlFor="amenidadesGlobal">
            Amenidades:
          </label>
          <div className="amenidades-container">
            {opcionesAmenidades.map(({ id, label }) => {
              const normalizar = (str: string) => str.trim().toLowerCase();
              const isSelected = amenidadesGlobal.map(normalizar).includes(normalizar(id));                        
              return (
                <button
                  type="button"
                  key={`${id}-${isSelected}`}
                  className={`amenidad-button ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleAmenidad(id)}
                >
                  {label}
                </button>
              );
            })}



          </div>
        </div>

      <button className="ModificarGlamping-boton" onClick={actualizarGlamping}>
        Actualizar
      </button>
    </div>
  );
};

export default ModificarGlamping;
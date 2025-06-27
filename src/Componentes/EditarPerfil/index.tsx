"use client";
import { useEffect, useState, useContext, useCallback } from 'react';
import Cookies from "js-cookie";
import { ContextoApp } from "../../context/AppContext";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Cropper from 'react-easy-crop';
import Lottie from 'lottie-react';
import animationData from "../../Componentes/Animaciones/AnimationPuntos.json";
import getCroppedImg from './getCroppedImg'
import codigosPaises from '../../Componentes/IndicativosPaises/index';
import './estilos.css';


const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

interface Usuario {
  email: string;
  telefono: string;
  foto: string | null;
  nombre: string;
}

const EditarPerfil: React.FC = () => {
  const router = useRouter();
  const { redirigirExplorado, setRedirigirExplorado, UrlActual } = useContext(ContextoApp)!;

  const [usuario, setUsuario] = useState<Usuario|null>(null);
  const [telefono, setTelefono] = useState('');
  const [indicativo, setIndicativo] = useState('+57');

  // estados de recorte
  const [fotoSrc, setFotoSrc] = useState<string|null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedBlob, setCroppedBlob] = useState<Blob|null>(null);

  const [cargando, setCargando] = useState(false);
  const [emailUsuario, setEmailUsuario] = useState<string|null>(null);

  // 1) cargar emailUsuario desde cookie
  useEffect(() => {
    const correo = Cookies.get("correoUsuario");
    if (correo) setEmailUsuario(correo);
  }, []);

  // 2) obtener datos del usuario
  useEffect(() => {
    if (!emailUsuario) return;
    axios.get(`${API_BASE}/usuarios?email=${emailUsuario}`)
      .then(r => {
        setUsuario(r.data);
        // separar indicativo y número
        const full = r.data.telefono || '';
        const num = full.slice(-10);
        const code = full.slice(0, full.length - 10);
        setTelefono(num);
        setIndicativo('+' + code);
      })
      .catch(console.error);
  }, [emailUsuario]);

  // selección de archivo
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setFotoSrc(url);
      setShowCropper(true);
    }
  };

  // recorte completo
  const onCropComplete = useCallback((_:any, pixels:any) => {
    setCroppedAreaPixels(pixels);
  }, []);

  // aplicar recorte
  const aplicarRecorte = useCallback(async () => {
    if (!fotoSrc || !croppedAreaPixels) return;
    try {
      const blob = await getCroppedImg(fotoSrc, croppedAreaPixels);
      setCroppedBlob(blob);
    } catch (e) {
      console.error(e);
    } finally {
      setShowCropper(false);
      URL.revokeObjectURL(fotoSrc);
    }
  }, [fotoSrc, croppedAreaPixels]);

  // Terminar edición: guarda foto y teléfono
  const handleTerminar = async () => {
    if (!usuario) return;
    setCargando(true);
    try {
      // 1) subir foto recortada (si hay)
      if (croppedBlob) {
        const fd = new FormData();
        fd.append('foto', croppedBlob, 'profile.webp');
        await axios.put(
          `${API_BASE}/usuarios/${usuario.email}/foto`,
          fd,
          { headers:{ 'Content-Type':'multipart/form-data' } }
        );
      }
      // 2) actualizar teléfono
      const fullTel = `${indicativo.replace('+','')}${telefono}`;
      if (fullTel !== usuario.telefono) {
        await axios.put(
          `${API_BASE}/usuarios/${usuario.email}/telefono`,
          { telefono: fullTel }
        );
        Cookies.set('telefonoUsuario', fullTel, { expires:7 });
      }
      // 3) refrescar datos
      const resp = await axios.get(`${API_BASE}/usuarios?email=${usuario.email}`);
      setUsuario(resp.data);
      // 4) navegar
      if (redirigirExplorado) {
        setRedirigirExplorado(false);
        router.push(UrlActual);
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  if (!usuario) {
    return (
      <div className="editar-perfil-cargando">
        <Lottie
          animationData={animationData}
          loop autoplay
          style={{ height:200, width:200, margin:'auto' }}
        />
      </div>
    );
  }

  return (
    <div className="editar-perfil-container">
      <h2>Editar Perfil</h2>

      {/* Modal de recorte */}
      {showCropper && fotoSrc && (
        <div className="cropper-modal">
          <Cropper
            image={fotoSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          <div className="cropper-controls">
            <button onClick={()=>setShowCropper(false)}>Cancelar</button>
            <button onClick={aplicarRecorte}>Aplicar recorte</button>
          </div>
        </div>
      )}

      {/* Foto de perfil */}
      <div className="editar-perfil-imagen">
        <div className="editar-perfil-imagen-contenedor">
          {croppedBlob
            ? <img
                src={URL.createObjectURL(croppedBlob)}
                className="editar-perfil-imagen-foto"
              />
            : usuario.foto
              ? <img
                  src={usuario.foto}
                  className="editar-perfil-imagen-foto"
                />
              : <div className="editar-perfil-inicial">
                  { usuario.nombre.charAt(0).toUpperCase() }
               </div>
          }
          <button
            onClick={()=>document.getElementById('fotoInput')?.click()}
            className="editar-perfil-boton-editar"
          >
            ✏️
          </button>
          <input
            type="file"
            id="fotoInput"
            accept="image/*"
            onChange={onSelectFile}
            style={{ display:'none' }}
          />
        </div>
      </div>

      {/* Datos */}
      <div className="editar-perfil-info">
        <p><strong>Nombre:</strong> {usuario.nombre}</p>
        <p><strong>Email:</strong> {usuario.email}</p>
        <div className="editar-perfil-telefono-contenedor">
          <select
            value={indicativo}
            onChange={e=>setIndicativo(e.target.value)}
            className="editar-perfil-select"
          >
            {codigosPaises.map(p=>(
              <option key={p.codigo} value={p.indicativo}>
                {p.nombre} ({p.indicativo})
              </option>
            ))}
          </select>
          <input
            type="tel"
            value={telefono}
            placeholder="WhatsApp"
            maxLength={10}
            onChange={e=>/^\d*$/.test(e.target.value)&&setTelefono(e.target.value)}
            className="editar-perfil-input"
          />
        </div>
      </div>

      {/* Botón único */}
      <button
        className="editar-perfil-boton-regresar"
        onClick={handleTerminar}
        disabled={cargando}
      >
        {cargando ? 'Guardando...' : 'Terminar edición'}
      </button>
    </div>
  );
};

export default EditarPerfil;

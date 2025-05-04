"use client";
import { useEffect, useState, useContext } from 'react';
import Cookies from 'js-cookie';
import { ContextoApp } from "../../../context/AppContext";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import dynamic from "next/dynamic";
import animationData from "../../Componentes/Animaciones/AnimationPuntos.json";
import codigosPaises from '@/Componentes/IndicativosPaises/index'; // Usando alias @
import './estilos.css';

interface MyLottieProps {
  animationData: unknown;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
}

// Transformamos la importación de `lottie-react` a un componente que acepte MyLottieProps
const Lottie = dynamic<MyLottieProps>(
  () =>
    import("lottie-react").then((mod) => {
      // forzamos el default a un componente tipado
      return mod.default as React.ComponentType<MyLottieProps>;
    }),
  {
    ssr: false,
  }
);

interface Usuario {
  email: string;
  telefono: string;
  foto: string | null;
  nombre: string;
}

const EditarPerfil: React.FC = () => {
  const router = useRouter(); // Cambio de useNavigate a useRouter

  const { redirigirExplorado, setRedirigirExplorado, UrlActual } = useContext(ContextoApp)!;

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [fotoActualizada, setFotoActualizada] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [telefono, setTelefono] = useState<string>('');
  const [editandoTelefono, setEditandoTelefono] = useState<boolean>(false);
  const [cargandoFoto, setCargandoFoto] = useState(false);
  const [cargandoTelefono, setCargandoTelefono] = useState(false);
  const [indicativo, setIndicativo] = useState<string>('+57');

  const emailUsuario = Cookies.get('correoUsuario');

  useEffect(() => {
    if (emailUsuario) {
      axios
        .get(`https://glamperosapi.onrender.com/usuarios/?email=${emailUsuario}`)
        .then((response) => {
          setUsuario(response.data);
          setTelefono(response.data.telefono);
        })
        .catch((error) => {
          console.error('Error al obtener los datos del usuario:', error);
        });
    }
  }, [emailUsuario]);

  const manejarFoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const archivo = event.target.files[0];
      setFotoActualizada(archivo);
      setFotoPreview(URL.createObjectURL(archivo));
    }
  };

  const manejarTelefono = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valor = event.target.value;
    // Permitir solo números
    if (/^\d*$/.test(valor)) {
      setTelefono(valor);
    }
  };

  const actualizarTelefono = async () => {
    const telefonoCompleto = `${indicativo.replace('+', '')}${telefono}`;

    if (usuario) {
      if (telefonoCompleto === usuario.telefono) {
        setEditandoTelefono(false);
        return;
      }

      setCargandoTelefono(true);
      try {
        await axios.put(
          `https://glamperosapi.onrender.com/usuarios/${emailUsuario}/telefono`,
          { telefono: telefonoCompleto }
        );
        Cookies.set('telefonoUsuario', telefonoCompleto, { expires: 7 });
        setEditandoTelefono(false);
        setUsuario((prevUsuario) =>
          prevUsuario ? { ...prevUsuario, telefono: telefonoCompleto } : null
        );
      } catch (error) {
        console.error('Error al actualizar el teléfono:', error);
      } finally {
        setCargandoTelefono(false);
      }
    }
  };

  const actualizarFoto = async () => {
    if (usuario && fotoActualizada) {
      const formData = new FormData();
      formData.append('foto', fotoActualizada);

      setCargandoFoto(true);
      try {
        await axios.put(
          `https://glamperosapi.onrender.com/usuarios/${usuario.email}/foto`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        const response = await axios.get(`https://glamperosapi.onrender.com/usuarios/?email=${usuario.email}`);
        setUsuario(response.data);
        setFotoActualizada(null);
        setFotoPreview(null);
      } catch (error) {
        console.error('Error al actualizar la foto:', error);
      } finally {
        setCargandoFoto(false);
      }
    }
  };

  // Validar si tiene WhatsApp
  const validarNavegacion = (): string => {
    if (redirigirExplorado) {
      setRedirigirExplorado(false);
      router.push(UrlActual); // Cambio de navigate a router.push
      return "No se ha logeado";
    } else {
      router.push("/"); // Cambio de navigate a router.push
      return "WhatsApp registrado, datos enviados."; // Mensaje de éxito si tiene teléfono
    }
  };

  // Mostrar Lottie de carga mientras se obtiene el usuario
  if (!usuario) {
    return (
      <div className="editar-perfil-cargando">
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{ height: 200, width: "100%", margin: "auto" }}
        />
      </div>
    );
  }

  return (
    <div className="editar-perfil-container">
      <h2 className="editar-perfil-titulo">Editar Perfil</h2>

      <div className="editar-perfil-imagen">
        {cargandoFoto ? (
          <div className="editar-perfil-cargando">
            <Lottie
              animationData={animationData}
              loop={true}
              autoplay={true}
              style={{ height: 200, width: "100%", margin: "auto" }}
            />
          </div>
        ) : (
          <div className="editar-perfil-imagen-contenedor">
            {usuario.foto || fotoPreview ? (
              <img
                src={fotoPreview ?? usuario.foto ?? undefined}
                alt="Foto de perfil"
                className="editar-perfil-imagen-foto"
              />
            ) : (
              <div className="editar-perfil-inicial">
                {usuario.nombre.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={() => document.getElementById('fotoInput')?.click()}
              className="editar-perfil-boton-editar"
            >
              ✏️
            </button>
          </div>
        )}
        <input
          type="file"
          id="fotoInput"
          accept="image/*"
          onChange={manejarFoto}
          style={{ display: 'none' }}
        />
        {fotoActualizada && (
          <button onClick={actualizarFoto} className="editar-perfil-boton-guardar">
            Guardar Foto
          </button>
        )}
      </div>

      <div className="editar-perfil-info">
        <div className="editar-perfil-info-item">
          <p>{usuario.nombre}</p>
        </div>
        <div className="editar-perfil-info-item">
          <p>{usuario.email}</p>
        </div>
        <div className="editar-perfil-info-item">
          <div className="editar-perfil-telefono-contenedor">
            WhatsApp
            {editandoTelefono ? (
              <>
                <select
                  value={indicativo}
                  onChange={(e) => setIndicativo(e.target.value)}
                  className="editar-perfil-select"
                >
                  {codigosPaises.map((pais) => (
                    <option key={pais.codigo} value={pais.indicativo}>
                      {pais.nombre} ({pais.indicativo})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={telefono.slice(-10)}
                  onChange={manejarTelefono}
                  maxLength={10}
                  className="editar-perfil-input"
                />
              </>
            ) : (
              <p>{`${indicativo} ${telefono.slice(-10)}`}</p>
            )}
            <button
              onClick={() => setEditandoTelefono(!editandoTelefono)}
              className="editar-perfil-boton-editar-tel"
            >
              ✏️
            </button>
          </div>
        </div>
        {cargandoTelefono ? (
          <div>Actualizando teléfono...</div>
        ) : (
          editandoTelefono && (
            <button onClick={actualizarTelefono} className="editar-perfil-boton-guardar">
              Guardar Teléfono
            </button>
          )
        )}
      </div>
      {/* Botón para ir a la página principal */}
      <button onClick={validarNavegacion} className="editar-perfil-boton-regresar">
        Terminar edición
      </button>
    </div>
  );
};

export default EditarPerfil;
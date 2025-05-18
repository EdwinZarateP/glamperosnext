// src/app/favoritos/page.tsx (o .tsx donde tengas la ruta /favoritos)
"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import HeaderIcono from "../../Componentes/HeaderIcono";
import TarjetaGeneral from "../../Componentes/TarjetaGeneral";
import "./estilos.css";

interface Glamping {
  _id: string;
  imagenes: string[];
  ciudad_departamento: string;
  precioEstandar: number;
  descuento?: number;
  calificacion?: number;
  nombreGlamping: string;
  tipoGlamping: string;
  ubicacion: {
    lat: number;
    lng: number;
  };
  Acepta_Mascotas: boolean;
  fechasReservadas: string[];
  precioEstandarAdicional: number;
  Cantidad_Huespedes: number;
  Cantidad_Huespedes_Adicional: number;
  amenidadesGlobal: string[];
}

const Favoritos: React.FC = () => {
  const [glampings, setGlampings] = useState<Glamping[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const irAInicio = () => {
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    const fetchFavoritos = async () => {
      try {
        const idUsuario = Cookies.get("idUsuario");
        if (!idUsuario) {
          setError("Usuario no autenticado");
          return;
        }

        const resIds = await axios.get<string[]>(
          `https://glamperosapi.onrender.com/favoritos/${idUsuario}`
        );

        const favoritosIds = resIds.data;
        if (!favoritosIds.length) {
          setError("Ups, es hora de elegir favoritos");
          return;
        }

        const resGlampings = await axios.post<Glamping[]>(
          "https://glamperosapi.onrender.com/glampings/por_ids",
          favoritosIds
        );

        setGlampings(resGlampings.data);
      } catch (err: any) {
        const msg =
          err.response?.status === 404
            ? "Ups, es hora de elegir favoritos"
            : err.response?.data?.detail || "Error al cargar los favoritos";
        setError(msg);
      }
    };

    fetchFavoritos();
  }, []);

  // Mapea un Glamping al shape que TarjetaGeneral espera
  const mapProps = (g: Glamping) => ({
    glampingId: g._id,
    imagenes: g.imagenes,
    ciudad: g.ciudad_departamento,
    precio: g.precioEstandar,
    descuento: g.descuento,
    calificacion: g.calificacion || 5,
    favorito: true, // todos vienen de favoritos
    tipoGlamping: g.tipoGlamping,
    nombreGlamping: g.nombreGlamping,
    ubicacion: g.ubicacion,
    Acepta_Mascotas: g.Acepta_Mascotas,
    fechasReservadas: g.fechasReservadas,
    Cantidad_Huespedes: g.Cantidad_Huespedes,
    precioEstandarAdicional: g.precioEstandarAdicional,
    Cantidad_Huespedes_Adicional: g.Cantidad_Huespedes_Adicional,
    amenidadesGlobal: g.amenidadesGlobal,
  });

  if (error) {
    return (
      <div className="Favoritos-error-container">
        <div className="Favoritos-error">
          {error}
          <Image
            src="/imagenes/animal.png"
            alt="Logo Glamperos"
            className="Favoritos-logo"
            onClick={irAInicio}
            width={50}
            height={50}
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className="Favoritos-contenedor">
      {glampings.length > 0 && (
        <div className="Favoritos-titulo">
          <HeaderIcono descripcion="Tu lista de deseos" />
        </div>
      )}
      <div className="Favoritos-contenedor-tarjetas">
        {glampings.map((g) => (
          <TarjetaGeneral key={g._id} {...mapProps(g)} />
        ))}
      </div>
    </div>
  );
};

export default Favoritos;

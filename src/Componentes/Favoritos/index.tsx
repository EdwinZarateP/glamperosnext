"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import Tarjeta from "@/Componentes/Tarjeta";
import Image from "next/image";
import { useRouter } from "next/navigation";
import HeaderIcono from "@/Componentes/HeaderIcono";
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
    router.refresh(); // Recargar la página después de navegar
  };

  useEffect(() => {
    const fetchFavoritos = async () => {
      try {
        const idUsuarioCookie = Cookies.get("idUsuario");
        if (!idUsuarioCookie) {
          setError("Usuario no autenticado");
          return;
        }

        // Obtener los IDs de los favoritos del usuario
        const favoritosResponse = await axios.get<string[]>(
          `https://glamperosapi.onrender.com/favoritos/${idUsuarioCookie}`
        );

        if (favoritosResponse.status === 404) {
          setError("Ups, es hora de elegir favoritos");
          return;
        }

        const favoritosIds = favoritosResponse.data;

        if (favoritosIds.length === 0) {
          setError("Ups, es hora de elegir favoritos");
          return;
        }

        // Obtener los detalles de los glampings
        const glampingsResponse = await axios.post<Glamping[]>(
          "https://glamperosapi.onrender.com/glampings/por_ids",
          favoritosIds
        );

        setGlampings(glampingsResponse.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError("Ups, es hora de elegir favoritos");
        } else {
          setError(err.response?.data?.detail || "Error al cargar los favoritos");
        }
      }
    };

    fetchFavoritos();
  }, []);

  const esFavorito = (glampingId: string, favoritos: string[]) =>
    favoritos.includes(glampingId);

  if (error) {
    return (
      <div className="favoritos-error-container">
        <div className="favoritos-error">
          {error}
          <Image
            src="/imagenes/animal.png"  
            alt="Glamperos logo"
            className="favoritos-logo"
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
    <div className="favoritos-contenedor">
      <div className="favoritos-titulo">
        {glampings.length > 0 ? <HeaderIcono descripcion="Tu lista de deseos" /> : null}
      </div>
      <div className="favoritos-contenedor-tarjetas">
        {glampings.map((glamping, index) => (
          <Tarjeta
            key={index}
            glampingId={glamping._id}
            imagenes={glamping.imagenes}
            ciudad={glamping.ciudad_departamento}
            precio={glamping.precioEstandar}
            descuento={glamping.descuento}
            calificacion={glamping.calificacion || 5}
            favorito={esFavorito(glamping._id, glampings.map((g) => g._id))}
            nombreGlamping={glamping.nombreGlamping}
            tipoGlamping={glamping.tipoGlamping}
            ubicacion={{
              lat: glamping.ubicacion.lat ?? 0,
              lng: glamping.ubicacion.lng ?? 0,
            }}
            onFavoritoChange={(nuevoEstado) =>
              console.log(`Favorito en tarjeta ${index + 1}:`, nuevoEstado)
            }
            Acepta_Mascotas={glamping.Acepta_Mascotas}
            fechasReservadas={glamping.fechasReservadas}
            Cantidad_Huespedes={glamping.Cantidad_Huespedes}
            precioEstandarAdicional={glamping.precioEstandarAdicional}
            Cantidad_Huespedes_Adicional={glamping.Cantidad_Huespedes_Adicional}
            amenidadesGlobal={glamping.amenidadesGlobal}
          />
        ))}
      </div>
    </div>
  );
};

export default Favoritos;

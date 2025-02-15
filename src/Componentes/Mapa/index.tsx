"use client";  // Asegura que el componente solo se renderiza en el cliente

import React from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { GiCampingTent } from "react-icons/gi";
import "./estilos.css"; 

interface Props {
  lat: number;
  lng: number;
}

const MapaGlampings: React.FC<Props> = ({ lat, lng }) => {
  return (
    <div className="MapaGlampings-contenedor">
      <h1 className="MapaGlampings-titulo">Tu lugar en el mapa</h1>

      <div className="MapaGlampings-mapa-container">
        <Map
          mapboxAccessToken="pk.eyJ1IjoiZWR3aW56YXIiLCJhIjoiY200OXd3ZnF4MDFoaDJxcHpwd2lzdGM0ZSJ9.c4C1qbzuCJqKjQ01Jn-2nA"
          initialViewState={{
            latitude: lat,
            longitude: lng,
            zoom: 10,
            pitch: 30,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          minZoom={6}
          maxZoom={13}
          scrollZoom={false}
        >
          <NavigationControl position="top-right" />
          <Marker latitude={lat} longitude={lng}>
            <GiCampingTent className="MapaGlampings-icono" />
          </Marker>
        </Map>
      </div>
    </div>
  );
};

export default MapaGlampings;

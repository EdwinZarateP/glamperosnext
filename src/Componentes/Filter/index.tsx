"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "./estilos.css";

interface Props {
  slug?: string[];
}

const FiltersComponent = ({ slug }: Props) => {
  const router = useRouter();
  const [city, setCity] = useState<string>("");
  const [amenity, setAmenity] = useState<string>("");

  useEffect(() => {
    if (Array.isArray(slug)) {
      if (slug.length >= 1) setCity(slug[0]);
      if (slug.length >= 2) setAmenity(slug[1]);
    }
  }, [slug]);

  const handleFilter = () => {
    let path = "/glampings";
    if (city && amenity) {
      path += `/${city}/${amenity}`;
    } else if (city) {
      path += `/${city}`;
    }
    router.push(path);
  };

  const handleClear = () => {
    router.push("/glampings");
  };

  return (
    <div className="container">
      <div className="filterGroup">
        <label className="label">Ciudad:</label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="select"
        >
          <option value="">Seleccione una ciudad</option>
          <option value="medellin">Medellin</option>
          <option value="cali">Cali</option>
          <option value="bogota">Bogota</option>
        </select>
      </div>
      <div className="filterGroup">
        <label className="label">Amenidad:</label>
        <select
          value={amenity}
          onChange={(e) => setAmenity(e.target.value)}
          className="select"
        >
          <option value="">Seleccione una amenidad</option>
          <option value="jacuzzi">Jacuzzi</option>
          <option value="fogata">Fogata</option>
          <option value="pet-friendly">Pet Friendly</option>
        </select>
      </div>
      <div className="buttons">
        <button onClick={handleFilter} className="button">
          Aplicar Filtros
        </button>
        <button onClick={handleClear} className="buttonClear">
          Volver a búsqueda
        </button>
      </div>
    </div>
  );
};

export default FiltersComponent;

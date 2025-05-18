"use client";

import React from "react";
import { FiMapPin } from "react-icons/fi";
import { GiHabitatDome } from "react-icons/gi";
import "./estilos.css";

export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image">
        <GiHabitatDome className="skeleton-tent-icon" size={40} />    
      </div>

      <div className="skeleton-line-with-icon">
        <FiMapPin className="skeleton-pin-icon" size={14} />
        <div className="skeleton-line medium" />
      </div>

      <div className="skeleton-line short" />
      <div className="skeleton-line long" />
    </div>
  );
}

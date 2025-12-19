// src/app/gracias/GraciasContenido.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";

import HeaderIcono from "../../Componentes/HeaderIcono";
import MenuUsuariosInferior from "../../Componentes/MenuUsuariosInferior";
import "./estilos.css";

// ✅ Evitar error TS
declare global {
  interface Window {
    dataLayer: any[];
  }
}

type DatosState = {
  fechaInicio: string;
  fechaFin: string;
  telefonoUsuario: string;
  correoUsuario: string;
  cookieGlampingId: string;
  cargando: boolean;
};

const GraciasContenido: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [datos, setDatos] = useState<DatosState>({
    fechaInicio: "",
    fechaFin: "",
    telefonoUsuario: "",
    correoUsuario: "",
    cookieGlampingId: "",
    cargando: true,
  });

  useEffect(() => {
    const fechaInicio = searchParams.get("fechaInicio") ?? "Fecha no disponible";
    const fechaFin = searchParams.get("fechaFin") ?? "Fecha no disponible";

    let telefonoUsuario = Cookies.get("telefonoUsuario") || "No disponible";
    const correoUsuario = Cookies.get("correoUsuario") || "No disponible";
    const cookieGlampingId = Cookies.get("cookieGlampingId") || "No disponible";

    if (telefonoUsuario.startsWith("57")) {
      telefonoUsuario = telefonoUsuario.slice(2);
    }

    setDatos({
      fechaInicio,
      fechaFin,
      telefonoUsuario,
      correoUsuario,
      cookieGlampingId,
      cargando: false,
    });

    // ==========================
    // 📦 DATA LAYER: PURCHASE (GA4)
    // SOLO en /gracias
    // ==========================
    const cookieData = Cookies.get("transaccionFinal");
    console.log("🔍 Cookie transaccionFinal (raw):", cookieData);

    if (!cookieData) return;

    try {
      const raw = JSON.parse(cookieData);

      // Helper: borrar campos vacíos / nulos
      const limpiarVacios = (obj: any) => {
        Object.keys(obj).forEach((k) => {
          const v = obj[k];
          if (v === "" || v === null || v === undefined) delete obj[k];
        });
        return obj;
      };

      // 1) Normalizar items desde distintas posibles estructuras
      const rawItems = raw?.items || raw?.ecommerce?.items || [];
      const items = Array.isArray(rawItems)
        ? rawItems.map((it: any) =>
            limpiarVacios({
              item_id: it.item_id || it.id || it.sku,
              item_name: it.item_name || it.nombre,
              item_brand: it.item_brand || it.marca,
              item_category: it.item_category || it.categoria,
              item_category2: it.item_category2 || it.ciudad,
              item_category3: it.item_category3,
              item_category4: it.item_category4,
              item_category5: it.item_category5,
              item_variant: it.item_variant || it.variante,
              price: Number(it.price ?? it.precioUnitario ?? 0),
              quantity: Number(it.quantity ?? it.cantidad ?? 1),
              coupon: it.coupon,
            })
          )
        : [];

      // 2) Armar el evento purchase (GA4)
      const purchaseEvent: any = {
        event: "purchase",
        ecommerce: limpiarVacios({
          transaction_id:
            raw?.transaction_id ||
            raw?.ecommerce?.transaction_id ||
            raw?.idReserva ||
            raw?.reservaId,
          affiliation: raw?.affiliation || raw?.ecommerce?.affiliation || "Glamperos",
          value: Number(raw?.value ?? raw?.ecommerce?.value ?? raw?.totalPagado ?? 0),
          tax: raw?.tax ?? raw?.ecommerce?.tax,
          shipping: raw?.shipping ?? raw?.ecommerce?.shipping,
          currency: (raw?.currency || raw?.ecommerce?.currency || "COP").toUpperCase(),
          coupon: raw?.coupon ?? raw?.ecommerce?.coupon,
          items,
        }),
      };

      // 3) Validación mínima (evita enviar eventos incompletos)
      const ok =
        Boolean(purchaseEvent?.ecommerce?.transaction_id) &&
        purchaseEvent?.ecommerce?.value > 0 &&
        Array.isArray(purchaseEvent?.ecommerce?.items) &&
        purchaseEvent.ecommerce.items.length > 0 &&
        purchaseEvent.ecommerce.items.every(
          (it: any) =>
            Boolean(it.item_id) &&
            Boolean(it.item_name) &&
            Number(it.price) > 0 &&
            Number(it.quantity) > 0
        );

      if (!ok) {
        console.error("❌ purchase inválido. Revisa transaccionFinal:", {
          raw,
          purchaseEvent,
        });
        // No borramos cookie para que puedas inspeccionarla y corregir el origen
        return;
      }

      // 4) Push a dataLayer (limpieza recomendada)
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push(purchaseEvent);

      console.log("✅ purchase enviado a dataLayer:", purchaseEvent);

      // 5) Evitar duplicados al refrescar
      Cookies.remove("transaccionFinal");
    } catch (error) {
      console.error("❌ Error al parsear transaccionFinal:", error);
    }
  }, [searchParams]);

  if (datos.cargando) {
    return <p className="GraciasMensaje">Cargando información...</p>;
  }

  return (
    <div className="GraciasContenedor">
      <HeaderIcono descripcion="Glamperos" />
      <h1 className="GraciasTitulo">¡Gracias por tu reserva!</h1>

      {(datos.telefonoUsuario !== "No disponible" ||
        datos.correoUsuario !== "No disponible") && (
        <p className="GraciasMensaje">
          A tu WhatsApp{" "}
          {datos.telefonoUsuario !== "No disponible" && (
            <strong>{datos.telefonoUsuario}</strong>
          )}
          {datos.telefonoUsuario !== "No disponible" &&
            datos.correoUsuario !== "No disponible" &&
            " y correo "}
          {datos.correoUsuario !== "No disponible" && (
            <strong>{datos.correoUsuario}</strong>
          )}{" "}
          enviamos el código de reserva, ubicación del glamping y el contacto del
          anfitrión. ¡Gracias por elegirnos!
        </p>
      )}

      <img
        src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/oso.webp"
        alt="Glamperos logo"
        className="Gracias-logo"
        onClick={() => router.push("/")}
      />

      <MenuUsuariosInferior />
    </div>
  );
};

export default GraciasContenido;

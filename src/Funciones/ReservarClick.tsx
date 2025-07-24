"use client";

import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { encryptData } from "./Encryptacion";

interface ReservarClickProps {
  fechaInicio: string;
  fechaFin: string;
  totalFinal: number;
  tarifa: number;
  totalPagoGlamping: number;
  totalDias: number;
  adultos: number;
  ninos: number;
  bebes: number;
  mascotas: number;
  setUrlActual: (url: string) => void;
  setRedirigirExplorado: (valor: boolean) => void;
}

export function useReservarClick({
  fechaInicio,
  fechaFin,
  totalFinal,
  tarifa,
//   totalPagoGlamping,
  totalDias,
  adultos,
  ninos,
  bebes,
  mascotas,
  setUrlActual,
  setRedirigirExplorado,
}: ReservarClickProps) {
  const router = useRouter();
  const pathname = usePathname();
  const segments = pathname.split("/");
  const glampingId = segments[2] || ""; // el ID está en la tercera posición

  const handleReservarClick = (e: React.MouseEvent) => {
    // Guardar ID en cookie
    if (glampingId) {
      Cookies.set("CookieIdGlamping", glampingId, { expires: 1 });
    }

    const emailUsuario = Cookies.get("correoUsuario");

    // Si no hay sesión, preparamos la URL y redirigimos al registro
    if (!emailUsuario) {
      const qp = new URLSearchParams({
        glampingId,
        fechaInicio: encryptData(fechaInicio),
        fechaFin: encryptData(fechaFin),
        totalFinal: encryptData(totalFinal.toString()),
        tarifa: encryptData(tarifa.toString()),
        totalDias: encryptData(totalDias.toString()),
        adultos: encryptData(adultos.toString()),
        ninos: encryptData(ninos.toString()),
        bebes: encryptData(bebes.toString()),
        mascotas: encryptData(mascotas.toString()),
      });

      const nuevaUrl = `/Reservar?${qp.toString()}`;
      setUrlActual(nuevaUrl);
      setRedirigirExplorado(true);

      Swal.fire({
        title: "¡Estás muy cerca!",
        text: "Debes iniciar sesión primero para continuar.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      }).then(() => {
        router.push("/registro");
      });

      e.preventDefault();
      return;
    }

    // Si ya está logueado, vamos directamente a Reservar
    const qp2 = new URLSearchParams({
      glampingId,
      fechaInicio: encryptData(fechaInicio),
      fechaFin: encryptData(fechaFin),
      totalFinal: encryptData(totalFinal.toString()),
      tarifa: encryptData(tarifa.toString()),
      totalDias: encryptData(totalDias.toString()),
      adultos: encryptData(adultos.toString()),
      ninos: encryptData(ninos.toString()),
      bebes: encryptData(bebes.toString()),
      mascotas: encryptData(mascotas.toString()),
    });

    router.push(`/Reservar?${qp2.toString()}`);
  };

  return { handleReservarClick };
}

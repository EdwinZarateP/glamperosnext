import RegistroComp from "@/Componentes/RegistroComp/index";
import Link from "next/link";

export default function RegistroPag() {
  return (
    <main>
      <RegistroComp />
      <Link href="/">Volver al inicio</Link>
    </main>
  );
}

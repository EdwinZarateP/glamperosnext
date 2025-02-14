import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>🔥 ¡Bienvenido a Glamperos! 🔥</h1>
      <p>Explora los mejores glampings.</p>
      
      <nav>
        <ul>
          <li><Link href="/RegistroPag">Ir a Registro</Link></li>
        </ul>
      </nav>
    </main>
  );
}

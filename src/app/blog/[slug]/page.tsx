export const dynamic = "force-dynamic";

import Link from "next/link";
import HeaderBlog from "../../../Componentes/HeaderBlog";
import Footer from "@/Componentes/Footer";
import BotonWhatsApp from "@/Componentes/BotonWhatsApp";
import "./estilos.css";

export default async function BlogPost({
  params: { slug },
}: {
  params: { slug: string };
}) {
  // 🔹 Fetch SIN caché (obligatorio para SSR)
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_WORDPRESS_API}/posts?slug=${slug}`,
    { cache: "no-store" }
  );

  const posts: any[] = res.ok ? await res.json() : [];
  const post = posts[0];

  return (
    <>
      <HeaderBlog />

      <main className="post-container">
        {!slug || !res.ok || !post ? (
          <>
            <p className="post-error">
              {!slug
                ? "Error: slug no proporcionado."
                : !res.ok
                ? "Error al cargar el post."
                : "No se encontró el post."}
            </p>
            <Link href="/blog" className="post-back-link">
              ← Ir al blog
            </Link>
          </>
        ) : (
          <>
            <h1
              className="post-title"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            <article
              className="post-content"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />

            <Link href="/blog" className="post-back-link">
              ← Ir al blog
            </Link>
          </>
        )}
      </main>

      <Footer />
      <BotonWhatsApp />
    </>
  );
}

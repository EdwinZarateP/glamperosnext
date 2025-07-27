// src/app/blog/page.tsx (o BlogIndex.tsx)
import Link from "next/link";
import HeaderBlog from "../../Componentes/HeaderBlog";
import Footer from "@/Componentes/Footer";
import BotonWhatsApp from "@/Componentes/BotonWhatsApp";
import "./estilos.css";

export const revalidate = 60;

interface Post {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  _embedded?: {
    "wp:featuredmedia"?: { source_url: string }[];
    "wp:term"?: any[][];
  };
}

export default async function BlogIndex() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_WORDPRESS_API}/posts?_embed&per_page=7&page=1`
  );
  const posts: Post[] = await res.json();

  if (!posts.length) return <p>No hay artículos disponibles.</p>;

  // Separa la última entrada
  const [destacado, ...otros] = posts;
  const imagenDestacada =
    destacado._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

  return (
    <>
      <HeaderBlog descripcion="Blog Glamperos" />

      <main className="Blog-contenedor">
        {/* =====================
            1) Artículo destacado
           ===================== */}
        <section className="Blog-destacado">
          <Link
            href={`/blog/${destacado.slug}`}
            className="Blog-destacado-link"
          >
            {imagenDestacada && (
              <img
                src={imagenDestacada}
                alt="Artículo destacado"
                className="Blog-destacado-img"
              />
            )}
            <div className="Blog-destacado-info">
              <time className="Blog-destacado-date">
                {new Date(destacado.date).toLocaleDateString("es-CO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
              <h2
                className="Blog-destacado-title"
                dangerouslySetInnerHTML={{ __html: destacado.title.rendered }}
              />
              <p
                className="Blog-destacado-excerpt"
                dangerouslySetInnerHTML={{ __html: destacado.excerpt.rendered }}
              />
              <span className="Blog-destacado-mas">Leer más →</span>
            </div>
          </Link>
        </section>

        {/* ======================
            2) Grid de artículos
           ====================== */}
        <section className="Blog-grid">
          {otros.map((post) => {
            const img = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="Blog-card"
                prefetch={false}
              >
                {img && (
                  <div className="Blog-card-img-wrapper">
                    <img
                      src={img}
                      alt={post.title.rendered}
                      className="Blog-card-img"
                    />
                  </div>
                )}
                <div className="Blog-card-content">
                  <h3
                    className="Blog-card-title"
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                  />
                  <p
                    className="Blog-card-excerpt"
                    dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                  />
                  <span className="Blog-card-mas">Leer más →</span>
                </div>
              </Link>
            );
          })}
        </section>
      </main>

      <Footer />
      <BotonWhatsApp />
    </>
  );
}

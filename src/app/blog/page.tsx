export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import HeaderBlog from "../../Componentes/HeaderBlog";
import Footer from "@/Componentes/Footer";
import BotonWhatsApp from "@/Componentes/BotonWhatsApp";
import "./estilos.css";

export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
  robots: { index: true, follow: true },
  title: "Blog de Glamperos: guías y tips de glamping en Colombia",
  description:
    "Consejos, rutas y destinos para hacer glamping en Colombia. Inspiración y guías prácticas para tu próxima escapada.",
};

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

const PER_PAGE = 8;

function range(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

export default async function BlogIndex({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const currentPage = Math.max(1, Number(searchParams?.page ?? "1"));

  const url =
    `${process.env.NEXT_PUBLIC_WORDPRESS_API}` +
    `/posts?_embed&status=publish&orderby=date&order=desc` +
    `&per_page=${PER_PAGE}&page=${currentPage}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return <p>Error al cargar artículos.</p>;

  const totalPages = Number(res.headers.get("X-WP-TotalPages") || "1");
  const posts: Post[] = await res.json();
  if (!posts.length) return <p>No hay artículos disponibles.</p>;

  const showFeatured = currentPage === 1;
  const [destacado, ...otros] = posts;
  const lista = showFeatured ? otros : posts; // en páginas >1 no hay destacado

  const imagenDestacada = destacado?._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

  // Paginación (mostramos ventana alrededor de la página actual)
  const WINDOW = 2; // páginas a cada lado
  const start = Math.max(1, currentPage - WINDOW);
  const end = Math.min(totalPages, currentPage + WINDOW);
  const pages = range(start, end);

  return (
    <>
      <HeaderBlog />

      <main className="Blog-contenedor">
        {/* ============ 1) Artículo Destacado (solo página 1) ============ */}
        {showFeatured && destacado && (
          <section className="Blog-destacado">
            <Link href={`/blog/${destacado.slug}`} className="Blog-destacado-link">
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
        )}

        {/* ===================== 2) Grid de artículos ===================== */}
        <section className="Blog-grid">
          {lista.map((post) => {
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
                    <img src={img} alt={post.title.rendered} className="Blog-card-img" />
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

        {/* ===================== 3) Controles de paginación ===================== */}
        {totalPages > 1 && (
          <nav className="Blog-paginacion" aria-label="Paginación del blog">
            {/* Anterior */}
            {currentPage > 1 ? (
              <Link className="Blog-page-btn" href={`/blog?page=${currentPage - 1}`}>
                ← Anterior
              </Link>
            ) : (
              <span className="Blog-page-btn Blog-page-btn--disabled">← Anterior</span>
            )}

            {/* Números */}
            <div className="Blog-page-numbers">
              {start > 1 && (
                <>
                  <Link className="Blog-page-num" href="/blog?page=1">
                    1
                  </Link>
                  {start > 2 && <span className="Blog-page-ellipsis">…</span>}
                </>
              )}

              {pages.map((p) =>
                p === currentPage ? (
                  <span key={p} className="Blog-page-num Blog-page-num--active">
                    {p}
                  </span>
                ) : (
                  <Link key={p} className="Blog-page-num" href={`/blog?page=${p}`}>
                    {p}
                  </Link>
                )
              )}

              {end < totalPages && (
                <>
                  {end < totalPages - 1 && <span className="Blog-page-ellipsis">…</span>}
                  <Link className="Blog-page-num" href={`/blog?page=${totalPages}`}>
                    {totalPages}
                  </Link>
                </>
              )}
            </div>

            {/* Siguiente */}
            {currentPage < totalPages ? (
              <Link className="Blog-page-btn" href={`/blog?page=${currentPage + 1}`}>
                Siguiente →
              </Link>
            ) : (
              <span className="Blog-page-btn Blog-page-btn--disabled">Siguiente →</span>
            )}
          </nav>
        )}
      </main>

      <Footer />
      <BotonWhatsApp />
    </>
  );
}

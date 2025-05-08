// src/app/blog/page.tsx
import Link from "next/link";
import HeaderIcono from "../../Componentes/HeaderIcono";
import "./estilos.css";

export const revalidate = 60;

interface Post {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  _embedded?: {
    "wp:featuredmedia"?: { source_url: string }[];
    "wp:term"?: any[][];
  };
}

export default async function BlogIndex() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_WORDPRESS_API}/posts?_embed`
  );
  const posts: Post[] = await res.json();

  return (
    <main className="blog-contenedor">
      <HeaderIcono descripcion="Blog Glamperos" />

      <h1 className="blog-title">Experiencias</h1>
      <p className="blog-subtitle">
        Historias, consejos y destinos únicos para glamping en Colombia
      </p>

      <div className="blog-contenedor-listas">
        <ul className="blog-post-list">
          {posts.map((post, index) => {
            const featuredMedia =
              post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
            const categories =
              post._embedded?.["wp:term"]?.[0]?.map((cat: any) => cat) || [];

            return (
              <li
                key={post.id}
                className="blog-post-item"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Link href={`/blog/${post.slug}`} prefetch={false}>
                  <article className="blog-post-card">
                    {featuredMedia && (
                      <img
                        src={featuredMedia}
                        alt="Imagen destacada"
                        className="blog-post-image"
                      />
                    )}
                    <div className="blog-post-content">
                      {categories.length > 0 && (
                        <div className="blog-post-categorias">
                          {categories.map((cat: any) => (
                            <span key={cat.id} className="blog-categoria">
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <h2
                        className="blog-post-title"
                        dangerouslySetInnerHTML={{
                          __html: post.title.rendered,
                        }}
                      />

                      <div
                        className="blog-post-excerpt"
                        dangerouslySetInnerHTML={{
                          __html: post.excerpt.rendered,
                        }}
                      />

                      <div className="blog-post-footer">
                        <span className="leer-mas">Leer más →</span>
                      </div>
                    </div>
                  </article>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}

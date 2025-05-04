// src/app/blog/page.tsx
import Link from "next/link";
import HeaderIcono from "../../Componentes/HeaderIcono"; 
import "./estilos.css";

export const revalidate = 60;

export default async function BlogIndex() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_WORDPRESS_API}/posts?_embed`
  );
  const posts: any[] = await res.json();

  return (
    <main className="blog-contenedor">
      <HeaderIcono descripcion="Blog Glamperos" />
      <div className="blog-contenedor-listas">
      <h1 className="blog-title">Experiencias</h1>
      <ul className="blog-post-list">
        {posts.map((post) => {
          const featuredMedia =
            post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

          return (
            <li key={post.id} className="blog-post-item">
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

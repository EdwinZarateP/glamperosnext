// src/app/blog/page.tsx
import Link from "next/link";
import "./estilos.css";

export const revalidate = 60;

export default async function BlogIndex() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API}/posts`);
  const posts: any[] = await res.json();

  return (
    <main className="blog-container">
      <h1 className="blog-title">Últimos artículos</h1>
      <ul className="blog-post-list">
        {posts.map((post) => {
          // Extraer imagen destacada desde _embedded
          const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

          return (
            <li key={post.id}>
              <Link href={`/blog/${post.slug}`} prefetch={false}>
                <article>
                  {featuredMedia && (
                    <img
                      src={featuredMedia}
                      alt="Imagen destacada"
                      style={{
                        width: "100%",
                        borderRadius: "10px",
                        marginBottom: "1rem",
                      }}
                    />
                  )}
                  <h2
                    className="blog-post-title"
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                  />
                </article>
              </Link>
              <div
                className="blog-post-excerpt"
                dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
              />
            </li>
          );
        })}
      </ul>
    </main>
  );
}

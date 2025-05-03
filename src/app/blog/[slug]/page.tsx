// src/app/blog/[slug]/page.tsx
import Link from "next/link";
import "./estilos.css";

// Esto genera el listado de slugs estáticos
export async function generateStaticParams() {
  const res = await fetch(`${process.env.WORDPRESS_API}/posts`);
  const posts: any[] = await res.json();
  return posts.map((p) => ({ slug: p.slug }));
}

// Aquí params **es async**, así que lo recibimos como Promise<{slug: string}>
export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // ¡Muy importante! primero await params
  const { slug } = await params;

  const res = await fetch(
    `${process.env.WORDPRESS_API}/posts?slug=${slug}`
  );
  const posts: any[] = await res.json();
  const post = posts[0];

  if (!post) {
    return (
      <main className="blog-container">
        <p>No se encontró el post.</p>
        <Link href="/blog" prefetch={false}>
          ← Volver al blog
        </Link>
      </main>
    );
  }

  return (
    <main className="blog-container">
      <h1
        className="blog-title"
        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
      />
      <article
        className="blog-post-content"
        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
      />
      <Link href="/blog" prefetch={false}>
        ← Volver al blog
      </Link>
    </main>
  );
}

// src/app/blog/[slug]/page.tsx
import Link from "next/link";
import "./estilos.css";

// Habilitar revalidación ISR para esta página
export const revalidate = 60;

// Generar rutas estáticas para los posts
export async function generateStaticParams() {
  const res = await fetch(`${process.env.WORDPRESS_API}/posts`);
  const posts: any[] = await res.json();

  return posts.map((post) => ({ slug: post.slug }));
}

// Página individual del post
export default async function BlogPost({
  params: { slug },
}: {
  params: { slug: string };
}) {
  if (!slug) {
    return (
      <main className="blog-container">
        <p>Error: slug no proporcionado.</p>
        <Link href="/blog">← Volver al blog</Link>
      </main>
    );
  }

  const res = await fetch(`${process.env.WORDPRESS_API}/posts?slug=${slug}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return (
      <main className="blog-container">
        <p>Error al cargar el post.</p>
        <Link href="/blog">← Volver al blog</Link>
      </main>
    );
  }

  const posts: any[] = await res.json();
  const post = posts[0];

  if (!post) {
    return (
      <main className="blog-container">
        <p>No se encontró el post.</p>
        <Link href="/blog">← Volver al blog</Link>
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
      <Link href="/blog">← Volver al blog</Link>
    </main>
  );
}

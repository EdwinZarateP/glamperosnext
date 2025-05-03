// src/app/blog/[slug]/page.tsx
import Link from "next/link";
import "./estilos.css";

export async function generateStaticParams() {
  const res = await fetch(`${process.env.WORDPRESS_API}/posts`);
  const posts: any[] = await res.json();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  // ─── AQUI EL AWAIT ───────────────────────────────────────────────
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
      <div
        className="blog-post-content"
        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
      />
      <Link href="/blog" prefetch={false}>
        ← Volver al blog
      </Link>
    </main>
  );
}

import Link from "next/link";
import "./estilos.css";

export async function generateStaticParams() {
  const res = await fetch(`${process.env.WORDPRESS_API}/posts`);
  const posts = await res.json();

  return posts.map((post: any) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const res = await fetch(`${process.env.WORDPRESS_API}/posts?slug=${params.slug}`);
  const posts = await res.json();
  const post = posts[0];

  if (!post) return <p>No se encontró el post.</p>;

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
      <Link className="blog-back-link" href="/blog">
        ← Volver al blog
      </Link>
    </main>
  );
}

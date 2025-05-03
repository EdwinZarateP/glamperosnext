import Link from "next/link";
import "./estilos.css";

export default async function BlogIndex() {
  const res = await fetch(`${process.env.WORDPRESS_API}/posts`, {
    next: { revalidate: 60 },
  });
  const posts = await res.json();

  return (
    <main className="blog-container">
      <h1 className="blog-title">Últimos artículos</h1>
      <ul className="blog-post-list">
        {posts.map((post: any) => (
          <li key={post.id}>
            <Link href={`/blog/${post.slug}`}>
              <div
                className="blog-post-title"
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
              />
            </Link>
            <div
              className="blog-post-excerpt"
              dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
            />
          </li>
        ))}
      </ul>
    </main>
  );
}

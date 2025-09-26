export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import HeaderBlog from "../../../Componentes/HeaderBlog";
import Footer from "@/Componentes/Footer";
import BotonWhatsApp from "@/Componentes/BotonWhatsApp";
import PostTOC from "./PostTOC";             // ← importa el client component
import "./estilos.css";

/* Helpers SEO */
function decodeEntities(str: string) {
  return str
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&hellip;/g, "…")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
function stripHtml(html?: string) {
  return decodeEntities((html || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim());
}
function clamp160(s: string) {
  return s.length > 160 ? s.slice(0, 157) + "…" : s;
}

/* Metadata */
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_WORDPRESS_API}/posts?slug=${params.slug}&_embed`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return {
      title: "Glamperos",
      description: "Glamping en Colombia",
      alternates: { canonical: `/blog/${params.slug}` },
      robots: { index: true, follow: true },
    };
  }

  const posts: any[] = await res.json();
  const post = posts?.[0];

  const title = stripHtml(post?.title?.rendered) || "Glamperos";
  const rawDesc = stripHtml(post?.excerpt?.rendered) || "Descubre y reserva glampings en Colombia.";
  const description = clamp160(rawDesc);
  const image = post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: `/blog/${params.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/blog/${params.slug}`,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogPost({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_WORDPRESS_API}/posts?slug=${slug}&_embed`,
    { cache: "no-store" }
  );

  const posts: any[] = res.ok ? await res.json() : [];
  const post = posts?.[0];

  return (
    <>
      {/* expón la altura de tu header sticky via CSS var si quieres afinar offset */}
      <HeaderBlog />

      <main className="post-container">
        {!slug || !res.ok || !post ? (
          <>
            <p className="post-error">
              {!slug
                ? "Error: slug no proporcionado."
                : !res.ok
                ? "Error al cargar el post."
                : "No se encontró el post."}
            </p>
            <Link href="/blog" className="post-back-link">← Ir al blog</Link>
          </>
        ) : (
          <>
            <h1
              className="post-title"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            <div className="post-layout">              
              <article
                className="post-content"
                dangerouslySetInnerHTML={{ __html: post.content.rendered }}
              />
              <PostTOC />
            </div>

            <Link href="/blog" className="post-back-link">← Ir al blog</Link>
          </>
        )}
      </main>

      <Footer />
      <BotonWhatsApp />
    </>
  );
}

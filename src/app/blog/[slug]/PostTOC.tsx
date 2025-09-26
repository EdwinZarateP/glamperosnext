"use client";

import { useEffect, useRef, useState } from "react";

type TOCItem = { id: string; text: string };

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function useHeaderOffset() {
  const DEFAULT = 96;
  try {
    const css = getComputedStyle(document.documentElement)
      .getPropertyValue("--header-sticky-height");
    const n = parseInt(css.trim(), 10);
    return Number.isFinite(n) && n > 0 ? n : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function buildUniqueId(base: string, used: Set<string>) {
  let id = base || "sec";
  let i = 1;
  while (used.has(id)) id = `${base}-${i++}`;
  used.add(id);
  return id;
}

export default function PostTOC() {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [active, setActive] = useState<string>("");
  const [openMobile, setOpenMobile] = useState<boolean>(false);
  const headerOffsetRef = useRef<number>(96);

  useEffect(() => {
    headerOffsetRef.current = useHeaderOffset();

    const root = document.querySelector(".post-content");
    if (!root) return;

    const h2s = Array.from(root.querySelectorAll("h2")) as HTMLElement[];
    const used = new Set<string>();
    const newItems: TOCItem[] = [];

    h2s.forEach((el) => {
      if (!el.id || el.id.trim() === "") {
        const base = slugify(el.innerText || el.textContent || "seccion");
        el.id = buildUniqueId(base, used);
      } else {
        used.add(el.id);
      }
      newItems.push({ id: el.id, text: el.innerText || el.textContent || "" });
    });

    setItems(newItems);

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).id;
          if (entry.isIntersecting) setActive(id);
        });
      },
      {
        root: null,
        threshold: 0,
        rootMargin: `-${headerOffsetRef.current + 8}px 0px -70% 0px`,
      }
    );

    h2s.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, []);

  const handleClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const y = window.scrollY + rect.top - headerOffsetRef.current - 8;
    window.scrollTo({ top: y, behavior: "smooth" });
    if (window.innerWidth < 900) setOpenMobile(false);
  };

  if (!items.length) return null;

  return (
    <>
      {/* Mobile (<900px) */}
      <div className="toc-mobile">
        <button
          className="toc-mobile-toggle"
          aria-expanded={openMobile}
          onClick={() => setOpenMobile((v) => !v)}
        >
          Tabla de contenidos
          <span className={`toc-caret ${openMobile ? "open" : ""}`} aria-hidden>
            ▾
          </span>
        </button>

        {openMobile && (
          <nav className="toc-list" aria-label="Tabla de contenidos">
            <ul>
              {items.map((it) => (
                <li key={it.id}>
                  <a
                    href={`#${it.id}`}
                    onClick={handleClick(it.id)}
                    className={active === it.id ? "active" : ""}
                  >
                    {it.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* Desktop (≥900px) */}
      <aside className="toc-desktop" aria-label="Tabla de contenidos">
        <div className="toc-box">
          <div className="toc-title">Tabla de contenidos</div>
          <nav className="toc-list">
            <ul>
              {items.map((it) => (
                <li key={it.id}>
                  <a
                    href={`#${it.id}`}
                    onClick={handleClick(it.id)}
                    className={active === it.id ? "active" : ""}
                  >
                    {it.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}

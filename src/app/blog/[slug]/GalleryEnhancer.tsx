// JS
"use client";
import { useEffect } from "react";

function enhanceOneGallery(gallery: HTMLElement) {
  if (gallery.dataset.enhanced === "1") return;
  gallery.dataset.enhanced = "1";
  gallery.classList.add("bloggallery-slider");

  // Rail: UL.blocks-gallery-grid o la galería misma
  const rail = gallery.querySelector<HTMLElement>(".blocks-gallery-grid") || gallery;

  // Slides
  const slides = Array.from(rail.children).filter((el) => {
    const c = (el as HTMLElement).classList;
    return (
      c.contains("blocks-gallery-item") ||
      c.contains("wp-block-image") ||
      (el.tagName === "FIGURE" && c.contains("wp-block-image"))
    );
  }) as HTMLElement[];

  const total = slides.length;
  if (total <= 1) return;

  // ---------- Paginación ----------
  const pagination = document.createElement("div");
  pagination.className = "bloggallery-pagination";
  const dots = document.createElement("div");
  dots.className = "bloggallery-dots";
  const counter = document.createElement("span");
  counter.className = "bloggallery-counter";
  pagination.appendChild(dots);
  pagination.appendChild(counter);
  gallery.parentElement?.insertBefore(pagination, gallery.nextSibling);

  // ---------- Overlay de flechas (siempre visible) ----------
  const overlay = document.createElement("div");
  overlay.className = "bloggallery-arrows";
  const leftBtn = document.createElement("button");
  leftBtn.type = "button";
  leftBtn.className = "bloggallery-arrow bloggallery-arrow-left";
  leftBtn.setAttribute("aria-label", "Imagen anterior");
  leftBtn.innerHTML = '<span aria-hidden="true">‹</span>';

  const rightBtn = document.createElement("button");
  rightBtn.type = "button";
  rightBtn.className = "bloggallery-arrow bloggallery-arrow-right";
  rightBtn.setAttribute("aria-label", "Imagen siguiente");
  rightBtn.innerHTML = '<span aria-hidden="true">›</span>';

  overlay.appendChild(leftBtn);
  overlay.appendChild(rightBtn);
  gallery.appendChild(overlay);

  // ---------- Helpers (centrado con snap:center) ----------
  const targetLeftFor = (i: number) => {
    const s = slides[i];
    return Math.max(0, s.offsetLeft - (rail.clientWidth - s.clientWidth) / 2);
  };
  const railViewportCenter = () => rail.scrollLeft + rail.clientWidth / 2;
  const slideCenter = (i: number) => slides[i].offsetLeft + slides[i].clientWidth / 2;

  const getActiveIndex = () => {
    const center = railViewportCenter();
    let best = 0, bestD = Infinity;
    for (let i = 0; i < total; i++) {
      const d = Math.abs(center - slideCenter(i));
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  };

  const gotoIndex = (nextIndex: number) => {
    const idx = Math.max(0, Math.min(total - 1, nextIndex));
    rail.scrollTo({ left: targetLeftFor(idx), behavior: "smooth" });
  };

  // Dots
  slides.forEach((_, idx) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "bloggallery-dot";
    dot.setAttribute("aria-label", `Ir a imagen ${idx + 1}`);
    dot.addEventListener("click", () => gotoIndex(idx));
    dots.appendChild(dot);
  });

  // Clicks flechas
  leftBtn.addEventListener("click", () => gotoIndex(getActiveIndex() - 1));
  rightBtn.addEventListener("click", () => gotoIndex(getActiveIndex() + 1));

  // ---------- UI (no ocultamos, solo deshabilitamos en extremos) ----------
  const updateUI = () => {
    const i = getActiveIndex();
    const current = i + 1;

    Array.from(dots.children).forEach((d, j) =>
      d.classList.toggle("bloggallery-active", j === i)
    );
    counter.textContent = `${current}/${total}`;

    const disableLeft  = i === 0;
    const disableRight = i === total - 1;
    leftBtn.toggleAttribute("disabled", disableLeft);
    rightBtn.toggleAttribute("disabled", disableRight);
    leftBtn.classList.toggle("bloggallery-is-disabled", disableLeft);
    rightBtn.classList.toggle("bloggallery-is-disabled", disableRight);
  };

  rail.addEventListener("scroll", () => requestAnimationFrame(updateUI), { passive: true });

  const recalcAndUpdate = () => updateUI();

  rail.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", recalcAndUpdate, { once: true });
  });
  window.addEventListener("resize", recalcAndUpdate);
  window.addEventListener("orientationchange", recalcAndUpdate);

  // Primer pintado
  recalcAndUpdate();
}

export default function GalleryEnhancer() {
  useEffect(() => {
    const galleries = document.querySelectorAll<HTMLElement>(".post-content .wp-block-gallery");
    galleries.forEach(enhanceOneGallery);
  }, []);
  return null;
}

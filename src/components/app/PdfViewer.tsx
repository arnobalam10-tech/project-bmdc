"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Document, Page, pdfjs } from "react-pdf";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { B2Loader } from "@/components/brand/B2";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

/**
 * In-platform viewer: no download / print controls, no text layer, right-click and
 * Ctrl/Cmd+S/P blocked. The file URL is a short-lived signed URL.
 */
export default function PdfViewer({ url, title }: { url: string; title: string }) {
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(0);
  const [failed, setFailed] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.min(e.contentRect.width, 900)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const block = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["s", "p"].includes(e.key.toLowerCase())) e.preventDefault();
    };
    window.addEventListener("keydown", block);
    return () => window.removeEventListener("keydown", block);
  }, []);

  useEffect(() => {
    if (!pages) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(Number((e.target as HTMLElement).dataset.page));
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll("[data-page]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pages, zoom, width]);

  return (
    <div className="no-save" onContextMenu={(e) => e.preventDefault()}>
      <div className="sticky top-14 z-30 -mx-4 flex h-14 items-center gap-2 border-b border-b2-border bg-b2-black/95 px-3 backdrop-blur-md md:top-0 md:mx-0 md:rounded-b-2xl">
        <Link href="/notes" aria-label="Back to notes" className="grid size-11 place-items-center rounded-full text-b2-meadow">
          <ArrowLeft size={20} />
        </Link>
        <p className="min-w-0 flex-1 truncate font-medium">{title}</p>
        <span className="tabular hidden text-sm text-b2-pistachio sm:inline">
          {pages ? `${current} / ${pages}` : ""}
        </span>
        <button type="button" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))} className="grid size-10 place-items-center rounded-full hover:bg-white/5">
          <Minus size={18} />
        </button>
        <span className="tabular w-11 text-center text-sm">{Math.round(zoom * 100)}%</span>
        <button type="button" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(2.4, z + 0.2))} className="grid size-10 place-items-center rounded-full hover:bg-white/5">
          <Plus size={18} />
        </button>
      </div>

      <div ref={box} className="mt-4 overflow-x-auto">
        {failed ? (
          <p className="p-8 text-center text-b2-pistachio">That didn&apos;t load. Check your connection and reopen the note.</p>
        ) : (
          <Document
            file={url}
            onLoadSuccess={({ numPages }) => setPages(numPages)}
            onLoadError={() => setFailed(true)}
            loading={<B2Loader label="Opening notes" />}
            className="flex flex-col items-center gap-4"
          >
            {width > 0 &&
              Array.from({ length: pages }, (_, n) => (
                <div key={n} data-page={n + 1} className="overflow-hidden rounded-lg bg-white shadow-[0_12px_40px_rgba(0,223,129,.08)]">
                  <Page
                    pageNumber={n + 1}
                    width={width * zoom}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    loading={<div className="skeleton" style={{ width: width * zoom, height: width * zoom * 1.41 }} />}
                  />
                </div>
              ))}
          </Document>
        )}
      </div>
      {pages > 0 && (
        <p className="tabular fixed bottom-20 left-1/2 z-20 -translate-x-1/2 rounded-full bg-b2-dark/90 px-3 py-1 text-xs text-b2-pistachio sm:hidden">
          {current} / {pages}
        </p>
      )}
    </div>
  );
}

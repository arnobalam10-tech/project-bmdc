"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Document, Page, pdfjs } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { ArrowLeft, EyeOff, Maximize2, Minus, Plus } from "lucide-react";
import { B2Loader } from "@/components/brand/B2";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

const MAX_WIDTH = 860; // comfortable reading width on desktop
const KEEP_AROUND = 2; // pages kept rendered around the visible one (memory on phones)

/**
 * View-only notes:
 *  - no download / print / copy / right-click / drag / long-press; no text layer
 *  - content blacks out whenever the tab or window loses focus or Print Screen is pressed (desktop
 *    snipping tools and screen recorders), and prints come out blank
 *  - pages render lazily, sized to the screen width (edge-to-edge on phones)
 * A website cannot stop a phone's own system screenshot; this deters everything a browser can see.
 */
export default function PdfViewer({ url, title }: { url: string; title: string }) {
  const [pages, setPages] = useState(0);
  const [ratio, setRatio] = useState(842 / 595); // A4 until the real size is known
  const [current, setCurrent] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(0);
  const [failed, setFailed] = useState(false);
  const [shield, setShield] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const pageWidth = Math.round(Math.min(width, MAX_WIDTH) * zoom);
  const pageHeight = Math.round(pageWidth * ratio);

  // container width
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // protection: block shortcuts, black out when focus leaves, Print Screen
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const hide = () => setShield(true);
    const show = () => {
      if (!document.hidden && document.hasFocus()) setShield(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ["s", "p", "c", "a", "u"].includes(k)) e.preventDefault();
      if (e.key === "PrintScreen" || (e.metaKey && e.shiftKey && ["3", "4", "5", "s"].includes(k))) hide();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        hide();
        navigator.clipboard?.writeText("Project BMDC notes are view-only.").catch(() => {});
        clearTimeout(timer);
        timer = setTimeout(show, 1500);
      }
    };
    const onVisibility = () => (document.hidden ? hide() : show());
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("blur", hide);
    window.addEventListener("focus", show);
    window.addEventListener("beforeprint", hide);
    window.addEventListener("afterprint", show);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("blur", hide);
      window.removeEventListener("focus", show);
      window.removeEventListener("beforeprint", hide);
      window.removeEventListener("afterprint", show);
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimeout(timer);
    };
  }, []);

  // which page is on screen
  useEffect(() => {
    if (!pages) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setCurrent(Number((visible.target as HTMLElement).dataset.page));
      },
      { threshold: [0.25, 0.5, 0.75] }
    );
    document.querySelectorAll("[data-page]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pages, pageWidth]);

  const onLoad = useCallback(async (pdf: PDFDocumentProxy) => {
    setPages(pdf.numPages);
    try {
      const first = await pdf.getPage(1);
      const vp = first.getViewport({ scale: 1 });
      setRatio(vp.height / vp.width);
    } catch {
      /* keep A4 */
    }
  }, []);

  const goTo = (n: number) =>
    document.querySelector(`[data-page="${n}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const file = useMemo(() => ({ url }), [url]);
  // fetch only the byte ranges the visible pages need first, then the rest in the background
  const options = useMemo(() => ({ disableStream: true, disableAutoFetch: false }), []);

  return (
    <div
      className="no-save pdf-protected"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
    >
      {/* sticky toolbar */}
      <div className="sticky top-14 z-30 -mx-4 flex h-14 items-center gap-1 border-b border-b2-border bg-b2-black/95 px-2 backdrop-blur-md sm:gap-2 sm:px-3 md:top-0 md:mx-0 md:rounded-b-2xl">
        <Link href="/notes" aria-label="Back to notes" className="pressable hidden size-11 place-items-center rounded-full text-b2-meadow md:grid">
          <ArrowLeft size={20} />
        </Link>
        <p className="min-w-0 flex-1 truncate pl-2 font-medium md:pl-0">{title}</p>
        {pages > 0 && (
          <label className="flex items-center">
            <span className="sr-only">Go to page</span>
            <select
              value={current}
              onChange={(e) => goTo(Number(e.target.value))}
              className="tabular h-9 rounded-full border border-b2-border bg-b2-dark px-2 text-sm"
            >
              {Array.from({ length: pages }, (_, n) => (
                <option key={n} value={n + 1}>
                  {n + 1} / {pages}
                </option>
              ))}
            </select>
          </label>
        )}
        <button type="button" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(1)))} className="pressable grid size-10 place-items-center rounded-full hover:bg-white/5">
          <Minus size={18} />
        </button>
        <button type="button" aria-label="Fit to width" onClick={() => setZoom(1)} className="tabular hidden h-9 min-w-12 rounded-full px-1 text-sm hover:bg-white/5 sm:block">
          {Math.round(zoom * 100)}%
        </button>
        <button type="button" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(2.4, +(z + 0.2).toFixed(1)))} className="pressable grid size-10 place-items-center rounded-full hover:bg-white/5">
          <Plus size={18} />
        </button>
        <button type="button" aria-label="Fit to width" onClick={() => setZoom(1)} className="pressable grid size-10 place-items-center rounded-full hover:bg-white/5 sm:hidden">
          <Maximize2 size={16} />
        </button>
      </div>

      {/* pages: edge-to-edge on phones */}
      <div ref={box} className="relative -mx-4 mt-3 overflow-x-auto md:mx-0 md:mt-5">
        {failed ? (
          <p className="p-8 text-center text-b2-pistachio">That didn&apos;t load. Check your connection and reopen the note.</p>
        ) : (
          <Document
            file={file}
            options={options}
            onLoadSuccess={onLoad}
            onLoadError={() => setFailed(true)}
            loading={<B2Loader label="Opening notes" />}
            className="flex flex-col items-center gap-3 md:gap-5"
          >
            {pageWidth > 0 &&
              Array.from({ length: pages }, (_, n) => {
                const near = Math.abs(n + 1 - current) <= KEEP_AROUND;
                return (
                  <div
                    key={n}
                    data-page={n + 1}
                    className="relative overflow-hidden bg-white shadow-[0_8px_30px_rgba(2,26,23,.12)] md:rounded-lg"
                    style={{ width: pageWidth, height: pageHeight }}
                  >
                    {near ? (
                      <Page
                        pageNumber={n + 1}
                        width={pageWidth}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        loading={<div className="skeleton size-full !rounded-none" />}
                        className="pointer-events-none"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-sm text-b2-stone">Page {n + 1}</div>
                    )}
                  </div>
                );
              })}
          </Document>
        )}

        {shield && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black p-6 text-center text-white" aria-live="polite">
            <div>
              <EyeOff className="mx-auto opacity-70" size={32} />
              <p className="mt-3 font-medium">Notes are hidden while this window isn&apos;t active.</p>
              <p className="mt-1 text-sm text-white/60">Tap here or come back to the tab to keep reading.</p>
              <button type="button" onClick={() => setShield(false)} className="mt-5 rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium hover:bg-white/20">
                Continue reading
              </button>
            </div>
          </div>
        )}
      </div>

      {pages > 0 && (
        <p className="tabular pointer-events-none fixed bottom-20 left-1/2 z-20 -translate-x-1/2 rounded-full bg-b2-black/85 px-3 py-1 text-xs text-b2-flash shadow md:hidden">
          {current} / {pages}
        </p>
      )}
    </div>
  );
}

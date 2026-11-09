"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist/legacy/build/pdf.mjs";
import { ArrowLeft, EyeOff, Maximize2, Minus, Plus, RotateCw } from "lucide-react";
import { B2Loader } from "@/components/brand/B2";
import { loadPdfjs } from "@/lib/pdfjs";

const MAX_WIDTH = 860; // comfortable reading width on desktop
const KEEP_AROUND = 2; // pages kept rendered around the visible one (memory on phones)

/** One page drawn to a canvas, only while it is near the screen. */
function PageCanvas({ doc, n, width, height, active }: { doc: PDFDocumentProxy; n: number; width: number; height: number; active: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active || !width) return;
    let task: RenderTask | null = null;
    let cancelled = false;
    (async () => {
      try {
        const page = await doc.getPage(n);
        if (cancelled || !canvas.current) return;
        const base = page.getViewport({ scale: 1 });
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // sharp but not huge on phones
        const viewport = page.getViewport({ scale: (width / base.width) * dpr });
        const c = canvas.current;
        c.width = Math.floor(viewport.width);
        c.height = Math.floor(viewport.height);
        task = page.render({ canvas: c, viewport });
        await task.promise;
        if (!cancelled) setReady(true);
      } catch {
        /* cancelled or a broken page: keep the placeholder */
      }
    })();
    return () => {
      cancelled = true;
      task?.cancel();
      setReady(false);
    };
  }, [doc, n, width, active]);

  return (
    <div
      data-page={n}
      className="relative overflow-hidden bg-white shadow-[0_8px_30px_rgba(2,26,23,.12)] md:rounded-lg"
      style={{ width, height }}
    >
      {active && <canvas ref={canvas} className="pointer-events-none block size-full select-none" />}
      {!ready && (
        <div className="absolute inset-0 grid place-items-center text-sm text-b2-stone">
          {active ? <div className="skeleton size-full !rounded-none" /> : `Page ${n}`}
        </div>
      )}
    </div>
  );
}

/**
 * View-only notes:
 *  - no download / print / copy / right-click / drag / long-press; no text layer
 *  - content blacks out whenever the tab or window loses focus or Print Screen is pressed, and prints come out blank
 *  - pages render lazily, sized to the screen width (edge-to-edge on phones)
 * A website cannot stop a phone's own system screenshot; this deters everything a browser can see.
 */
export default function PdfViewer({ url, title }: { url: string; title: string }) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [ratio, setRatio] = useState(842 / 595); // A4 until the real size is known
  const [current, setCurrent] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(0);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [shield, setShield] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  // the signed URL can change if the page re-renders on the server; load the document only once per note
  const urlRef = useRef(url);
  const pages = doc?.numPages ?? 0;

  const pageWidth = Math.round(Math.min(width, MAX_WIDTH) * zoom);
  const pageHeight = Math.round(pageWidth * ratio);

  // load the PDF (only byte ranges for the visible pages first, the rest in the background)
  useEffect(() => {
    let cancelled = false;
    let loaded: PDFDocumentProxy | null = null;
    (async () => {
      try {
        const pdfjs = await loadPdfjs();
        const task = pdfjs.getDocument({ url: urlRef.current, disableStream: true, disableAutoFetch: false });
        loaded = await task.promise;
        if (cancelled) return;
        try {
          const first = await loaded.getPage(1);
          const vp = first.getViewport({ scale: 1 });
          if (!cancelled) setRatio(vp.height / vp.width);
        } catch {}
        if (!cancelled) setDoc(loaded);
      } catch (err) {
        console.error("Notes viewer", err);
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      loaded?.loadingTask.destroy().catch(() => {});
    };
  }, [attempt]);

  // container width (ignore sub-pixel jitter so pages don't keep re-rendering)
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width);
      setWidth((prev) => (Math.abs(prev - w) > 2 ? w : prev));
    });
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

  // keep the same page in view when zooming
  const zoomTo = (z: number) => {
    const keep = current;
    setZoom(z);
    requestAnimationFrame(() => document.querySelector(`[data-page="${keep}"]`)?.scrollIntoView({ block: "start" }));
  };

  const goTo = (n: number) => document.querySelector(`[data-page="${n}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });

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
        <button type="button" aria-label="Zoom out" onClick={() => zoomTo(Math.max(0.6, +(zoom - 0.2).toFixed(1)))} className="pressable grid size-10 place-items-center rounded-full hover:bg-white/5">
          <Minus size={18} />
        </button>
        <button type="button" aria-label="Fit to width" onClick={() => zoomTo(1)} className="tabular hidden h-9 min-w-12 rounded-full px-1 text-sm hover:bg-white/5 sm:block">
          {Math.round(zoom * 100)}%
        </button>
        <button type="button" aria-label="Zoom in" onClick={() => zoomTo(Math.min(2.4, +(zoom + 0.2).toFixed(1)))} className="pressable grid size-10 place-items-center rounded-full hover:bg-white/5">
          <Plus size={18} />
        </button>
        <button type="button" aria-label="Fit to width" onClick={() => zoomTo(1)} className="pressable grid size-10 place-items-center rounded-full hover:bg-white/5 sm:hidden">
          <Maximize2 size={16} />
        </button>
      </div>

      {/* pages: edge-to-edge on phones */}
      <div ref={box} className="relative -mx-4 mt-3 overflow-x-auto md:mx-0 md:mt-5">
        {failed ? (
          <div className="p-8 text-center">
            <p className="text-b2-pistachio">The notes didn&apos;t load. Check your connection and try again.</p>
            <button
              type="button"
              onClick={() => {
                setFailed(false);
                setAttempt((a) => a + 1);
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-b2-meadow px-5 py-2.5 font-medium text-b2-meadow"
            >
              <RotateCw size={16} /> Try again
            </button>
          </div>
        ) : !doc || !pageWidth ? (
          <B2Loader label="Opening notes" />
        ) : (
          <div className="flex flex-col items-center gap-3 md:gap-5">
            {Array.from({ length: pages }, (_, i) => (
              <PageCanvas
                key={i}
                doc={doc}
                n={i + 1}
                width={pageWidth}
                height={pageHeight}
                active={Math.abs(i + 1 - current) <= KEEP_AROUND}
              />
            ))}
          </div>
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

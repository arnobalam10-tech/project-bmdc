/**
 * pdf.js "legacy" build: same engine, plus polyfills for the very new JS features the modern build
 * relies on (Map.getOrInsertComputed, Math.sumPrecise, Uint8Array.fromBase64 …). Without it the
 * notes viewer crashes on most phones and older desktop browsers.
 */
let loaded: Promise<typeof import("pdfjs-dist/legacy/build/pdf.mjs")> | null = null;

export function loadPdfjs() {
  loaded ??= import("pdfjs-dist/legacy/build/pdf.mjs").then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
    return pdfjs;
  });
  return loaded;
}

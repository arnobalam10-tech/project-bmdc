"use client";

import dynamic from "next/dynamic";
import { B2Loader } from "@/components/brand/B2";

const PdfViewer = dynamic(() => import("@/components/app/PdfViewer"), {
  ssr: false,
  loading: () => <B2Loader label="Opening notes" />,
});

export default function PdfViewerLoader(props: { url: string; title: string }) {
  return <PdfViewer {...props} />;
}

"use client";

import dynamic from "next/dynamic";
import type { ScorePoint } from "@/components/app/ScoreChart";

const ScoreChart = dynamic(() => import("@/components/app/ScoreChart"), {
  ssr: false,
  loading: () => <div className="skeleton h-56 w-full sm:h-64" />,
});

export default function ScoreChartLoader({ data }: { data: ScorePoint[] }) {
  return <ScoreChart data={data} />;
}

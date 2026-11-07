"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type ScorePoint = { at: string; title: string; pct: number };

export default function ScoreChart({ data }: { data: ScorePoint[] }) {
  const rows = data.map((d, i) => ({
    n: i + 1,
    pct: d.pct,
    title: d.title,
    date: new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", day: "numeric", month: "short" }).format(new Date(d.at)),
  }));
  return (
    <div className="h-56 w-full sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 10, right: 12, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="var(--color-b2-divider)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: "var(--color-b2-pistachio)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: "var(--color-b2-pistachio)", fontSize: 12 }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip
            contentStyle={{ background: "var(--color-b2-dark)", border: "1px solid var(--color-b2-border)", borderRadius: 12, color: "var(--color-b2-flash)" }}
            labelStyle={{ color: "var(--color-b2-pistachio)" }}
            formatter={(v) => [`${v}%`, "Score"]}
            labelFormatter={(_, p) => (p?.[0]?.payload?.title as string) ?? ""}
          />
          <Line type="monotone" dataKey="pct" stroke="#00DF81" strokeWidth={2.5} dot={{ r: 4, fill: "#00DF81" }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

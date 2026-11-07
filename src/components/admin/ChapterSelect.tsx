type Ch = { id: string; name: string; subjects: { name: string } | null };

/** <select> of chapters grouped by subject. */
export function ChapterSelect({ chapters, defaultValue, name = "chapter_id" }: { chapters: Ch[]; defaultValue?: string; name?: string }) {
  const groups = new Map<string, Ch[]>();
  for (const c of chapters) groups.set(c.subjects?.name ?? "Other", [...(groups.get(c.subjects?.name ?? "Other") ?? []), c]);
  return (
    <select name={name} required defaultValue={defaultValue ?? ""} className="b2-input">
      <option value="" disabled>
        Choose a chapter…
      </option>
      {[...groups.entries()].map(([subject, cs]) => (
        <optgroup key={subject} label={subject}>
          {cs.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

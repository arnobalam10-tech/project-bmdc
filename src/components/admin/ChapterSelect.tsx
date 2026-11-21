type Ch = { id: string; name: string; subjects: { name: string } | null };

/** <select> of chapters grouped by subject. */
export function ChapterSelect({
  chapters,
  defaultValue,
  name = "chapter_id",
  noneLabel,
}: {
  chapters: Ch[];
  defaultValue?: string | null;
  name?: string;
  /** when set, offers a "no chapter" choice (value "none") with this label */
  noneLabel?: string;
}) {
  const groups = new Map<string, Ch[]>();
  for (const c of chapters) groups.set(c.subjects?.name ?? "Other", [...(groups.get(c.subjects?.name ?? "Other") ?? []), c]);
  return (
    <select name={name} required defaultValue={defaultValue ?? (noneLabel && defaultValue === null ? "none" : "")} className="b2-input">
      <option value="" disabled>
        Choose a chapter…
      </option>
      {noneLabel && <option value="none">{noneLabel}</option>}
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

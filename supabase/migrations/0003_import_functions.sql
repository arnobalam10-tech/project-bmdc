-- Owner-only import functions. Claude runs them via the Supabase MCP / SQL editor:
--   node scripts/content-to-import.mjs mcq content/mcq/<file>.json   → prints the SQL call
-- (applied remotely as 0003_import_functions + 0004_fix_import_mcq; this file is the final state)

create or replace function public.import_curriculum(p jsonb)
returns text language plpgsql security definer set search_path = public as $$
declare s jsonb; c jsonb; si int := 0; ci int; sid uuid; n int := 0;
begin
  for s in select * from jsonb_array_elements(p->'subjects') loop
    insert into public.subjects (name, slug, sort) values (s->>'name', s->>'slug', si)
      on conflict (slug) do update set name = excluded.name, sort = excluded.sort
      returning id into sid;
    ci := 0;
    for c in select * from jsonb_array_elements(s->'chapters') loop
      insert into public.chapters (subject_id, name, slug, sort, class_codes)
      values (sid, c->>'name', c->>'slug', si * 100 + ci,
              coalesce((select array_agg(x) from jsonb_array_elements_text(c->'classes') x), '{}'))
      on conflict (slug) do update set subject_id = excluded.subject_id, name = excluded.name,
        sort = excluded.sort, class_codes = excluded.class_codes;
      ci := ci + 1; n := n + 1;
    end loop;
    si := si + 1;
  end loop;
  return format('%s subjects, %s chapters', si, n);
end $$;

-- p = the content/mcq/*.json file as-is. Subject/chapter matched by NAME; unknown names raise.
create or replace function public.import_mcq(p jsonb)
returns text language plpgsql security definer set search_path = public as $$
declare st jsonb := p->'set'; qq jsonb; o jsonb; v_set uuid; v_q uuid; v_sub uuid; v_ch uuid; pos int := 0;
begin
  insert into public.question_sets (ext_id, kind, title, pyq_year, pyq_session, duration_min, sort)
  values (st->>'ext_id', st->>'kind', st->>'title', (st->>'pyq_year')::int, st->>'pyq_session',
          coalesce((st->>'duration_min')::int, jsonb_array_length(p->'questions')), -coalesce((st->>'pyq_year')::int, 0))
  on conflict (ext_id) do update set kind = excluded.kind, title = excluded.title, pyq_year = excluded.pyq_year,
    pyq_session = excluded.pyq_session, duration_min = excluded.duration_min
  returning id into v_set;

  for qq in select * from jsonb_array_elements(p->'questions') loop
    pos := pos + 1;
    v_sub := null; v_ch := null;
    select s.id, c.id into v_sub, v_ch from public.subjects s join public.chapters c on c.subject_id = s.id
     where s.name = qq->>'subject' and c.name = qq->>'chapter';
    if v_ch is null then
      raise exception '%: unknown subject/chapter "%" → "%"', qq->>'ext_id', qq->>'subject', qq->>'chapter';
    end if;
    if jsonb_array_length(qq->'options') <> 4 then raise exception '%: needs 4 options', qq->>'ext_id'; end if;

    insert into public.questions (ext_id, stem, subject_id, chapter_id, pyq_year, pyq_session, pearl)
    values (qq->>'ext_id', qq->>'stem', v_sub, v_ch, (st->>'pyq_year')::int, st->>'pyq_session', qq->>'pearl')
    on conflict (ext_id) do update set stem = excluded.stem, subject_id = excluded.subject_id,
      chapter_id = excluded.chapter_id, pyq_year = excluded.pyq_year, pyq_session = excluded.pyq_session, pearl = excluded.pearl
    returning id into v_q;

    for o in select * from jsonb_array_elements(qq->'options') loop
      insert into public.question_options (question_id, label, text, is_true, explanation)
      values (v_q, o->>'label', o->>'text', (o->>'is_true')::boolean, o->>'explanation')
      on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true,
        explanation = excluded.explanation;
    end loop;

    insert into public.question_set_items as i (set_id, question_id, position) values (v_set, v_q, pos)
    on conflict (set_id, question_id) do update set position = excluded.position;
  end loop;

  perform public.refresh_topic_sets();
  return format('%s: %s questions', st->>'ext_id', pos);
end $$;

revoke execute on function public.import_curriculum(jsonb) from public, anon, authenticated;
revoke execute on function public.import_mcq(jsonb) from public, anon, authenticated;
revoke execute on function public.refresh_topic_sets() from public, anon, authenticated;
revoke execute on function public.bump_activity(int, int) from public, anon;
revoke execute on function public.admin_overview() from anon;

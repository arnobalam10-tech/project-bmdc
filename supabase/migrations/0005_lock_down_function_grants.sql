-- Security definer functions: never callable by anon; internal helpers not callable by signed-in users either.
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.prosecdef loop
    execute format('revoke execute on function %s from public, anon', f.sig);
  end loop;
end $$;
revoke execute on function public.handle_new_user() from authenticated;
revoke execute on function public.bump_activity(int, int) from authenticated;
revoke execute on function public.refresh_topic_sets() from authenticated;
revoke execute on function public.import_mcq(jsonb) from authenticated;
revoke execute on function public.import_curriculum(jsonb) from authenticated;
alter default privileges in schema public revoke execute on functions from public, anon;

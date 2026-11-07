-- generated from content/curriculum.json
begin;
insert into public.subjects (name, slug, sort) values ('Medicine', 'medicine', 0)
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Hepatology', 'hepatology', 0, array['W1C1','W1C2']::text[] from public.subjects where slug = 'medicine'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Hematology', 'hematology', 1, array['W1C3','W2C1']::text[] from public.subjects where slug = 'medicine'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Cardiology', 'cardiology', 2, array['W2C2','W2C3']::text[] from public.subjects where slug = 'medicine'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Endocrinology', 'endocrinology', 3, array['W3C1','W3C2']::text[] from public.subjects where slug = 'medicine'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Neurology', 'neurology', 4, array['W3C3','W4C1']::text[] from public.subjects where slug = 'medicine'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Nephrology + Body Fluid', 'nephrology-body-fluid', 5, array['W4C2','W4C3']::text[] from public.subjects where slug = 'medicine'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Gastroenterology', 'gastroenterology', 6, array['W5C1']::text[] from public.subjects where slug = 'medicine'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Respiratory', 'respiratory', 7, array['W5C2','W5C3']::text[] from public.subjects where slug = 'medicine'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Dermatology, Toxicology & Psych', 'dermatology-toxicology-psych', 8, array['W6C1','W6C3']::text[] from public.subjects where slug = 'medicine'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Rheumatology', 'rheumatology', 9, array['W6C2','W6C3']::text[] from public.subjects where slug = 'medicine'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.subjects (name, slug, sort) values ('General Surgery', 'general-surgery', 1)
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Eye', 'eye', 100, array['W7C1']::text[] from public.subjects where slug = 'general-surgery'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Ear', 'ear', 101, array['W7C2']::text[] from public.subjects where slug = 'general-surgery'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Nose', 'nose', 102, array['W7C3']::text[] from public.subjects where slug = 'general-surgery'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Throat', 'throat', 103, array['W8C1']::text[] from public.subjects where slug = 'general-surgery'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Ulcers, Wounds & Soft Tissue', 'ulcers-wounds-soft-tissue', 104, array['W8C2']::text[] from public.subjects where slug = 'general-surgery'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Surgical Infections & Microbes', 'surgical-infections-microbes', 105, array['W8C3']::text[] from public.subjects where slug = 'general-surgery'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Hemorrhage, Shock & Trauma', 'hemorrhage-shock-trauma', 106, array['W9C1']::text[] from public.subjects where slug = 'general-surgery'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Perioperative Care, Sutures & Onco', 'perioperative-sutures-onco', 107, array['W9C2']::text[] from public.subjects where slug = 'general-surgery'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.subjects (name, slug, sort) values ('Specialized Surgery', 'specialized-surgery', 2)
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Upper & Lower GI Surgery', 'gi-surgery', 200, array['W9C3']::text[] from public.subjects where slug = 'specialized-surgery'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Hepatobiliary, Pancreas & Spleen', 'hepatobiliary-pancreas-spleen', 201, array['W10C1']::text[] from public.subjects where slug = 'specialized-surgery'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Urology, Andrology & Breast', 'urology-andrology-breast', 202, array['W10C2']::text[] from public.subjects where slug = 'specialized-surgery'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Orthopedics & Neurosurgery', 'orthopedics-neurosurgery', 203, array['W10C3']::text[] from public.subjects where slug = 'specialized-surgery'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.subjects (name, slug, sort) values ('Basic Sciences', 'basic-sciences', 3)
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Pathology & Genetics', 'pathology-genetics', 300, array['W11C1']::text[] from public.subjects where slug = 'basic-sciences'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Physio, Vitamins, Forensic & Comm Med', 'physio-vitamins-forensic-comm-med', 301, array['W11C2']::text[] from public.subjects where slug = 'basic-sciences'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Biochemistry', 'biochemistry', 302, array['W11C3']::text[] from public.subjects where slug = 'basic-sciences'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Pharmacology', 'pharmacology', 303, array['W12C1']::text[] from public.subjects where slug = 'basic-sciences'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Immuno & Micro', 'immuno-micro', 304, array['W12C2','W12C3']::text[] from public.subjects where slug = 'basic-sciences'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.subjects (name, slug, sort) values ('Pediatrics', 'pediatrics', 4)
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Growth, Development & Neonatology', 'growth-development-neonatology', 400, array['W13C1']::text[] from public.subjects where slug = 'pediatrics'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'IMCI, Critical Care & Emergencies', 'imci-critical-care-emergencies', 401, array['W13C2']::text[] from public.subjects where slug = 'pediatrics'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Gastroenterology, Fluids & Pulmonology', 'peds-gastro-fluids-pulmonology', 402, array['W13C3']::text[] from public.subjects where slug = 'pediatrics'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Peds Neuro, Hem-Onc & Infections', 'peds-neuro-hemonc-infections', 403, array['W14C1']::text[] from public.subjects where slug = 'pediatrics'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.subjects (name, slug, sort) values ('Gynecology', 'gynecology', 5)
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Reproductive Anatomy & Physiology', 'reproductive-anatomy-physiology', 500, array['W14C2']::text[] from public.subjects where slug = 'gynecology'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'AUB, Ectopic Pregnancy & GTD', 'aub-ectopic-gtd', 501, array['W14C3']::text[] from public.subjects where slug = 'gynecology'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Abortion, Infections & PID', 'abortion-infections-pid', 502, array['W15C1']::text[] from public.subjects where slug = 'gynecology'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Endometriosis, Contraception & Gyn Op', 'endometriosis-contraception-gyn-op', 503, array['W15C2']::text[] from public.subjects where slug = 'gynecology'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.subjects (name, slug, sort) values ('Obstetrics', 'obstetrics', 6)
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Placenta, Diagnosis & ANC', 'placenta-diagnosis-anc', 600, array['W15C3']::text[] from public.subjects where slug = 'obstetrics'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Normal Labour, Episiotomy & Induction', 'normal-labour-episiotomy-induction', 601, array['W16C1']::text[] from public.subjects where slug = 'obstetrics'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'Preterm Labour, PROM & Hypertension', 'preterm-prom-hypertension', 602, array['W16C2']::text[] from public.subjects where slug = 'obstetrics'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, 'APH, PPH, Obstructed & Operative Obs', 'aph-pph-obstructed-operative', 603, array['W16C3']::text[] from public.subjects where slug = 'obstetrics'
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;
commit;

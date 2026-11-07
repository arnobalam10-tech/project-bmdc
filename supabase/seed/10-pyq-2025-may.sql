-- generated from content/mcq/pyq-2025-may.json
begin;
insert into public.question_sets (ext_id, kind, title, pyq_year, pyq_session, duration_min, sort)
  values ('pyq-2025-may', 'pyq', 'BMDC RQE — May 2025', 2025, 'May', 10, -2025)
  on conflict (ext_id) do update set title = excluded.title, kind = excluded.kind, pyq_year = excluded.pyq_year,
    pyq_session = excluded.pyq_session, duration_min = excluded.duration_min;
insert into public.questions (ext_id, stem, subject_id, chapter_id, pyq_year, pyq_session, pearl)
  select 'pyq-2025-may-001', 'Antigen-presenting cells (APCs) include:', s.id, c.id, 2025, 'May', 'The 3 professional APCs: dendritic cells (the most potent), macrophages and B cells.'
    from public.subjects s join public.chapters c on c.subject_id = s.id
   where s.slug = 'basic-sciences' and c.slug = 'immuno-micro'
  on conflict (ext_id) do update set stem = excluded.stem, subject_id = excluded.subject_id, chapter_id = excluded.chapter_id,
    pyq_year = excluded.pyq_year, pyq_session = excluded.pyq_session, pearl = excluded.pearl;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'A', 'Macrophage', true, 'Macrophages are professional APCs. They phagocytose antigen and present it on MHC class II to CD4+ T cells.' from public.questions where ext_id = 'pyq-2025-may-001'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'B', 'T cell', false, 'T cells recognise antigen that other cells present. They are not professional APCs.' from public.questions where ext_id = 'pyq-2025-may-001'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'C', 'B cell', true, 'B cells are professional APCs. They take up antigen through the B-cell receptor and present it on MHC II to helper T cells.' from public.questions where ext_id = 'pyq-2025-may-001'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'D', 'NK cell', false, 'NK cells are innate killer lymphocytes. They kill cells that lack MHC I and do not present antigen.' from public.questions where ext_id = 'pyq-2025-may-001'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_set_items (set_id, question_id, position)
  select s.id, qn.id, 1 from public.question_sets s, public.questions qn
   where s.ext_id = 'pyq-2025-may' and qn.ext_id = 'pyq-2025-may-001'
  on conflict (set_id, question_id) do update set position = excluded.position;
insert into public.questions (ext_id, stem, subject_id, chapter_id, pyq_year, pyq_session, pearl)
  select 'pyq-2025-may-003', 'Findings in ''some dehydration'' (IMCI):', s.id, c.id, 2025, 'May', 'Some dehydration = 2 of: restless/irritable, sunken eyes, drinks eagerly, skin pinch goes back slowly. Treat with Plan B (ORS 75 ml/kg over 4 hours).'
    from public.subjects s join public.chapters c on c.subject_id = s.id
   where s.slug = 'pediatrics' and c.slug = 'imci-critical-care-emergencies'
  on conflict (ext_id) do update set stem = excluded.stem, subject_id = excluded.subject_id, chapter_id = excluded.chapter_id,
    pyq_year = excluded.pyq_year, pyq_session = excluded.pyq_session, pearl = excluded.pearl;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'A', 'Sunken eyes', true, 'Sunken eyes are one of the IMCI signs. Two of the signs together classify as some dehydration.' from public.questions where ext_id = 'pyq-2025-may-003'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'B', 'Skin pinch goes back very slowly', false, '''Very slowly'' (more than 2 seconds) is a sign of severe dehydration. In some dehydration the skin pinch goes back slowly.' from public.questions where ext_id = 'pyq-2025-may-003'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'C', 'Thirsty, drinks eagerly', true, 'Drinking eagerly / thirsty is a sign of some dehydration. In severe dehydration the child drinks poorly or is unable to drink.' from public.questions where ext_id = 'pyq-2025-may-003'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'D', 'Unconscious', false, 'A lethargic or unconscious child falls under severe dehydration. In some dehydration the child is restless and irritable.' from public.questions where ext_id = 'pyq-2025-may-003'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_set_items (set_id, question_id, position)
  select s.id, qn.id, 2 from public.question_sets s, public.questions qn
   where s.ext_id = 'pyq-2025-may' and qn.ext_id = 'pyq-2025-may-003'
  on conflict (set_id, question_id) do update set position = excluded.position;
insert into public.questions (ext_id, stem, subject_id, chapter_id, pyq_year, pyq_session, pearl)
  select 'pyq-2025-may-004', 'Characteristics of tuberculous meningitis:', s.id, c.id, 2025, 'May', 'TB CSF: clear/cobweb, lymphocytes, ↑↑ protein, ↓ glucose, ADA raised. Viral CSF has normal glucose.'
    from public.subjects s join public.chapters c on c.subject_id = s.id
   where s.slug = 'medicine' and c.slug = 'neurology'
  on conflict (ext_id) do update set stem = excluded.stem, subject_id = excluded.subject_id, chapter_id = excluded.chapter_id,
    pyq_year = excluded.pyq_year, pyq_session = excluded.pyq_session, pearl = excluded.pearl;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'A', 'Cobweb coagulum in CSF', true, 'A fine cobweb (pellicle) clot forms when TB CSF is left standing, because of its high protein (fibrinogen).' from public.questions where ext_id = 'pyq-2025-may-004'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'B', 'Increased CSF pressure', true, 'Opening pressure is raised, often because of basal exudates causing communicating hydrocephalus.' from public.questions where ext_id = 'pyq-2025-may-004'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'C', 'Decreased CSF protein', false, 'Protein is markedly raised (often 1–5 g/L), and very high in spinal block.' from public.questions where ext_id = 'pyq-2025-may-004'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'D', 'Increased CSF glucose', false, 'Glucose is low (CSF:blood ratio below 0.5), as in bacterial meningitis.' from public.questions where ext_id = 'pyq-2025-may-004'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_set_items (set_id, question_id, position)
  select s.id, qn.id, 3 from public.question_sets s, public.questions qn
   where s.ext_id = 'pyq-2025-may' and qn.ext_id = 'pyq-2025-may-004'
  on conflict (set_id, question_id) do update set position = excluded.position;
insert into public.questions (ext_id, stem, subject_id, chapter_id, pyq_year, pyq_session, pearl)
  select 'pyq-2025-may-005', 'Colles'' fracture:', s.id, c.id, 2025, 'May', 'Colles complications: malunion (most common), stiffness, Sudeck''s atrophy, carpal tunnel syndrome, delayed rupture of extensor pollicis longus.'
    from public.subjects s join public.chapters c on c.subject_id = s.id
   where s.slug = 'specialized-surgery' and c.slug = 'orthopedics-neurosurgery'
  on conflict (ext_id) do update set stem = excluded.stem, subject_id = excluded.subject_id, chapter_id = excluded.chapter_id,
    pyq_year = excluded.pyq_year, pyq_session = excluded.pyq_session, pearl = excluded.pearl;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'A', 'Common in younger age', false, 'It typically occurs in elderly, post-menopausal (osteoporotic) women after a fall on the outstretched hand. Young adults get high-energy distal radius fractures instead.' from public.questions where ext_id = 'pyq-2025-may-005'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'B', 'Dinner-fork deformity', true, 'Dorsal displacement of the distal fragment gives the classic dinner-fork deformity on lateral view.' from public.questions where ext_id = 'pyq-2025-may-005'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'C', 'Dorsal angulation', true, 'The distal radius fragment is dorsally angulated/tilted, radially deviated and impacted, within 2.5 cm of the wrist.' from public.questions where ext_id = 'pyq-2025-may-005'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'D', 'Sudeck''s atrophy', true, 'Sudeck''s atrophy (complex regional pain syndrome) is a recognised late complication of Colles'' fracture.' from public.questions where ext_id = 'pyq-2025-may-005'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_set_items (set_id, question_id, position)
  select s.id, qn.id, 4 from public.question_sets s, public.questions qn
   where s.ext_id = 'pyq-2025-may' and qn.ext_id = 'pyq-2025-may-005'
  on conflict (set_id, question_id) do update set position = excluded.position;
insert into public.questions (ext_id, stem, subject_id, chapter_id, pyq_year, pyq_session, pearl)
  select 'pyq-2025-may-008', 'Uses of the partograph:', s.id, c.id, 2025, 'May', 'WHO partograph starts in the active phase (cervix 4 cm). Action line is 4 hours to the right of the alert line.'
    from public.subjects s join public.chapters c on c.subject_id = s.id
   where s.slug = 'obstetrics' and c.slug = 'normal-labour-episiotomy-induction'
  on conflict (ext_id) do update set stem = excluded.stem, subject_id = excluded.subject_id, chapter_id = excluded.chapter_id,
    pyq_year = excluded.pyq_year, pyq_session = excluded.pyq_session, pearl = excluded.pearl;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'A', 'Recording cervical dilatation', true, 'Cervical dilatation is plotted against time with the alert and action lines. It is the core of the partograph.' from public.questions where ext_id = 'pyq-2025-may-008'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'B', 'Monitoring fetal heart rate', true, 'Fetal condition (FHR, liquor, moulding) is charted, usually every 30 minutes.' from public.questions where ext_id = 'pyq-2025-may-008'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'C', 'Monitoring uterine contractions', true, 'Frequency and duration of contractions per 10 minutes are recorded.' from public.questions where ext_id = 'pyq-2025-may-008'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'D', 'Early detection of obstructed labour', true, 'Crossing the alert/action line shows prolonged labour early, which helps prevent obstructed labour.' from public.questions where ext_id = 'pyq-2025-may-008'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_set_items (set_id, question_id, position)
  select s.id, qn.id, 5 from public.question_sets s, public.questions qn
   where s.ext_id = 'pyq-2025-may' and qn.ext_id = 'pyq-2025-may-008'
  on conflict (set_id, question_id) do update set position = excluded.position;
insert into public.questions (ext_id, stem, subject_id, chapter_id, pyq_year, pyq_session, pearl)
  select 'pyq-2025-may-009', 'Exudative ascites is found in:', s.id, c.id, 2025, 'May', 'Exudate (protein > 25 g/L): malignancy, TB, pancreatitis. Transudate: cirrhosis, CCF, nephrotic syndrome. SAAG ≥ 1.1 g/dL means portal hypertension.'
    from public.subjects s join public.chapters c on c.subject_id = s.id
   where s.slug = 'medicine' and c.slug = 'hepatology'
  on conflict (ext_id) do update set stem = excluded.stem, subject_id = excluded.subject_id, chapter_id = excluded.chapter_id,
    pyq_year = excluded.pyq_year, pyq_session = excluded.pyq_session, pearl = excluded.pearl;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'A', 'Chronic liver disease', false, 'Cirrhosis causes a transudate (low protein, SAAG ≥ 1.1 g/dL) from portal hypertension and hypoalbuminaemia.' from public.questions where ext_id = 'pyq-2025-may-009'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'B', 'Congestive cardiac failure', false, 'Classically a transudate (high SAAG). Protein may be mildly raised, but for exams count CCF as transudative.' from public.questions where ext_id = 'pyq-2025-may-009'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'C', 'Malignancy', true, 'Peritoneal carcinomatosis gives a protein-rich exudate, often blood-stained, with malignant cells.' from public.questions where ext_id = 'pyq-2025-may-009'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'D', 'Tuberculosis', true, 'TB peritonitis gives an exudate: high protein, lymphocytes and raised ADA.' from public.questions where ext_id = 'pyq-2025-may-009'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_set_items (set_id, question_id, position)
  select s.id, qn.id, 6 from public.question_sets s, public.questions qn
   where s.ext_id = 'pyq-2025-may' and qn.ext_id = 'pyq-2025-may-009'
  on conflict (set_id, question_id) do update set position = excluded.position;
insert into public.questions (ext_id, stem, subject_id, chapter_id, pyq_year, pyq_session, pearl)
  select 'pyq-2025-may-013', 'Complications of chronic otitis media:', s.id, c.id, 2025, 'May', 'Intracranial complications of CSOM: meningitis (most common), brain abscess (temporal lobe / cerebellum), lateral sinus thrombosis, extradural abscess.'
    from public.subjects s join public.chapters c on c.subject_id = s.id
   where s.slug = 'general-surgery' and c.slug = 'ear'
  on conflict (ext_id) do update set stem = excluded.stem, subject_id = excluded.subject_id, chapter_id = excluded.chapter_id,
    pyq_year = excluded.pyq_year, pyq_session = excluded.pyq_session, pearl = excluded.pearl;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'A', 'Facial nerve palsy', true, 'Cholesteatoma can erode the fallopian canal and cause lower motor neuron facial palsy (an intratemporal complication).' from public.questions where ext_id = 'pyq-2025-may-013'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'B', 'Cholesteatoma formation', true, 'Attico-antral (unsafe) CSOM is associated with cholesteatoma, which erodes bone.' from public.questions where ext_id = 'pyq-2025-may-013'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'C', 'Sensorineural hearing loss', true, 'Toxins spreading through the round window, or labyrinthitis/fistula, can cause SNHL on top of the conductive loss.' from public.questions where ext_id = 'pyq-2025-may-013'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'D', 'Cerebral venous sinus thrombosis', true, 'Lateral (sigmoid) sinus thrombosis is a classic intracranial complication of unsafe CSOM.' from public.questions where ext_id = 'pyq-2025-may-013'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_set_items (set_id, question_id, position)
  select s.id, qn.id, 7 from public.question_sets s, public.questions qn
   where s.ext_id = 'pyq-2025-may' and qn.ext_id = 'pyq-2025-may-013'
  on conflict (set_id, question_id) do update set position = excluded.position;
insert into public.questions (ext_id, stem, subject_id, chapter_id, pyq_year, pyq_session, pearl)
  select 'pyq-2025-may-014', 'Drugs causing gynaecomastia:', s.id, c.id, 2025, 'May', 'Mnemonic ''DISCO'': Digoxin, Isoniazid, Spironolactone, Cimetidine, Oestrogens. Add ketoconazole, GnRH analogues and finasteride.'
    from public.subjects s join public.chapters c on c.subject_id = s.id
   where s.slug = 'basic-sciences' and c.slug = 'pharmacology'
  on conflict (ext_id) do update set stem = excluded.stem, subject_id = excluded.subject_id, chapter_id = excluded.chapter_id,
    pyq_year = excluded.pyq_year, pyq_session = excluded.pyq_session, pearl = excluded.pearl;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'A', 'Isoniazid', true, 'Isoniazid is a recognised (less common) cause of gynaecomastia.' from public.questions where ext_id = 'pyq-2025-may-014'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'B', 'Digoxin', true, 'Digoxin has an oestrogen-like structure and can cause gynaecomastia.' from public.questions where ext_id = 'pyq-2025-may-014'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'C', 'Spironolactone', true, 'Spironolactone is the classic cause: it blocks androgen receptors and testosterone synthesis. Eplerenone avoids it.' from public.questions where ext_id = 'pyq-2025-may-014'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'D', 'Propranolol', false, 'Beta-blockers are not associated with gynaecomastia.' from public.questions where ext_id = 'pyq-2025-may-014'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_set_items (set_id, question_id, position)
  select s.id, qn.id, 8 from public.question_sets s, public.questions qn
   where s.ext_id = 'pyq-2025-may' and qn.ext_id = 'pyq-2025-may-014'
  on conflict (set_id, question_id) do update set position = excluded.position;
insert into public.questions (ext_id, stem, subject_id, chapter_id, pyq_year, pyq_session, pearl)
  select 'pyq-2025-may-016', 'Secondary hyperthyroidism:', s.id, c.id, 2025, 'May', 'Primary hyperthyroidism: ↑T3/T4, ↓TSH. Secondary: ↑T3/T4 with ↑ or normal TSH.'
    from public.subjects s join public.chapters c on c.subject_id = s.id
   where s.slug = 'medicine' and c.slug = 'endocrinology'
  on conflict (ext_id) do update set stem = excluded.stem, subject_id = excluded.subject_id, chapter_id = excluded.chapter_id,
    pyq_year = excluded.pyq_year, pyq_session = excluded.pyq_session, pearl = excluded.pearl;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'A', 'Increased T3', true, 'Excess TSH drives the thyroid, so T3 rises.' from public.questions where ext_id = 'pyq-2025-may-016'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'B', 'Increased T4', true, 'T4 also rises because of TSH stimulation.' from public.questions where ext_id = 'pyq-2025-may-016'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'C', 'Increased TSH', true, 'The cause is a TSH-secreting pituitary adenoma, so TSH is high or inappropriately normal along with high T3/T4.' from public.questions where ext_id = 'pyq-2025-may-016'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'D', 'Pathology lies in the thyroid gland', false, 'The pathology is in the pituitary. Disease of the thyroid gland itself (Graves'', toxic nodule) is primary hyperthyroidism, with suppressed TSH.' from public.questions where ext_id = 'pyq-2025-may-016'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_set_items (set_id, question_id, position)
  select s.id, qn.id, 9 from public.question_sets s, public.questions qn
   where s.ext_id = 'pyq-2025-may' and qn.ext_id = 'pyq-2025-may-016'
  on conflict (set_id, question_id) do update set position = excluded.position;
insert into public.questions (ext_id, stem, subject_id, chapter_id, pyq_year, pyq_session, pearl)
  select 'pyq-2025-may-022', 'Irreversible cell injury:', s.id, c.id, 2025, 'May', 'Hallmarks of irreversibility: inability to reverse mitochondrial dysfunction and severe membrane damage. Reversible signs: cell swelling and fatty change.'
    from public.subjects s join public.chapters c on c.subject_id = s.id
   where s.slug = 'basic-sciences' and c.slug = 'pathology-genetics'
  on conflict (ext_id) do update set stem = excluded.stem, subject_id = excluded.subject_id, chapter_id = excluded.chapter_id,
    pyq_year = excluded.pyq_year, pyq_session = excluded.pyq_session, pearl = excluded.pearl;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'A', 'Apoptosis', true, 'Apoptosis is programmed cell death. Once it starts, the cell is lost, so it is an end point of irreversible injury.' from public.questions where ext_id = 'pyq-2025-may-022'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'B', 'Necrosis', true, 'Necrosis is the classic result of irreversible injury: membrane damage, nuclear changes (pyknosis, karyorrhexis, karyolysis) and inflammation.' from public.questions where ext_id = 'pyq-2025-may-022'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'C', 'Metaplasia', false, 'Metaplasia is a reversible adaptation in which one adult cell type is replaced by another (e.g. Barrett''s oesophagus).' from public.questions where ext_id = 'pyq-2025-may-022'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, 'D', 'Hyperplasia', false, 'Hyperplasia is a reversible adaptation: an increase in cell number.' from public.questions where ext_id = 'pyq-2025-may-022'
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;
insert into public.question_set_items (set_id, question_id, position)
  select s.id, qn.id, 10 from public.question_sets s, public.questions qn
   where s.ext_id = 'pyq-2025-may' and qn.ext_id = 'pyq-2025-may-022'
  on conflict (set_id, question_id) do update set position = excluded.position;
select public.refresh_topic_sets();
commit;

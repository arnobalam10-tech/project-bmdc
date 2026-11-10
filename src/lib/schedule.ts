/** The 48-class course schedule (from "Project BMDC — Curriculum & Schedule", Nov 2026). 3 classes a week. */
export const CLASS_SCHEDULE: { subject: string; topics: string[] }[] = [
  {
    subject: "Medicine",
    topics: [
      "Hepatology (Part 1)",
      "Hepatology (Part 2)",
      "Hematology (Part 1)",
      "Hematology (Part 2)",
      "Cardiology (Part 1)",
      "Cardiology (Part 2)",
      "Endocrinology (Part 1)",
      "Endocrinology (Part 2)",
      "Neurology (Part 1)",
      "Neurology (Part 2)",
      "Nephrology + Body Fluid (Part 1)",
      "Nephrology + Body Fluid (Part 2)",
      "Gastroenterology",
      "Respiratory (Part 1)",
      "Respiratory (Part 2)",
      "Dermatology",
      "Rheumatology",
      "Toxicology & Psychiatry",
    ],
  },
  {
    subject: "General Surgery",
    topics: [
      "Eye",
      "Ear",
      "Nose",
      "Throat",
      "Ulcers, Wounds & Soft Tissue",
      "Surgical Infections & Microbes",
      "Hemorrhage, Shock & Trauma",
      "Perioperative Care, Sutures & Onco",
    ],
  },
  {
    subject: "Systemic Surgery",
    topics: ["Upper & Lower GI, HPB, Pancreas & Spleen", "Urology, Andrology & Breast", "Orthopedics & Neurosurgery"],
  },
  {
    subject: "Basic Sciences",
    topics: [
      "Pathology & Genetics (Part 1)",
      "Pathology & Genetics (Part 2)",
      "Biochemistry, Vitamins, Forensic & Comm Med",
      "Pharmacology (Part 1)",
      "Pharmacology (Part 2)",
      "Immuno & Micro (Part 1)",
      "Immuno & Micro (Part 2)",
    ],
  },
  {
    subject: "Pediatrics",
    topics: [
      "Growth, Development & Neonatology",
      "IMCI, Critical Care & Emergencies",
      "Gastroenterology, Fluids & Pulmonology",
      "Peds Neuro, Hem-Onc & Infections",
    ],
  },
  {
    subject: "Gynecology",
    topics: [
      "Pelvic Anatomy, Physiology & Menstrual Bleeding Disorders",
      "Early Pregnancy Complications & Gestational Pathology",
      "Pelvic Infections, Inflammatory Conditions & Benign Masses",
      "Genital Tract Malignancies, Contraception & Operative Gynecology",
    ],
  },
  {
    subject: "Obstetrics",
    topics: [
      "Fetal Development & Antenatal Care",
      "Normal Labor & Puerperium",
      "Labor Complications & Operative Delivery",
      "Hypertensive Disorders & Hemorrhages",
    ],
  },
];

/** Same data numbered: class 1–48, week = 3 classes a week. */
export function numberedSchedule() {
  let n = 0;
  return CLASS_SCHEDULE.map((g) => ({
    subject: g.subject,
    classes: g.topics.map((topic) => {
      n += 1;
      return { n, week: Math.ceil(n / 3), topic };
    }),
  }));
}

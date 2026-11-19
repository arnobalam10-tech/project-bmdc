import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/access";
import { BackLink } from "@/components/app/BackLink";
import { EmptyState, PageHeader } from "@/components/ui/primitives";
import { btn } from "@/components/ui/Button";
import { MistakeRunner, type MistakeQuestion } from "@/components/mcq/MistakeRunner";

export const metadata: Metadata = { title: "My mistakes" };

export default async function MistakesPage() {
  const { supabase } = await requireUser();
  const { data } = await supabase.rpc("get_mistakes");
  const questions = (data ?? []) as MistakeQuestion[];

  return (
    <div>
      <BackLink href="/dashboard" label="Home" />
      <PageHeader
        title="My mistakes"
        sub="Every question you get wrong in practice or an exam lands here. Get all four statements right and it's cleared."
      />
      {questions.length === 0 ? (
        <EmptyState
          title="No mistakes to fix 🎉"
          sub="Questions you get wrong in practice or exams will show up here so you can try them again."
          action={
            <Link href="/mcq" className={btn("primary", "md")}>
              Practise MCQs
            </Link>
          }
        />
      ) : (
        <MistakeRunner questions={questions} />
      )}
    </div>
  );
}

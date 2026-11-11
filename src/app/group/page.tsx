import type { Metadata } from "next";
import { GroupRedirect } from "./redirect";

export const metadata: Metadata = {
  title: "Join our WhatsApp group",
  description: "Free Project BMDC WhatsApp group for BMDC RQE preparation: updates, tips and the April 2027 batch.",
  robots: { index: false },
};

/** /group: records the join tap with the Meta pixel, then opens the WhatsApp group. */
export default function GroupPage() {
  return <GroupRedirect />;
}

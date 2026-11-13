import Link from "next/link";
import { PageHeader } from "../../components/ui";

export const metadata = {
  title: "Privacy Notice",
  description: "What donor information BloodLink ColdChain stores, why, who can see it, and how to have it removed.",
};

const SECTIONS = [
  {
    title: "What We Collect",
    body: (
      <>
        <p>When you register as a donor, we store:</p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <li>your full name;</li>
          <li>your WhatsApp phone number;</li>
          <li>your blood group;</li>
          <li>your state and, if you choose to give it, your local government area.</li>
        </ul>
        <p className="mt-3">
          We do not collect your address, date of birth, medical history or payment details. Hospital stock figures
          and power-cut logs are entered by hospital staff and contain no patient information.
        </p>
      </>
    ),
  },
  {
    title: "Why We Collect It",
    body: (
      <p>
        Only so that a hospital in your state can contact you on WhatsApp when it is short of your blood group. We do
        not sell your details, use them for advertising, or share them with anyone outside this purpose.
      </p>
    ),
  },
  {
    title: "Who Can See It",
    body: (
      <p>
        Hospital staff using the Donor Registry can see your name, blood group and area, and can open a WhatsApp chat
        with you. During this pilot the registry is not yet behind a staff sign-in; restricting it to authorised
        hospital staff is a priority before wider launch.
      </p>
    ),
  },
  {
    title: "How Long We Keep It",
    body: <p>Until you ask us to remove it, or until the project ends, whichever comes first.</p>,
  },
  {
    title: "Your Choices",
    body: (
      <p>
        You can ask us at any time to see, correct or delete your details, or to stop WhatsApp contact. Send your
        request through the{" "}
        <Link href="/about#contact" className="font-medium text-blood underline underline-offset-2">
          contact details on our About page
        </Link>{" "}
        and we will act on it promptly. If a hospital messages you, you are never obliged to donate.
      </p>
    ),
  },
  {
    title: "Data Protection",
    body: (
      <p>
        We aim to handle personal data in line with the Nigeria Data Protection Act 2023: collecting only what is
        needed, using it only for the purpose above, and keeping it secure. Data is stored with our hosting provider,
        Supabase.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Your Data" title="Privacy Notice">
        Plain language, no small print. This notice explains what BloodLink ColdChain stores about donors, and why.
      </PageHeader>

      <div className="page py-12 md:py-16">
        <div className="mx-auto max-w-3xl space-y-5">
          {SECTIONS.map(({ title, body }, i) => (
            <section key={title} className="card p-6 sm:p-8">
              <h2 className="flex items-baseline gap-3 text-2xl font-semibold">
                <span className="font-body text-sm font-semibold text-blood">{String(i + 1).padStart(2, "0")}</span>
                {title}
              </h2>
              <div className="mt-3 leading-relaxed text-muted">{body}</div>
            </section>
          ))}
          <p className="pt-2 text-sm text-muted">Last updated November 2026.</p>
        </div>
      </div>
    </>
  );
}

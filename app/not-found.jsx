import Link from "next/link";
import { DropIcon } from "../components/Icons";

export const metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <section className="page flex flex-col items-center py-24 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blood-bg text-blood">
        <DropIcon className="h-7 w-7" />
      </span>
      <h1 className="mt-6 text-4xl font-semibold">Page Not Found</h1>
      <p className="mt-3 max-w-md text-muted">The page you are looking for does not exist or has moved.</p>
      <Link href="/" className="btn-primary mt-8">
        Back to the Live Board
      </Link>
    </section>
  );
}

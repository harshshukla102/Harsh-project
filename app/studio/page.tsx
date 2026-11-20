import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import StudioWorkbench from "@/components/studio/workbench";
import { Button } from "@/components/ui/button";
import { listUserGenerationSummaries } from "@/db/generations";
import { getSessionUser } from "@/lib/auth";
import { UserDropdown } from "@/components/UserDropdown";

async function StudioPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login?redirect=/studio");
  }

  const initialHistory = await listUserGenerationSummaries(user.userId);

  return (
    <main className="studio-shell min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="relative mr-2 flex h-10 w-10 shrink-0 items-center justify-center overflow-visible">
              <Image
                src="/logo.png"
                alt="Luma Studio"
                width={72}
                height={72}
                className="mt-2 mr-2 max-h-none max-w-none origin-left scale-[1.55] object-cover"
                priority
              />
            </span>

            <p className="text-3xl font-mono text-primary uppercase font-semibold tracking-wide sm:text-[2.15rem]">
              Luma Studio
            </p>
          </Link>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <Button
              variant="outline"
              type="button"
              tabIndex={-1}
              className="studio-pill-strong pointer-events-none rounded-full px-4 py-2 text-sm"
            >
              Studio
            </Button>

            <UserDropdown user={user} />
          </div>
        </header>

        <StudioWorkbench
          userId={user.userId}
          initialHistory={initialHistory}
        />
      </div>
    </main>
  );
}

export default StudioPage;

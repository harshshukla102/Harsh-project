import Link from "next/link";
import Image from "next/image";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8 text-foreground">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-visible">
              <Image
                src="/logo.png"
                alt="Luma Studio"
                width={72}
                height={72}
                className="h-9 w-9 origin-left scale-[1.55] object-cover"
                priority
              />
            </span>
            <span className="text-xl font-mono font-semibold uppercase tracking-wide text-primary">
              Luma Studio
            </span>
          </Link>

          <Button variant="outline" size="sm" asChild className="rounded-full gap-2">
            <Link href="/">
              <ArrowLeftIcon className="size-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="rounded-[2rem] border border-border/70 bg-card/60 p-8 sm:p-12 backdrop-blur-xl space-y-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: November 2026
          </p>

          <div className="space-y-6 text-muted-foreground leading-relaxed text-sm sm:text-base">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">1. Commitment to Privacy</h2>
              <p>
                At Luma Studio, we value your privacy. We believe your creative assets and personal
                data belong to you. We do not sell your data or use your private photos to train public models.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">2. Information We Collect</h2>
              <p>
                When you create an account, we collect your name and email address to authenticate your session.
                When you upload an image for style transformation, it is temporarily processed to produce the requested restyle.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">3. Security & Storage</h2>
              <p>
                Your authentication tokens are signed with cryptographic JWT algorithms and stored in secure,
                HTTP-only cookies. Passwords are salted and hashed using industry-standard bcrypt before saving to the database.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">4. Contact Us</h2>
              <p>
                If you have questions about your account or data privacy, you can reach out via our GitHub repository or support channels.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

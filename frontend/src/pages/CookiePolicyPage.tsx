import { Cookie } from "lucide-react";

export function CookiePolicyPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-full text-primary">
          <Cookie className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">
          Cookie Policy
        </h1>
      </div>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Cookies and similar technologies
          </h2>
          <p>
            Like most online services, we and our partners use cookies and
            similar technologies to provide and personalize the Service, analyse
            use, and prevent fraud. You can disable cookies in your browser
            settings, but some parts of the Service may then not function
            properly.
          </p>
        </section>

        <p className="text-sm mt-12 bg-muted p-4 rounded-lg border border-border">
          Last updated: April 2, 2026
        </p>
      </div>
    </div>
  );
}

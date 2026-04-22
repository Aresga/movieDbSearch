import { Scale } from "lucide-react";

export function TermsOfServicePage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-full text-primary">
          <Scale className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
      </div>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <p>
          These Terms of Service govern your use of MovieSearchDB. By accessing
          or using the service, you agree to these terms. If you do not agree,
          do not use the platform.
        </p>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Eligibility and Accounts</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You must provide accurate account details and keep them up to date.</li>
            <li>You are responsible for all activity under your account credentials.</li>
            <li>You must keep your password and 2FA methods secure where enabled.</li>
            <li>You may not create accounts for fraud, abuse, harassment, or impersonation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Permitted Use</h2>
          <p>MovieSearchDB is intended for lawful personal use and community interaction around movies.</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>You may browse movie data, create lists, write reviews, and interact with other users.</li>
            <li>You must comply with applicable laws and third-party rights.</li>
            <li>You may not reverse engineer, disrupt, overload, or attempt unauthorized access to the service.</li>
            <li>You may not automate scraping or bulk extraction of data without prior written permission.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">User Content and Conduct</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You retain ownership of content you submit, including reviews and profile text.</li>
            <li>
              You grant MovieSearchDB a non-exclusive license to host, store, display, and process your content
              as needed to operate and improve product features.
            </li>
            <li>Content that is illegal, defamatory, abusive, hateful, or infringes intellectual property is prohibited.</li>
            <li>We may remove content or restrict accounts that violate these terms or create safety/security risks.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Services and Data</h2>
          <p>
            Some functionality relies on third-party providers, including TMDB for movie metadata and optional OAuth
            login providers such as Google or GitHub. Their terms and policies may apply to your use of those features.
          </p>
          <p className="mt-2">
            Movie metadata, images, trailers, and related media may be subject to third-party licenses and availability.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Account Suspension and Termination</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You can stop using the service at any time and request account deletion through available account flows.</li>
            <li>We may suspend or terminate access for serious or repeated violations of these terms.</li>
            <li>We may also take action where required for security, legal compliance, or abuse prevention.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Disclaimers</h2>
          <p>
            The service is provided on an "as is" and "as available" basis. We strive for reliable operation but do not
            guarantee uninterrupted availability, complete accuracy of third-party data, or error-free operation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, MovieSearchDB and its operators are not liable for indirect,
            incidental, special, consequential, or punitive damages arising from your use of the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to These Terms</h2>
          <p>
            We may update these terms to reflect product, legal, or operational changes. Material updates will be posted
            on this page with a revised effective date.
          </p>
        </section>

        <p className="text-sm mt-12 bg-muted p-4 rounded-lg border border-border">Last updated: April 21, 2026</p>
      </div>
    </div>
  );
}

import { Shield } from "lucide-react";

export function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-full text-primary">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">
          Privacy Policy
        </h1>
      </div>

      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <p>
          This Privacy Policy describes what data MovieSearchDB collects, how we
          use it, how long we keep it, and what controls you have. This version
          is written to reflect the current product behavior and code paths.
        </p>
        <p>
          The policy applies when you use MovieSearchDB web features including
          authentication, social features, reviews, watched/wishlist tracking,
          search, recommendations, and messaging.
        </p>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Data We Collect
          </h2>
          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
            Data you provide directly
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Account data: email address, username, and password (if using local login).</li>
            <li>OAuth account data from Google or GitHub login (provider identifier, email, profile name, avatar URL if provided).</li>
            <li>Profile data: avatar image and biography.</li>
            <li>Social and content data: friends, reviews, ratings, optional review text, watched/wishlist actions.</li>
            <li>Messages you send in chats (message content and timestamps).</li>
          </ul>
          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
            Data generated while using the service
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Authentication/session data: hashed refresh token and refresh token expiry.</li>
            <li>User search actions used for recommendation/search features (search query text and vector embedding linked to your user id).</li>
            <li>Operational metrics for API performance and stability (route, method, status code, duration).</li>
            <li>Client-side preference data (for example sidebar state cookie and recent emoji local storage values).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Why We Process Your Data
          </h2>
          <p>We process personal data to provide core product functionality:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Create and secure user accounts (including 2FA where enabled).</li>
            <li>Maintain login sessions with secure authentication cookies.</li>
            <li>Provide social features, chat, reviews, watched list, and wishlist actions.</li>
            <li>Run semantic search, recommendations, and optional sentiment analysis for reviews.</li>
            <li>Send account-related transactional emails (account creation, export confirmation, deletion confirmation).</li>
            <li>Monitor reliability and protect the service (e.g., metrics and rate-limiting).</li>
          </ul>
          <p className="mt-3">
            We do not currently run behavioral advertising or ad-tech profiling
            based on third-party tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Who Can Access Data
          </h2>
          <p>
            Some of your data is visible to other users as part of product
            features (for example username, avatar, public profile fields,
            reviews, and social interactions). Private account data is available
            only to authorized service operators on a need-to-know basis.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Service Providers And Integrations
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Google and GitHub are used when you choose OAuth sign-in.</li>
            <li>Cloudflare R2-compatible object storage is used for avatar uploads.</li>
            <li>An internal AI service receives search/recommendation requests and may receive your user id and search query for those features.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Your Rights And Controls
          </h2>
          <p>
            You can export your account data from your account endpoint, and you
            can request account deletion. You can also update profile fields,
            email, and password in account settings.
          </p>
          <p className="mt-2">
            Depending on your jurisdiction, you may have additional rights to
            access, correct, delete, or restrict processing of personal data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Data Retention
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access token cookie: short-lived session cookie (about 15 minutes).</li>
            <li>Refresh token cookie: persisted for about 7 days unless revoked earlier.</li>
            <li>Refresh token server record: stored as hash with expiry.</li>
            <li>Product data (reviews, lists, social links, messages, profile fields): retained until account deletion or required operational/legal retention periods.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Security
          </h2>
          <p>
            We use access controls, HTTPS deployment, authentication safeguards,
            and operational monitoring. No method of transmission or storage is
            perfectly secure, but we continuously improve our controls.
          </p>
        </section>

        <p className="text-sm mt-12 bg-muted p-4 rounded-lg border border-border">
          Last updated: April 15, 2026
        </p>
      </div>
    </div>
  );
}

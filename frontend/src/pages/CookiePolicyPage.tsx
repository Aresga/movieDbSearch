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
            What This Policy Covers
          </h2>
          <p>
            This page explains the cookies and similar browser storage used by
            MovieSearchDB today. We currently rely primarily on first-party,
            functional cookies needed for authentication and UI preferences.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Cookies We Use
          </h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-foreground">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Typical Lifetime</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="p-3 font-medium">access_token</td>
                  <td className="p-3">Essential auth cookie</td>
                  <td className="p-3">Keeps you signed in for API requests.</td>
                  <td className="p-3">About 15 minutes</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="p-3 font-medium">refresh_token</td>
                  <td className="p-3">Essential auth cookie</td>
                  <td className="p-3">Lets the app refresh sessions without forcing a new login.</td>
                  <td className="p-3">About 7 days</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="p-3 font-medium">sidebar_state</td>
                  <td className="p-3">Preference cookie</td>
                  <td className="p-3">Remembers sidebar expanded/collapsed UI state.</td>
                  <td className="p-3">7 days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Cookie Attributes
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Authentication cookies are set by the backend as HttpOnly and SameSite=Lax.</li>
            <li>Authentication cookies are set with Secure=true in login, OAuth, and 2FA verify flows.</li>
            <li>refresh_token is scoped to path /api/auth/refresh in login, OAuth, and 2FA verify flows.</li>
            <li>UI preference cookie (sidebar_state) is written in client-side JavaScript with SameSite=Lax, path=/, max-age=7 days, and Secure when served over HTTPS; it is not HttpOnly.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Similar Technologies (Non-Cookie Storage)
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>localStorage: stores selected UI theme (light/dark/system).</li>
            <li>Progressive Web App caching may store static assets for performance/offline behavior.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Third-Party Cookies
          </h2>
          <p>
            We do not currently deploy third-party advertising/tracking cookies
            in the core MovieSearchDB web app. If this changes, this page will
            be updated before or when those technologies are enabled.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Your Choices
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You can clear browser cookies and local storage at any time.</li>
            <li>Blocking essential auth cookies will prevent login/session features from working.</li>
            <li>Blocking preference/local storage may reset UI convenience features.</li>
          </ul>
        </section>

        <p className="text-sm mt-12 bg-muted p-4 rounded-lg border border-border">
          Last updated: April 18, 2026
        </p>
      </div>
    </div>
  );
}

import { LegalShell } from "@/components/legal/legal-shell";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" effective="May 1, 2026">
      <p>
        This policy explains what information Arnhemia collects, how it&apos;s
        used, and your choices.
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li>
          <strong>Account info:</strong> email, username, hashed password, and
          the invite code used to register.
        </li>
        <li>
          <strong>Profile content:</strong> avatar URL, status text, posts,
          messages, and reactions you create.
        </li>
        <li>
          <strong>Technical info:</strong> IP address (rotated and discarded
          after 30 days), browser, OS, and Databases access logs for abuse
          prevention.
        </li>
      </ul>

      <h2>2. What we don&apos;t collect</h2>
      <ul>
        <li>We never store your Riot or Valorant credentials.</li>
        <li>We don&apos;t sell or rent personal data to third parties.</li>
        <li>
          We don&apos;t track you across other websites with cookies or
          fingerprinting.
        </li>
      </ul>

      <h2>3. How we use it</h2>
      <p>
        Your data is used to deliver the Service: authenticate your account,
        enforce role and invite permissions, deliver notifications you opt
        into, and protect against abuse. That&apos;s it.
      </p>

      <h2>4. Discord linking</h2>
      <p>
        If you link Discord, we request only the <code>identify</code> scope.
        We don&apos;t read DMs, server messages, or your friends list.
      </p>

      <h2>5. Data deletion</h2>
      <p>
        You can delete your profile at any time from{" "}
        <a href="/settings">Preferences</a>. This removes your profile and all
        content created by you. Auth records are removed by request via a
        support ticket.
      </p>

      <h2>6. Security</h2>
      <p>
        Passwords are hashed via Supabase Auth (bcrypt). Database access is
        protected by row-level security policies. Infrastructure runs on
        Supabase and Vercel with TLS in transit.
      </p>

      <h2>7. Children</h2>
      <p>
        Arnhemia is not intended for users under 13. If we learn we&apos;ve
        collected data from a child under 13, we will delete it.
      </p>

      <h2>8. Contact</h2>
      <p>
        Open a ticket from <a href="/tickets">/tickets</a>.
      </p>
    </LegalShell>
  );
}

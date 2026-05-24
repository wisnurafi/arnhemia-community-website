import { LegalShell } from "@/components/legal/legal-shell";

export const metadata = { title: "Terms of Service" };

export default function TosPage() {
  return (
    <LegalShell title="Terms of Service" effective="May 1, 2026">
      <p>
        These Terms govern your access to and use of the Arnhemia community
        platform (&quot;the Service&quot;). By creating an account or using the
        Service, you agree to these Terms.
      </p>

      <h2>1. Eligibility & invites</h2>
      <p>
        Arnhemia is invite-only. Accounts may only be created with a valid
        invite code issued by an authorized member. Sharing or selling invite
        codes is prohibited and may result in account termination for both the
        inviter and invitee.
      </p>

      <h2>2. Conduct</h2>
      <ul>
        <li>No harassment, hate speech, or discrimination of any kind.</li>
        <li>No sharing of malware, exploits, or unauthorized access tools.</li>
        <li>No impersonation of staff, members, or external organizations.</li>
        <li>No spam, advertising, or off-topic mass posting.</li>
        <li>
          Respect privacy. Do not post personal information about others
          without their consent.
        </li>
      </ul>

      <h2>3. Account responsibility</h2>
      <p>
        You are responsible for maintaining the confidentiality of your
        credentials. Notify staff immediately of any unauthorized access.
      </p>

      <h2>4. Subscriptions & payments</h2>
      <p>
        Paid tiers grant access to additional features. Subscriptions renew
        automatically and may be cancelled at any time from your account
        settings. Refunds are evaluated case by case.
      </p>

      <h2>5. Loader & software</h2>
      <p>
        The Arnhemia loader is provided as-is. Use of any third-party game
        client is at your own risk and may violate the terms of service of that
        game. Arnhemia is not affiliated with Riot Games or any other
        publisher.
      </p>

      <h2>6. Termination</h2>
      <p>
        We reserve the right to suspend or terminate accounts for any violation
        of these Terms, at our sole discretion.
      </p>

      <h2>7. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the
        Service after changes constitutes acceptance of the new Terms.
      </p>

      <h2>8. Contact</h2>
      <p>
        Questions? Open a support ticket from <a href="/tickets">/tickets</a>{" "}
        or reach out to staff in the Discord.
      </p>
    </LegalShell>
  );
}
